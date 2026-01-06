import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Company } from '../../models/company';
import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${environment.apiUrl}/companies/all`);
  }

  // Fetch company ID for the authenticated user
  getUserCompanyId(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/companies/user-company-id`);
  }

  // Fetch company details by companyId
  getCompanyDetails(companyId: number): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/companies/${companyId}`);
  }

  updateCompany(companyId: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${environment.apiUrl}/companies/${companyId}`,company);
  }

  deleteCompany(companyId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/companies/${companyId}`);
  }
}
