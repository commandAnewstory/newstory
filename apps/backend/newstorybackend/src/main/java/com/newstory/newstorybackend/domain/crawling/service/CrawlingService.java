package com.newstory.newstorybackend.domain.crawling.service;

import com.newstory.newstorybackend.domain.crawling.dto.CrawledArticle;
import com.newstory.newstorybackend.global.exception.CrawlingException;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CrawlingService {

    public CrawledArticle crawl(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(10_000)
                    .get();

            String title = doc.title();
            String content = doc.select(
                    "article, .article-body, #articleBody, .news_end, #newsct_article"
            ).text();

            if (content.isBlank()) {
                content = doc.body().text();
            }

            return new CrawledArticle(title, content, url);
        } catch (Exception e) {
            log.warn("크롤링 실패 - url: {}, error: {}", url, e.getMessage());
            throw new CrawlingException("해당 기사를 불러올 수 없습니다.");
        }
    }
}
