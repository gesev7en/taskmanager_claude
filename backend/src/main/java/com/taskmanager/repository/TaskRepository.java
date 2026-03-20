package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByCategory(String category);

    @Query("SELECT DISTINCT t.category FROM Task t WHERE t.category IS NOT NULL AND t.category != ''")
    List<String> findDistinctCategories();

    @Query("SELECT t FROM Task t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Task> searchTasks(@Param("query") String query);

    List<Task> findAllByOrderByDueDateAsc();

    List<Task> findAllByOrderByStatusAsc();
}
