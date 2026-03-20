package com.taskmanager.service;

import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskRequest;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task("Test Task", "A description", TaskStatus.TODO, LocalDate.now().plusDays(3), "Work");
        sampleTask.setId(1L);
    }

    @Test
    void getAllTasks_shouldReturnAllTasks() {
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask));

        List<Task> result = taskService.getAllTasks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Task");
        verify(taskRepository, times(1)).findAll();
    }

    @Test
    void getTaskById_existingId_shouldReturnTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        Task result = taskService.getTaskById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Test Task");
    }

    @Test
    void getTaskById_nonExistingId_shouldThrowException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(99L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createTask_validRequest_shouldReturnSavedTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setDescription("New Description");
        request.setStatus(TaskStatus.TODO);
        request.setDueDate(LocalDate.now().plusDays(5));
        request.setCategory("Personal");

        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        Task result = taskService.createTask(request);

        assertThat(result).isNotNull();
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void updateTask_existingId_shouldReturnUpdatedTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Updated Title");
        request.setStatus(TaskStatus.IN_PROGRESS);

        Task updatedTask = new Task("Updated Title", null, TaskStatus.IN_PROGRESS, null, null);
        updatedTask.setId(1L);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        Task result = taskService.updateTask(1L, request);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void deleteTask_existingId_shouldDeleteSuccessfully() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).delete(sampleTask);

        assertThatCode(() -> taskService.deleteTask(1L)).doesNotThrowAnyException();

        verify(taskRepository, times(1)).delete(sampleTask);
    }

    @Test
    void deleteTask_nonExistingId_shouldThrowException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(99L))
                .isInstanceOf(TaskNotFoundException.class);
    }

    @Test
    void searchTasks_shouldReturnMatchingTasks() {
        when(taskRepository.searchTasks("Test")).thenReturn(List.of(sampleTask));

        List<Task> result = taskService.searchTasks("Test");

        assertThat(result).hasSize(1);
    }
}
