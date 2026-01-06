package com.telusko.SecurityEx.controller;

import org.springframework.web.bind.annotation.*;

import com.telusko.SecurityEx.model.Employee;
import com.telusko.SecurityEx.service.EmployeeService;

import java.util.List;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/{companyId}")
    public List<Employee> getEmployees(@PathVariable Long companyId) {
        return employeeService.getEmployees(companyId);
    }

    @PostMapping("/{companyId}")
    public Employee addEmployee(@PathVariable Long companyId, @RequestBody Employee employee) {
        return employeeService.addEmployee(companyId, employee);
    }

    @PutMapping("/{employeeId}")
    public Employee updateEmployee(@PathVariable Long employeeId, @RequestBody Employee updatedEmployee) {
        return employeeService.updateEmployee(employeeId, updatedEmployee);
    }

    @DeleteMapping("/{employeeId}")
    public void deleteEmployee(@PathVariable Long employeeId) {
        employeeService.deleteEmployee(employeeId);
    }
}
