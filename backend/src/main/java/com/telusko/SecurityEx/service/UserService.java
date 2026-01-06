package com.telusko.SecurityEx.service;

import com.telusko.SecurityEx.dto.LoginDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.telusko.SecurityEx.dto.RegistrationDto;
import com.telusko.SecurityEx.model.Company;
import com.telusko.SecurityEx.model.Users;
import com.telusko.SecurityEx.repo.UserRepo;

import jakarta.transaction.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AuthenticationManager authManager;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Autowired
    private JWTService jwtService;
    
    @Transactional
    public ResponseEntity<?> register(RegistrationDto registrationDto) {
        if (userRepo.existsByUsername(registrationDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }
        
        // Create and save user
        Users newUser = new Users();
        newUser.setUsername(registrationDto.getUsername());
        newUser.setPassword(encoder.encode(registrationDto.getPassword()));
        newUser.setRole("USER");
        
        // Create company and link to user
        Company company = new Company();
        company.setCompanyName(registrationDto.getCompanyName());
        company.setCapacity(registrationDto.getCapacity());
        company.setLocation(registrationDto.getLocation());
        company.setUser(newUser); // Link the user to the company
        newUser.setCompany(company); // Link the company to the user
        
        // Save user (cascades save to company due to CascadeType.ALL)
        userRepo.save(newUser);

//        return ResponseEntity.ok("User registered successfully");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    public Map<String, String> verify(LoginDto user) {
        Authentication authentication =
                authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

        if(authentication.isAuthenticated()) {
            Users users = userRepo.findByUsername(user.getUsername());
            String role = users.getRole();
            String token = jwtService.generateToken(user.getUsername(),role);
            Map<String, String> response = new HashMap<>();
            response.put("token", token); // Return the token inside a map as JSON
            return response;
        }

        // Optionally, return an error message
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Authentication failed");
        return errorResponse;
    }


}
