package com.telusko.SecurityEx.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.telusko.SecurityEx.model.Company;

@Repository
public interface CompanyRepo extends JpaRepository<Company, Long> {
}