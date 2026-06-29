package com.newstory.newstorybackend.domain.news.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "article_views")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ArticleView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @CreationTimestamp
    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt;

    public static ArticleView of(Long articleId) {
        ArticleView v = new ArticleView();
        v.articleId = articleId;
        return v;
    }
}
