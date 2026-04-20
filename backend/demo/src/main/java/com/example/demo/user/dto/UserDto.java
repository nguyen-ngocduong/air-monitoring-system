package com.example.demo.user.dto;

import java.time.LocalDateTime;
import com.example.demo.user.enums.UserEnum;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private UserEnum role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
