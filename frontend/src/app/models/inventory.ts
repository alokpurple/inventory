export interface Inventory {
    id: number;
    productName: string;
    description: string;
    qtyInStock: number;   // Maps directly to closingStock for simplicity
    price: number;        // The cost per unit
    stockValue: number;   // Calculated as closingStock * price

    reorderPoint: number; // The threshold for triggering stock replenishment
    
    openingStock: number; // Tracks the initial stock at the start of the period
    receipts: number;     // Tracks the quantity received during the period
    issues: number;       // Tracks the quantity issued during the period
    closingStock: number; // Calculated as openingStock + receipts - issues

    minimumStock: number; // The minimum threshold to avoid stockouts
    bufferStock: number;
    isReorder: string;
}
