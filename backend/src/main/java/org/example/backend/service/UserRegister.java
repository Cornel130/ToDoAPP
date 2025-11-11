package org.example.backend.service;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.User;
import org.example.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRegister {

    @Autowired
    private UserRepository userRepo;

    public String register(UserDTO dto) {
        if (userRepo.existsByUsername(dto.getUsername())) {
            return "Username already exists";
        }

        if (userRepo.existsByEmail(dto.getEmail())) {
            return "Email already exists";
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());

        userRepo.save(user);
        return "User registered successfully";
    }
}
