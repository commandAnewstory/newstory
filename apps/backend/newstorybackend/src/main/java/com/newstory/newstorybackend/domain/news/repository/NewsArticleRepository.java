package com.newstory.newstorybackend.domain.news.repository;

import com.newstory.newstorybackend.domain.news.entity.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    boolean existsByUrl(String url);

    Optional<NewsArticle> findByUrl(String url);

    Page<NewsArticle> findAllByOrderByPublishedAtDesc(Pageable pageable);
}
