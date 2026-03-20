package com.taskmanager.service;

import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskRequest;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }

    public Task createTask(TaskRequest request) {
        Task task = new Task(
                request.getTitle(),
                request.getDescription(),
                request.getStatus() != null ? request.getStatus() : TaskStatus.TODO,
                request.getDueDate(),
                request.getCategory()
        );
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        task.setDueDate(request.getDueDate());
        task.setCategory(request.getCategory());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksByCategory(String category) {
        return taskRepository.findByCategory(category);
    }

    public List<String> getAllCategories() {
        return taskRepository.findDistinctCategories();
    }

    public List<Task> searchTasks(String query) {
        return taskRepository.searchTasks(query);
    }

    public List<Task> getTasksSortedByDueDate() {
        return taskRepository.findAllByOrderByDueDateAsc();
    }

    public List<Task> getTasksSortedByStatus() {
        return taskRepository.findAllByOrderByStatusAsc();
    }
}
