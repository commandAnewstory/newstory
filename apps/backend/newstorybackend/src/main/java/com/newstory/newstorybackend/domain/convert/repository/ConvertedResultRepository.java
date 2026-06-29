package com.newstory.newstorybackend.domain.convert.repository;

import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConvertedResultRepository extends JpaRepository<ConvertedResult, Long> {

    List<ConvertedResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ConvertedResult> findByArticleIdAndUserIdAndStyle(
        Long articleId, Long userId, String style
    );

    List<ConvertedResult> findByIsFeedTrueAndStyleOrderByCreatedAtDesc(String style);

    Page<ConvertedResult> findByIsFeedTrueAndStyleOrderByCreatedAtDesc(String style, Pageable pageable);
}
