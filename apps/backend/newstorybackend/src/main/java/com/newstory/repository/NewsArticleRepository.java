package com.newstory.repository;

import com.newstory.domain.NewsArticle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    boolean existsByUrl(String url);

    Optional<NewsArticle> findByUrl(String url);

    List<NewsArticle> findAllByOrderByPublishedAtDesc(Pageable pageable);
}