import { Component, ElementRef, ViewChild } from '@angular/core';
import { EmployeeService } from '../../../_services/employee/employee.service';
import { CompanyService } from '../../../_services/company/company.service';
import { Company } from '../../../models/company';
import { Employee } from '../../../models/employee';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { FormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent {
  @ViewChild('editEmployeeModal') editEmployeeModalRef!: ElementRef;
  @ViewChild('addEmployeeModal') addEmployeeModalRef!: ElementRef;

  companyDetails: Company | null = null;
  companyId: number = 0;
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  newEmployee: Employee = { id: 0, name: '', grade: '', dept: '', salary: 0 };
  errorMessage: string = '';
  private editModalInstance: Modal | null = null;
  private addModalInstance: Modal | null = null;

  constructor(
    private companyService: CompanyService, 
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const companyId = Number(this.route.snapshot.paramMap.get('companyId'));
    if (companyId) {
      this.companyId = companyId;
      this.fetchEmployeesByCompanyId(companyId);
    } else {
      this.fetchEmployees();
    }
  }

  private fetchEmployeesByCompanyId(companyId: number): void {
    this.employeeService.getEmployee(companyId).subscribe({
      next: (data) => (this.employees = data),
      error: (error) => {
        console.error('Error fetching employees for company', error);
        if (error.status === 401) { 
          this.router.navigate(['/forbidden']); 
        } else {
          this.errorMessage = 'Failed to load employees for this company.';
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
  
  private fetchEmployees(): void {
    this.companyService.getUserCompanyId().subscribe({
      next: (companyId) => {
        this.companyId = companyId;
        this.fetchEmployeesByCompanyId(companyId);
      },
      error: (error) => {
        console.error('Error fetching company ID', error);
        this.errorMessage = 'Could not retrieve company or inventory information. Please try again.';
      },
    });
  }

  onEditEmployee(employee: Employee): void {
    this.selectedEmployee = { ...employee }; // Clone the selected employee data
    if (this.editEmployeeModalRef) {
      this.editModalInstance = new Modal(this.editEmployeeModalRef.nativeElement, {});
      this.editModalInstance.show();
    }
  }

  closeEditModal(): void {
    this.editModalInstance?.hide();
    this.editModalInstance = null;
    this.selectedEmployee = null;
  }

  openAddEmployeeModal(): void {
    if (this.addEmployeeModalRef) {
      this.addModalInstance = new Modal(this.addEmployeeModalRef.nativeElement, {});
      this.addModalInstance.show();
    }
  }

  closeAddModal(): void {
    this.addModalInstance?.hide();
    this.addModalInstance = null;
  }

  onUpdateEmployee(name: string, grade: string, dept: string, salary: any): void {
    if (!this.selectedEmployee) return;
    this.selectedEmployee = { ...this.selectedEmployee, name, grade, dept, salary };
  
    this.employeeService.updateEmployee(this.selectedEmployee.id, this.selectedEmployee).subscribe({
      next: (updatedEmployee) => {
        const index = this.employees.findIndex(emp => emp.id === updatedEmployee.id);
        if (index > -1) this.employees[index] = updatedEmployee;
        
        this.closeEditModal();
        this.selectedEmployee = null;
      },
      error: (error) => {
        console.error('Error updating employee', error);
        this.errorMessage = 'Failed to update employee. Please try again.';
      }
    });
  }

  onAddEmployee(): void {
    if (this.companyDetails?.id) {
      this.employeeService.addEmployee(this.companyDetails.id, this.newEmployee).subscribe({
        next: (addedEmployee) => {
          this.employees.push(addedEmployee);
          this.newEmployee = { id: 0, name: '', grade: '', dept: '', salary: 0 };  // Reset form
          this.closeAddModal();
        },
        error: (error) => {
          console.error('Error adding employee', error);
          this.errorMessage = 'Failed to add employee. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Company ID is missing. Cannot add employee.';
    }
  }

  onDeleteEmployee(employeeId: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.id !== employeeId);
        },
        error: (error) => {
          console.error('Error deleting employee', error);
          this.errorMessage = 'Failed to delete employee. Please try again.';
        }
      });
    }
  }
}
