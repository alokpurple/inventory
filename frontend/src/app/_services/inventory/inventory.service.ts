import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Inventory } from '../../models/inventory';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}

  getInventory(companyId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${environment.apiUrl}/inventories/${companyId}`);
  }
 
  addInventory(companyId: number, inventory: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(`${environment.apiUrl}/inventories/${companyId}`, inventory);
  }

  updateInventory(inventoryId: number, inventory: Inventory): Observable<Inventory> {
    return this.http.put<Inventory>(`${environment.apiUrl}/inventories/${inventoryId}`, inventory);
  }

  deleteInventory(inventoryId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/inventories/${inventoryId}`);
  }

  searchInventoryByProductName(companyId: number, productName: string): Observable<Inventory[]> {
    const params = new HttpParams().set('productName', productName);
    return this.http.get<Inventory[]>(`${environment.apiUrl}/inventories/${companyId}/search`, { params });
  }

  getOutOfStockInventory(companyId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${environment.apiUrl}/inventories/${companyId}/out-of-stock`);
  }

  getInventoryWithReorderPoint(companyId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${environment.apiUrl}/inventories/${companyId}/reorder-point`);
  }
}
