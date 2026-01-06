import { Component, ElementRef, ViewChild } from '@angular/core';
import { InventoryService } from '../../../_services/inventory/inventory.service';
import { CompanyService } from '../../../_services/company/company.service';
import { Company } from '../../../models/company';
import { Inventory } from '../../../models/inventory';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent {
  @ViewChild('editInventoryModal') editInventoryModalRef!: ElementRef;
  @ViewChild('addInventoryModal') addInventoryModalRef!: ElementRef;
  @ViewChild('viewInventoryModal') viewInventoryModalRef!: ElementRef;
  @ViewChild('descriptionModal') descriptionModalRef!: ElementRef;
  
  companyDetails: Company | null = null;
  inventories: Inventory[] = [];
  filteredInventories: Inventory[] = [];
  selectedInventory: Inventory | null = null;
  newInventory: Inventory = {
    id: 0,
    productName: '',
    description: '',
    qtyInStock: 0,
    price: 0,
    stockValue: 0,
    reorderPoint: 0,
    openingStock: 0,
    receipts: 0,
    issues: 0,
    closingStock: 0,
    minimumStock: 0,
    bufferStock: 0,
    isReorder: '',
  };
  errorMessage: string = '';
  searchTerm: string = '';
  showOutOfStock: boolean = false;
  showIsOrder: boolean = false;
  showMinStockAlert: boolean = false;  // New flag for reorder point
  companyId: number = 0;
  private editModalInstance: Modal | null = null;
  private addModalInstance: Modal | null = null;
  private viewModalInstance: Modal | null = null;
  private descriptionModalInstance: Modal | null = null;
  selectedDescription: string = '';

  constructor(
    private companyService: CompanyService, 
    private inventoryService: InventoryService, 
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const companyId = Number(this.route.snapshot.paramMap.get('companyId'));
    if (companyId) {
      this.companyId = companyId;
      this.fetchInventoriesByCompanyId(companyId);
    } else {
      this.fetchInventories();
    }
  }

  private fetchInventoriesByCompanyId(companyId: number): void {
    this.inventoryService.getInventory(companyId).subscribe({
      next: (data) => {
        this.inventories = data;
        this.filteredInventories = [...this.inventories];  // initialize filtered list
      },
      error: (error) => {
        console.error('Error fetching inventory list', error);
        if (error.status === 401) { 
          this.router.navigate(['/forbidden']); 
        } else {
          this.errorMessage = 'Failed to load inventory details. Please try again.';
        }
      },
    });

    this.companyService.getCompanyDetails(companyId).subscribe({
      next: (company) => {
        this.companyDetails = company;
      },
      error: (error) => {
        console.error('Error fetching company details', error);
        if (error.status === 401) { 
          this.router.navigate(['/forbidden']); 
        } else {
          this.errorMessage = 'Failed to load company details. Please try again.';
        }
      },
    });
  }

  private fetchInventories(): void {
    this.companyService.getUserCompanyId().subscribe({
      next: (companyId) => {
        this.companyId = companyId;
        this.fetchInventoriesByCompanyId(companyId);
      },
      error: (error) => {
        console.error('Error fetching company ID', error);
        this.errorMessage = 'Could not retrieve company or inventory information. Please try again.';
      },
    });
  }

  /* MODALS */

  //EDIT
  onEditInventory(inventory: Inventory): void {
    this.selectedInventory = { ...inventory }; // Clone the selected inventory data
    if (this.editInventoryModalRef) {
      this.editModalInstance = new Modal(this.editInventoryModalRef.nativeElement, {});
      this.editModalInstance.show();
    }
  }

  closeEditModal(): void {
    this.editModalInstance?.hide();
    this.editModalInstance = null;
    this.selectedInventory = null;
  }

  //VIEW
  onViewInventory(inventory: Inventory): void {
    this.selectedInventory = { ...inventory }; // Clone the selected inventory data
    if (this.viewInventoryModalRef) {
      this.viewModalInstance = new Modal(this.viewInventoryModalRef.nativeElement, {});
      this.viewModalInstance.show();
    }
  }

  closeViewModal(): void {
    this.viewModalInstance?.hide();
    this.viewModalInstance = null;
    this.selectedInventory = null;
  }

  //ADD
  openAddInventoryModal(): void {
    if (this.addInventoryModalRef) {
      this.addModalInstance = new Modal(this.addInventoryModalRef.nativeElement, {});
      this.addModalInstance.show();
    }
  }

  closeAddModal(): void {
    this.addModalInstance?.hide();
    this.addModalInstance = null;
  }

  //VIEW DESCRIPTION
  viewDescription(description: string): void {
    this.selectedDescription = description;

    if (this.descriptionModalRef) {
      this.descriptionModalInstance = new Modal(
        this.descriptionModalRef.nativeElement,
        {}
      );
      this.descriptionModalInstance.show();
    }
  }

  closeDescriptionModal(): void {
    this.descriptionModalInstance?.hide();
    this.descriptionModalInstance = null;
  }

  /* METHODS */

  //UPDATE
  onUpdateInventory(
      productName: string,
      description: string, 
      price: any,
      receipts: any,
      issues: any,
      minimumStock: any,
      bufferStock: any,
    ): void {
    if (!this.selectedInventory) return;
    this.selectedInventory = { 
      ...this.selectedInventory, 
      productName,
      description,
      price,
      receipts,
      issues,
      minimumStock,
      bufferStock
    };
  
    this.inventoryService.updateInventory(this.selectedInventory.id, this.selectedInventory).subscribe({
      next: (updatedInventory) => {
        const index = this.inventories.findIndex(emp => emp.id === updatedInventory.id);
        if (index > -1) this.inventories[index] = updatedInventory;
        this.filteredInventories = [...this.inventories];  // Update filtered list
        this.closeEditModal();
        this.selectedInventory = null;
      },
      error: (error) => {
        console.error('Error updating inventory', error);
        this.errorMessage = 'Failed to update inventory. Please try again.';
      }
    });
  }

  //REFRESH INVENTORY
  onRefreshInventory(): void {
    // Create a batch update observable for all inventories
    const updateRequests = this.inventories.map((inventory) => {
      inventory.receipts = 0;
      inventory.issues = 0;
      inventory.openingStock = inventory.closingStock;
  
      return this.inventoryService.updateInventory(inventory.id, inventory);
    });
  
    // Combine all update requests into a single observable
    forkJoin(updateRequests).subscribe({
      next: () => {
        this.filteredInventories = [...this.inventories]; // Update the filtered list
        alert('Inventory refreshed successfully!');
      },
      error: (error) => {
        console.error('Error refreshing inventory', error);
        this.errorMessage = 'Failed to refresh inventory. Please try again.';
      },
    });
  }
  

  //ADD
  onAddInventory(): void {
    if (this.companyDetails?.id) {
      this.inventoryService.addInventory(this.companyDetails.id, this.newInventory).subscribe({
        next: (addedInventory) => {
          this.inventories.push(addedInventory);
          this.filteredInventories = [...this.inventories];  // Update filtered list
          this.newInventory = {
            id: 0,
            productName: '',
            description: '',
            qtyInStock: 0,
            price: 0,
            stockValue: 0,
            reorderPoint: 0,
            openingStock: 0,
            receipts: 0,
            issues: 0,
            closingStock: 0,
            minimumStock: 0,
            bufferStock: 0,
            isReorder: '',
          };
          this.closeAddModal();
        },
        error: (error) => {
          console.error('Error adding inventory', error);
          this.errorMessage = 'Failed to add inventory. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Company ID is missing. Cannot add inventory.';
    }
  }

  onDeleteInventory(inventoryId: number): void {
    if (confirm('Are you sure you want to delete this inventory?')) {
      this.inventoryService.deleteInventory(inventoryId).subscribe({
        next: () => {
          this.inventories = this.inventories.filter(emp => emp.id !== inventoryId);
          this.filteredInventories = [...this.inventories];  // Update filtered list
        },
        error: (error) => {
          console.error('Error deleting inventory', error);
          this.errorMessage = 'Failed to delete inventory. Please try again.';
        }
      });
    }
  }

  onSearchInventory(): void {
    if (this.searchTerm.trim()) {
      this.inventoryService.searchInventoryByProductName(this.companyId, this.searchTerm).subscribe({
        next: (data) => {
          this.filteredInventories = data;
        },
        error: (error) => {
          console.error('Error searching inventory by product name', error);
          this.errorMessage = 'Failed to search inventory. Please try again.';
        },
      });
    } else {
      this.fetchInventoriesByCompanyId(this.companyId); // Reset to original inventory list if search term is empty
    }
  }

  onToggleOutOfStock(): void {
    if (this.showOutOfStock && !this.showIsOrder) {
      this.inventoryService.getOutOfStockInventory(this.companyId).subscribe({
        next: (data) => {
          this.filteredInventories = data;
        },
        error: (error) => {
          console.error('Error fetching out-of-stock inventory', error);
          this.errorMessage = 'Failed to fetch out-of-stock inventory. Please try again.';
        },
      });
    } else {
      this.fetchInventoriesByCompanyId(this.companyId); // Reset to original inventory list when toggle is off
    }
  }

  onToggleIsReorder(): void {
    if (this.showIsOrder && !this.showOutOfStock) {
      this.inventoryService.getInventoryWithReorderPoint(this.companyId).subscribe({
        next: (data) => {
          this.filteredInventories = data;
        },
        error: (error) => {
          console.error('Error fetching inventory', error);
          this.errorMessage = 'Failed to fetch inventory. Please try again.';
        },
      });
    } else {
      this.fetchInventoriesByCompanyId(this.companyId); // Reset to original inventory list when toggle is off
    }
  }
}
