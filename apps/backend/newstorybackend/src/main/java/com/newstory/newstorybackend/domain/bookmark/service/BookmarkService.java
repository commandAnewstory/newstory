package com.newstory.newstorybackend.domain.bookmark.service;

import com.newstory.newstorybackend.domain.bookmark.dto.BookmarkResponse;
import com.newstory.newstorybackend.domain.bookmark.entity.Bookmark;
import com.newstory.newstorybackend.domain.bookmark.repository.BookmarkRepository;
import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import com.newstory.newstorybackend.domain.convert.repository.ConvertedResultRepository;
import com.newstory.newstorybackend.domain.user.entity.User;
import com.newstory.newstorybackend.global.exception.ConflictException;
import com.newstory.newstorybackend.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final ConvertedResultRepository convertedResultRepository;

    @Transactional(readOnly = true)
    public BookmarkResponse getBookmarks(User user) {
        List<Bookmark> bookmarks =
                bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        List<BookmarkResponse.BookmarkItem> items = bookmarks.stream()
                .map(BookmarkResponse.BookmarkItem::new)
                .toList();

        return new BookmarkResponse(items);
    }

    @Transactional
    public void saveBookmark(Long resultId, User user) {
        if (bookmarkRepository.existsByUserIdAndResultId(user.getId(), resultId)) {
            throw new ConflictException("이미 보관함에 저장된 항목입니다.");
        }

        ConvertedResult result = convertedResultRepository.findById(resultId)
                .orElseThrow(() -> new NotFoundException("변환 결과를 찾을 수 없습니다."));

        bookmarkRepository.save(Bookmark.builder()
                .user(user)
                .result(result)
                .build());
    }

    @Transactional
    public void deleteBookmark(Long resultId, User user) {
        Bookmark bookmark = bookmarkRepository.findByUserIdAndResultId(user.getId(), resultId)
                .orElseThrow(() -> new NotFoundException("보관함에 존재하지 않는 항목입니다."));

        bookmarkRepository.delete(bookmark);
    }
}
