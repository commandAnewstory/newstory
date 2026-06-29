package com.newstory.newstorybackend.domain.convert.service;

import com.newstory.newstorybackend.domain.convert.dto.FeedPageResponse;
import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import com.newstory.newstorybackend.domain.convert.repository.ConvertedResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final ConvertedResultRepository convertedResultRepository;

    @Transactional(readOnly = true)
    public FeedPageResponse getFeed(String style, int page, int size) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<ConvertedResult> resultPage =
                convertedResultRepository.findByIsFeedTrueAndStyleOrderByCreatedAtDesc(style, pageable);

        List<FeedPageResponse.FeedItemDto> items = resultPage.getContent().stream()
                .map(FeedPageResponse.FeedItemDto::new)
                .toList();

        return new FeedPageResponse(resultPage.getTotalElements(), page, size, items);
    }
}
