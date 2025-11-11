package org.example.backend.controller;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.User;
import org.example.backend.service.UserLogin;
import org.example.backend.service.UserRegister;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRegister userRegister;

    @Autowired
    private UserLogin userAuthenticate;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDTO dto) {
        logger.info("🔵 Received user to register: {}", dto.getUsername());

        String result = userRegister.register(dto);

        if (result.equals("Username already exists") || result.equals("Email already exists")) {
            logger.warn("⚠️ Registration failed: {}", result);
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", result));
        }

        logger.info("🟢 {}", result);
        return ResponseEntity.ok(Collections.singletonMap("message", result));
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserDTO userDTO) {
        boolean authenticated = userAuthenticate.authenticateUser(userDTO);

        if (authenticated) {
            User user = userAuthenticate.getUserByUsername(userDTO.getUsername());

            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("User not found after authentication");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }
    }
}
