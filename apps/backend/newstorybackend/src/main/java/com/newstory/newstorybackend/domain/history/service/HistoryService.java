package com.newstory.newstorybackend.domain.history.service;

import com.newstory.newstorybackend.domain.convert.entity.ConvertedResult;
import com.newstory.newstorybackend.domain.convert.repository.ConvertedResultRepository;
import com.newstory.newstorybackend.domain.history.dto.HistoryResponse;
import com.newstory.newstorybackend.domain.user.entity.User;
import com.newstory.newstorybackend.global.exception.NotFoundException;
import com.newstory.newstorybackend.global.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final ConvertedResultRepository convertedResultRepository;

    @Transactional(readOnly = true)
    public HistoryResponse getHistory(User user) {
        List<ConvertedResult> results =
                convertedResultRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        List<HistoryResponse.HistoryItem> items = results.stream()
                .map(HistoryResponse.HistoryItem::new)
                .toList();

        return new HistoryResponse(items);
    }

    @Transactional
    public void deleteHistory(Long resultId, User user) {
        ConvertedResult result = convertedResultRepository.findById(resultId)
                .orElseThrow(() -> new NotFoundException("히스토리에 존재하지 않는 항목입니다."));

        if (result.getUser() == null || !result.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("접근 권한이 없습니다.");
        }

        convertedResultRepository.delete(result);
    }
}
