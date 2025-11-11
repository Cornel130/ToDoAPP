package org.example.backend.service;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.User;
import org.example.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserLogin {

    @Autowired
    private UserRepository userRepository;

    public boolean authenticateUser(UserDTO userDTO) {
        Optional<User> userOpt = userRepository.findByUsername(userDTO.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.getPassword().equals(userDTO.getPassword());
        }
        return false;
    }
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
