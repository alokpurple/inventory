package com.telusko.SecurityEx.controller;

import com.telusko.SecurityEx.dto.LoginDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.telusko.SecurityEx.dto.RegistrationDto;
import com.telusko.SecurityEx.model.Users;
import com.telusko.SecurityEx.repo.UserRepo;
import com.telusko.SecurityEx.service.UserService;

import java.util.Map;

@RestController
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepo userRepo;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationDto registrationDto){
        return userService.register(registrationDto);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginDto loginDto) {
        Map<String, String> response = userService.verify(loginDto);

        if (response.containsKey("token")) {
            // Success - Return the token in the response with HTTP status 200 (OK)
            return ResponseEntity.ok(response);
        } else {
            // Failure - Return an error message with HTTP status 401 (Unauthorized)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }



    @GetMapping("/viewUser")
    public Users viewUser(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username);
    }
}
