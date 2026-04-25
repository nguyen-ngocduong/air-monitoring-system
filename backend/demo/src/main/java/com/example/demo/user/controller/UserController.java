package com.example.demo.user.controller;

import com.example.demo.user.dto.UserDto;
import com.example.demo.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing user accounts")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve a list of all registered users (Admin only)")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve detailed information about a specific user by their ID")
    public ResponseEntity<UserDto> getUserById() {
        UserDto user = userService.getUserById();
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Cập nhật thông tin cá nhân (Profile) của người dùng đang đăng nhập
     */
    @PutMapping("/profile")
    @Operation(summary = "Update current user profile", description = "Update username, email, and other info for the currently authenticated user")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateUser(userDto);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Delete a user account by their ID (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}