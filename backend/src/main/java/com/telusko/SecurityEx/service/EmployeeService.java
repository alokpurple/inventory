package com.telusko.SecurityEx.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.telusko.SecurityEx.exception.ResourceNotFoundException;
import com.telusko.SecurityEx.model.Company;
import com.telusko.SecurityEx.model.Employee;
import com.telusko.SecurityEx.model.Users;
import com.telusko.SecurityEx.repo.CompanyRepo;
import com.telusko.SecurityEx.repo.EmployeeRepo;
import com.telusko.SecurityEx.repo.UserRepo;

import java.util.List;

@Service
public class EmployeeService{

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private CompanyRepo companyRepo;

    @Autowired
    private UserRepo userRepo;

    public List<Employee> getEmployees(Long companyId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        if (user.getRole().equals("ADMIN") || user.getCompany().getId().equals(companyId)) {
            Company company = companyRepo.findById(companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            return employeeRepo.findByCompany(company);
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }

    public Employee addEmployee(Long companyId, Employee employee) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (user.getRole().equals("ADMIN") || user.getCompany().getId().equals(companyId)) {
            employee.setCompany(company);
            return employeeRepo.save(employee);
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }

    public Employee updateEmployee(Long employeeId, Employee updatedEmployee) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        if (user.getRole().equals("ADMIN") || employee.getCompany().getId().equals(user.getCompany().getId())) {

            if (updatedEmployee.getName() != null) {
                employee.setName(updatedEmployee.getName());
            }
            if (updatedEmployee.getGrade() != null) {
                employee.setGrade(updatedEmployee.getGrade());
            }
            if (updatedEmployee.getDept() != null) {
                employee.setDept(updatedEmployee.getDept());
            }
            if (updatedEmployee.getSalary() != 0) {
                employee.setSalary(updatedEmployee.getSalary());
            }
            return employeeRepo.save(employee);
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }

    public void deleteEmployee(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepo.findByUsername(username);

        if (user.getRole().equals("ADMIN") || employee.getCompany().getId().equals(user.getCompany().getId())) {
            employeeRepo.delete(employee);
        } else {
            throw new AccessDeniedException("Unauthorized access");
        }
    }
}
