import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = 'http://localhost:8080/api/payments'; // Spring Boot endpoint

  constructor(private http: HttpClient) {}

  // ✅ Fetch all payments
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  // ✅ Add a new payment
  addPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  // ✅ Delete a payment
  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✅ Clear all payments (custom API)
  clearAllPayments(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`);
  }

  // ✅ Utility: calculate total
  getTotalAmountSync(payments: Payment[]): number {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }
}
