package com.newstory.newstorybackend.domain.convert.service;

import com.newstory.newstorybackend.domain.ai.client.ClaudeApiClient;
import com.newstory.newstorybackend.domain.ai.dto.VerificationResult;
import com.newstory.newstorybackend.domain.convert.dto.ConvertRequest;
import com.newstory.newstorybackend.domain.convert.dto.ConvertResponse;
import com.newstory.newstorybackend.domain.convert.dto.OriginalArticleResponse;
import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import com.newstory.newstorybackend.domain.convert.repository.ConvertedResultRepository;
import com.newstory.newstorybackend.domain.crawling.dto.CrawledArticle;
import com.newstory.newstorybackend.domain.crawling.service.CrawlingService;
import com.newstory.newstorybackend.domain.news.entity.NewsArticle;
import com.newstory.newstorybackend.domain.news.repository.NewsArticleRepository;
import com.newstory.newstorybackend.domain.user.entity.User;
import com.newstory.newstorybackend.global.exception.BusinessException;
import com.newstory.newstorybackend.global.exception.NotFoundException;
import com.newstory.newstorybackend.global.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConvertService {

    private static final int MAX_RETRY = 3;

    private final CrawlingService crawlingService;
    private final ClaudeApiClient claudeApiClient;
    private final NewsArticleRepository newsArticleRepository;
    private final ConvertedResultRepository convertedResultRepository;

    public OriginalArticleResponse getOriginal(String url) {
        CrawledArticle article = crawlingService.crawl(url);
        return new OriginalArticleResponse(
                article.getTitle(), article.getContent(), article.getOriginalUrl());
    }

    @Transactional
    public ConvertResponse convert(ConvertRequest request, User user) {
        CrawledArticle crawled = crawlingService.crawl(request.getUrl());

        NewsArticle article = newsArticleRepository.findByUrl(request.getUrl())
                .orElseGet(() -> newsArticleRepository.save(
                        NewsArticle.builder()
                                .url(request.getUrl())
                                .title(crawled.getTitle())
                                .build()
                ));

        String convertedText = null;
        int retryCount = 0;
        boolean verificationPassed = false;
        String issues = null;

        while (retryCount < MAX_RETRY) {
            String prompt = retryCount == 0
                    ? crawled.getContent()
                    : crawled.getContent() + "\n\n[이전 변환에서 발견된 문제 — 반드시 수정할 것]\n" + issues;

            convertedText = claudeApiClient.convert(prompt, request.getStyle());
            VerificationResult result = claudeApiClient.verify(crawled.getContent(), convertedText);

            if (result.isPassed()) {
                verificationPassed = true;
                break;
            }

            issues = result.getRawResponse();
            retryCount++;
            log.warn("변환 검증 실패 ({}/{}): {}", retryCount, MAX_RETRY, issues);
        }

        if (!verificationPassed) {
            throw new BusinessException("변환 중 오류가 발생했습니다. 다시 시도해 주세요.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        ConvertedResult result = ConvertedResult.builder()
                .article(article)
                .user(user)
                .style(request.getStyle())
                .convertedText(convertedText)
                .verificationPassed(true)
                .retryCount(retryCount)
                .isFeed(false)
                .build();

        return new ConvertResponse(convertedResultRepository.save(result));
    }

    @Transactional(readOnly = true)
    public ConvertResponse getResult(Long resultId, User user) {
        ConvertedResult result = convertedResultRepository.findById(resultId)
                .orElseThrow(() -> new NotFoundException("변환 결과를 찾을 수 없습니다."));

        if (result.getUser() == null || !result.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("접근 권한이 없습니다.");
        }

        return new ConvertResponse(result);
    }
}
