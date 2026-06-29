package com.newstory.newstorybackend.domain.news.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsInitializer implements ApplicationRunner {

    private final NewsService newsService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("앱 시작 - 뉴스 수집 시작");
        newsService.collectNews(20);
        log.info("앱 시작 - 뉴스 수집 완료");
    }
}
