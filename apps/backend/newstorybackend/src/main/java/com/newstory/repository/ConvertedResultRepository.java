package com.newstory.repository;

import com.newstory.domain.ConvertedResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConvertedResultRepository extends JpaRepository<ConvertedResult, Long> {

    List<ConvertedResult> findByIsFeedTrueAndStyleOrderByCreatedAtDesc(String style);

    List<ConvertedResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ConvertedResult> findByArticleIdAndUserIdAndStyle(
        Long articleId, Long userId, String style
    );
}