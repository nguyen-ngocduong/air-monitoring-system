package com.example.demo.user.service;

import com.example.demo.user.dto.UserDto;
import com.example.demo.user.entity.User;
import com.example.demo.user.enums.UserEnum;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Unauthorized");
        }
        return (User) authentication.getPrincipal();
    }

    public void validateAdmin(User user) {
        if (user.getRole() != UserEnum.ADMIN) {
            throw new RuntimeException("Only admin can perform this action!");
        }
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        // User currentUser = getCurrentUser();
        // validateAdmin(currentUser);
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById() {
        User currentUser = getCurrentUser();
        Long id = currentUser.getId();
        return userRepository.findById(id)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional
    public UserDto createUser(UserDto userDto, String password) {
        User currentUser = getCurrentUser();
        validateAdmin(currentUser);
        User user = User.builder()
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(password))
                .role(userDto.getRole())
                .build();
        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(UserDto userDto) {
        User currentUser = getCurrentUser();
        // validateAdmin(currentUser);
        Long id = currentUser.getId();
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(userDto.getUsername());
                    user.setEmail(userDto.getEmail());
                    user.setRole(userDto.getRole());
                    User updatedUser = userRepository.save(user);
                    return mapToDto(updatedUser);
                })
                .orElse(null);
    }

    @Transactional
    public void deleteUser(Long id) {
        User currentUser = getCurrentUser();
        validateAdmin(currentUser);
        userRepository.deleteById(id);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
