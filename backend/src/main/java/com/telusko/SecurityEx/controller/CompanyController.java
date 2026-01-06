package com.telusko.SecurityEx.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.telusko.SecurityEx.model.Company;
import com.telusko.SecurityEx.service.CompanyService;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/user-company-id")
    public ResponseEntity<Long> getCompanyIdForAuthenticatedUser() {
        return ResponseEntity.ok(companyService.getCompanyIdByUsername());
    }

    @GetMapping("/{companyId}")
    public Company getCompanyDetails(@PathVariable Long companyId) {
        return companyService.getCompanyDetails(companyId);
    }

    @PutMapping("/{companyId}")
    public Company updateCompanyDetails(@PathVariable Long companyId, @RequestBody Company updatedCompany) {
        return companyService.updateCompanyDetails(companyId, updatedCompany);
    }

    @DeleteMapping("/{companyId}")
    public void deleteCompany(@PathVariable Long companyId) {
        companyService.deleteCompany(companyId);
    }

    @GetMapping("/all")
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }
}
