package com.telusko.SecurityEx.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.telusko.SecurityEx.exception.ResourceNotFoundException;
import com.telusko.SecurityEx.model.Company;
import com.telusko.SecurityEx.model.Users;
import com.telusko.SecurityEx.repo.CompanyRepo;
import com.telusko.SecurityEx.repo.UserRepo;

import java.util.List;


@Service
public class CompanyService {

    @Autowired
    private CompanyRepo companyRepo;

    @Autowired
    private UserRepo userRepo;

    public Long getCompanyIdByUsername() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);
        if (user != null && user.getCompany() != null) {
            return user.getCompany().getId();
        } else {
            throw new ResourceNotFoundException("Company not associated with user");
        }
    }

    /** Only accessible to users associated with the company or to admins. **/
    @Transactional
    public Company getCompanyDetails(Long companyId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);
        if (user.getRole().equals("ADMIN") || (user.getCompany().getId().equals(companyId))) {
            return companyRepo.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }

    /** Only accessible to users associated with the company or to admins. **/
    @Transactional
    public Company updateCompanyDetails(Long companyId, Company updatedCompany) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (user.getRole().equals("ADMIN") || (user.getCompany().getId().equals(companyId))) {
            if (updatedCompany.getCompanyName() != null) {
                company.setCompanyName(updatedCompany.getCompanyName());
            }
            if (updatedCompany.getCapacity() != null) {
                company.setCapacity(updatedCompany.getCapacity());
            }
            if (updatedCompany.getLocation() != null) {
                company.setLocation(updatedCompany.getLocation());
            }
            return companyRepo.save(company);
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }

    /** Only accessible to Admin **/
    public List<Company> getAllCompanies() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        if (!"ADMIN".equals(user.getRole())) {
            throw new AccessDeniedException("Only admin can access all companies");
        }
        return companyRepo.findAll();
    }

    public void deleteCompany(Long companyId) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        if (user.getRole().equals("ADMIN")) {
            companyRepo.delete(company);
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }
}
