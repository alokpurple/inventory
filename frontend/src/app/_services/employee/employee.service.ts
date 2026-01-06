import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Employee } from '../../models/employee';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployee(companyId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiUrl}/employees/${companyId}`);
  }
  
  addEmployee(companyId: number, employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${environment.apiUrl}/employees/${companyId}`, employee);
  }

  updateEmployee(employeeId: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${environment.apiUrl}/employees/${employeeId}`, employee);
  }

  deleteEmployee(employeeId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/employees/${employeeId}`);
  }
}
