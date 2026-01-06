package com.telusko.SecurityEx.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String grade;
    private String name;
    private String dept;
    private double salary;

    @ManyToOne(fetch = FetchType.LAZY) // Many employees can belong to one company
    @JoinColumn(name = "company_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference
    private Company company;
}
