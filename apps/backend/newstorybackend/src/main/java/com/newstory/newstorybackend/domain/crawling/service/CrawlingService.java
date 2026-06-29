package com.newstory.newstorybackend.domain.crawling.service;

import com.newstory.newstorybackend.domain.crawling.dto.CrawledArticle;
import com.newstory.newstorybackend.global.exception.CrawlingException;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class CrawlingService {

    // 한국 주요 뉴스 사이트 본문 선택자 (우선순위 순)
    private static final String[] ARTICLE_SELECTORS = {
        "#articleBody", "#newsct_article", "#article-view-content-div",
        "#articeBody", "#article_body", "#newsEndContents", "#article_txt",
        "#cont_newstext", "#news_body_area", "#articleBodyContents",
        "article", ".article-body", ".article_body", ".article-content",
        ".news_end", ".news-article-body", ".article_txt", ".news_view",
        ".view_con", ".news-con", ".article__body", ".entry-content",
        "[class*=article][class*=body]", "[class*=article][class*=content]",
        "[id*=article][id*=body]", "[id*=article][id*=content]"
    };

    // 제거할 불필요 요소
    private static final String REMOVE_SELECTORS =
        "script, style, noscript, header, footer, nav, aside, " +
        ".ad, .ads, .advertisement, .banner, .popup, " +
        ".related, .recommend, .more-news, .popular, " +
        ".comment, .sns, .share, .copyright, .reporter-info, " +
        "[class*=sidebar], [class*=menu], [class*=navigation], " +
        "[class*=footer], [class*=header], [class*=banner], " +
        "[class*=popup], [id*=sidebar], [id*=footer], [id*=header]";

    private static final Safelist CLEAN_HTML = Safelist.relaxed()
        .addTags("figure", "figcaption")
        .preserveRelativeLinks(false);

    private static final List<String> BLOCKED_HOSTS = List.of(
        "youtube.com", "youtu.be", "instagram.com", "tiktok.com",
        "twitter.com", "x.com", "facebook.com", "fb.com", "threads.net"
    );

    public CrawledArticle crawl(String url) {
        String host;
        try {
            host = new java.net.URL(url).getHost();
        } catch (Exception e) {
            throw new CrawlingException("올바르지 않은 URL입니다.");
        }
        if (host == null) {
            throw new CrawlingException("올바르지 않은 URL입니다.");
        }
        String normalizedHost = host.replaceFirst("^www\\.", "").toLowerCase();
        for (String blocked : BLOCKED_HOSTS) {
            if (normalizedHost.equals(blocked) || normalizedHost.endsWith("." + blocked)) {
                throw new CrawlingException("지원하지 않는 사이트입니다.");
            }
        }

        try {
            Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .header("Referer", "https://news.naver.com/")
                .header("Cache-Control", "no-cache")
                .followRedirects(true)
                .timeout(15_000)
                .get();

            String title = extractTitle(doc);
            Element articleEl = findArticleElement(doc);

            // 불필요 요소 제거
            articleEl.select(REMOVE_SELECTORS).remove();

            // 이미지 절대 URL 변환 + 장식용 제거
            processImages(articleEl);

            // 이미지 URL 목록 추출 (개수 제한 없음)
            List<String> imageUrls = articleEl.select("img[src]").stream()
                .map(img -> img.attr("src"))
                .filter(src -> !src.isBlank())
                .distinct()
                .toList();

            // og:image fallback
            if (imageUrls.isEmpty()) {
                imageUrls = doc.select("meta[property=og:image]").stream()
                    .map(e -> e.attr("content"))
                    .filter(src -> !src.isBlank() && src.startsWith("http"))
                    .toList();
            }

            // 순수 텍스트 (AI 변환용)
            String content = articleEl.text();

            // 정제된 HTML (프론트 렌더링용)
            String contentHtml = Jsoup.clean(articleEl.outerHtml(), url, CLEAN_HTML);

            if (content.isBlank() || content.length() < 100) {
                throw new CrawlingException("기사 본문을 찾을 수 없습니다.");
            }

            return new CrawledArticle(title, content, contentHtml, url, imageUrls);

        } catch (CrawlingException e) {
            throw e;
        } catch (Exception e) {
            log.warn("크롤링 실패 - url: {}, error: {}", url, e.getMessage());
            throw new CrawlingException("해당 기사를 불러올 수 없습니다.");
        }
    }

    private String extractTitle(Document doc) {
        // og:title 우선
        String ogTitle = doc.select("meta[property=og:title]").attr("content");
        if (!ogTitle.isBlank()) return ogTitle;
        return doc.title();
    }

    private Element findArticleElement(Document doc) {
        // 1단계: 알려진 선택자 시도
        for (String selector : ARTICLE_SELECTORS) {
            Element el = doc.selectFirst(selector);
            if (el != null && el.text().length() > 150) {
                return el;
            }
        }

        // 2단계: 본문 밀도 기반 탐지
        // 먼저 명백한 비본문 영역 제거
        Document docCopy = doc.clone();
        docCopy.select("header, footer, nav, aside, " +
            "[class*=header], [class*=footer], [class*=nav], [class*=menu], " +
            "[class*=sidebar], [class*=banner], [class*=ad], script, style").remove();

        Elements candidates = docCopy.select("div, section, main");
        Element best = null;
        int bestScore = 0;

        for (Element el : candidates) {
            // 직접 자식 p 태그의 텍스트 길이 합산
            int pTextLen = el.select("> p").stream()
                .mapToInt(p -> p.text().length()).sum();
            // 전체 p 태그도 고려
            int allPTextLen = el.select("p").stream()
                .mapToInt(p -> p.text().length()).sum();
            int score = Math.max(pTextLen * 3, allPTextLen);

            if (score > bestScore && el.text().length() > 150) {
                bestScore = score;
                best = el;
            }
        }

        if (best != null) return best;

        // 3단계: body 전체 (최후 수단)
        return doc.body();
    }

    private void processImages(Element article) {
        article.select("img").forEach(img -> {
            // 절대 URL로 변환
            String absSrc = img.attr("abs:src");
            if (!absSrc.isBlank()) {
                img.attr("src", absSrc);
            }

            String src = img.attr("src");
            // 장식용 이미지 제거
            if (src.isBlank()
                || src.contains("logo")
                || src.contains("icon")
                || src.contains("banner")
                || src.endsWith(".gif")
                || src.endsWith(".svg")
                || src.contains("btn")
                || src.contains("bullet")) {
                img.remove();
            }
        });
    }
}
