package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskRequest;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.service.TaskService;
import com.taskmanager.exception.TaskNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task("Test Task", "A description", TaskStatus.TODO, LocalDate.now().plusDays(3), "Work");
        sampleTask.setId(1L);
    }

    @Test
    void GET_allTasks_shouldReturn200() throws Exception {
        when(taskService.getAllTasks()).thenReturn(List.of(sampleTask));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Test
    void GET_taskById_existingId_shouldReturn200() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(sampleTask);

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void GET_taskById_nonExistingId_shouldReturn404() throws Exception {
        when(taskService.getTaskById(99L)).thenThrow(new TaskNotFoundException("Task not found with id: 99"));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task not found with id: 99"));
    }

    @Test
    void POST_createTask_validRequest_shouldReturn201() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setStatus(TaskStatus.TODO);

        when(taskService.createTask(any(TaskRequest.class))).thenReturn(sampleTask);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void POST_createTask_blankTitle_shouldReturn400() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("");

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    void PUT_updateTask_existingId_shouldReturn200() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("Updated Task");
        request.setStatus(TaskStatus.IN_PROGRESS);

        Task updated = new Task("Updated Task", null, TaskStatus.IN_PROGRESS, null, null);
        updated.setId(1L);

        when(taskService.updateTask(eq(1L), any(TaskRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void DELETE_task_existingId_shouldReturn204() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService, times(1)).deleteTask(1L);
    }

    @Test
    void DELETE_task_nonExistingId_shouldReturn404() throws Exception {
        doThrow(new TaskNotFoundException("Task not found with id: 99"))
                .when(taskService).deleteTask(99L);

        mockMvc.perform(delete("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }
}
