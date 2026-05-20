package com.newstory.repository;

import com.newstory.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndResultId(Long userId, Long resultId);

    Optional<Bookmark> findByUserIdAndResultId(Long userId, Long resultId);
}