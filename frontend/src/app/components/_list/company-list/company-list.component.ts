import { Component, ElementRef, ViewChild } from '@angular/core';
import { CompanyService } from '../../../_services/company/company.service';
import { Company } from '../../../models/company';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Modal } from 'bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.css'
})
export class CompanyListComponent {
  @ViewChild('editCompanyModal') editCompanyModalRef!: ElementRef;
  @ViewChild('addCompanyModal') addCompanyModalRef!: ElementRef;
  
  companyDetails: Company | null = null;
  companies: Company[] = [];
  selectedCompany: Company | null = null;
  newCompany: Company = { id: 0, companyName: '', location: '', capacity: ''};
  errorMessage: string = '';
  private editModalInstance: Modal | null = null;
  private addModalInstance: Modal | null = null;

  constructor(private companyService: CompanyService, private router: Router) {}

  ngOnInit(): void {
    this.fetchCompanies();
  }

  private fetchCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (error) => {
        console.error('Error fetching company-list', error);
        this.errorMessage = 'Could not retrieve companies information. Please try again.';
      },
    });
  }

  onEditCompany(company: Company): void {
    this.selectedCompany = { ...company }; // Clone the selected company data
    if (this.editCompanyModalRef) {
      this.editModalInstance = new Modal(this.editCompanyModalRef.nativeElement, {});
      this.editModalInstance.show();
    }
  }

  closeEditModal(): void {
    this.editModalInstance?.hide();
    this.editModalInstance = null;
    this.selectedCompany = null;
  }

  closeAddModal(): void {
    this.addModalInstance?.hide();
    this.addModalInstance = null;
  }

  onUpdateCompany(companyName: string, capacity: string, location: string): void {
    if (!this.selectedCompany) return;
    this.selectedCompany = { ...this.selectedCompany, companyName, capacity, location };
    console.log('before updateCompany');
    this.companyService.updateCompany(this.selectedCompany.id, this.selectedCompany).subscribe({
      next: (updatedCompany) => {
        const index = this.companies.findIndex(emp => emp.id === updatedCompany.id);
        if (index > -1) this.companies[index] = updatedCompany;
        
        this.closeEditModal();
        this.selectedCompany = null;
      },
      error: (error) => {
        console.error('Error updating company', error);
        this.errorMessage = 'Failed to update company. Please try again.';
      }
    });
  }

  onDeleteCompany(companyId: number): void {
    if (confirm('Are you sure you want to delete this company?')) {
      this.companyService.deleteCompany(companyId).subscribe({
        next: () => {
          this.companies = this.companies.filter(emp => emp.id !== companyId);
        },
        error: (error) => {
          console.error('Error deleting company', error);
          this.errorMessage = "Failed to delete company. This company's inventory-list or employee-list are not empty .";
        }
      });
    }
  }

  onReadInventory(companyId: number): void{
    this.router.navigate(['/inventory-list',companyId]);
  }

  onReadEmployee(companyId: number): void{
    this.router.navigate(['/employee-list',companyId]);
  }
}
