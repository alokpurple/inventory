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
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;
    private String description;
    private Integer qtyInStock;
    private double price;
    private Double stockValue; // Calculated as closingStock * price

    private Integer reorderPoint; // Calculated based on minimum stock and lead time
    
    private Integer openingStock;
    private Integer receipts;
    private Integer issues;
    private Integer closingStock;

    private Integer minimumStock; // Minimum stock level to avoid stockouts
    private Integer bufferStock; // Stock maintained to prevent stockouts due to demand fluctuations or delays in supply.
    private String isReorder; // Calculated from reorderPoint: 1 if qtyInStock < reorderPoint else 0

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference
    private Company company;
}
