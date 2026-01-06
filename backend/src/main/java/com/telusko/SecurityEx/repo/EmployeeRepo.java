package com.telusko.SecurityEx.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.telusko.SecurityEx.model.Company;
import com.telusko.SecurityEx.model.Employee;

import java.util.List;

public interface EmployeeRepo extends JpaRepository<Employee, Long> {
    List<Employee> findByCompany(Company company);
}
