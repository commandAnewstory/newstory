-- converted_results.user_id: NOT NULL 제거 (피드 변환 결과는 user 없음)
ALTER TABLE converted_results ALTER COLUMN user_id DROP NOT NULL;

-- bookmarks.result_id: ON DELETE CASCADE 추가 (히스토리 삭제 시 북마크 자동 삭제)
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_result_id_fkey;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_result_id_fkey
    FOREIGN KEY (result_id) REFERENCES converted_results(id) ON DELETE CASCADE;
