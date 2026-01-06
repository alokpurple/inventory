package com.telusko.SecurityEx.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryDto {
    private String productName;
    private String description;
    private Integer minimumStock; // Minimum stock level to avoid stockouts
    private double price;
    private Integer receipts;
    private Integer issues;
    private Integer openingStock;
    private Integer bufferStock;
}
