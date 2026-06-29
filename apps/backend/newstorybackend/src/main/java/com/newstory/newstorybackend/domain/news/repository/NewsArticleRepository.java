package com.newstory.newstorybackend.domain.news.repository;

import com.newstory.newstorybackend.domain.news.entity.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    boolean existsByUrl(String url);

    Optional<NewsArticle> findByUrl(String url);

    // 날짜 없으면 created_at 기준, 전체 정렬
    @Query("SELECT a FROM NewsArticle a ORDER BY COALESCE(a.publishedAt, a.createdAt) DESC, a.id DESC")
    Page<NewsArticle> findAllSortedByLatest(Pageable pageable);

    @Query(value = """
            SELECT a.*, COUNT(v.id) AS vc
            FROM news_articles a
            LEFT JOIN article_views v ON a.id = v.article_id
              AND v.viewed_at >= NOW() - INTERVAL '7 days'
            WHERE a.published_at IS NULL OR a.published_at >= NOW() - INTERVAL '90 days'
            GROUP BY a.id
            HAVING COUNT(v.id) > 0
            ORDER BY vc DESC
            LIMIT 5
            """, nativeQuery = true)
    List<NewsArticle> findPopularThisWeek();
}
