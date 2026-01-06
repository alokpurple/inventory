import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../_services/company/company.service';
import { RouterModule } from '@angular/router';
import { Company } from '../../../models/company';


@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit {
  companyDetails: Company | null = null;
  errorMessage: string = '';

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.fetchCompanyDetails();
  }

  private fetchCompanyDetails(): void {
    // Step 1: Fetch companyId for the authenticated user
    this.companyService.getUserCompanyId().subscribe({
      next: (companyId) => {
        // Step 2: Fetch company details with the obtained companyId
        this.companyService.getCompanyDetails(companyId).subscribe({
          next: (company) => {
            this.companyDetails = company;
          },
          error: (error) => {
            console.error('Error fetching company details', error);
            this.errorMessage =
              'Failed to load company details. Please try again.';
          },
        });
      },
      error: (error) => {
        console.error('Error fetching company ID', error);
        this.errorMessage =
          'Could not retrieve company information. Please try again.';
      },
    });
  }
}
