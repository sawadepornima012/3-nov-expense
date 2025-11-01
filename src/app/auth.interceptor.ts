import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(

    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token and user ID from the service
    // const authToken = this.authService.getToken();
    // const userId = this.authService.getUserId();

    // Clone the request and add headers
    let headers = req.headers;

    // Add Authorization header if token exists
    // if (authToken) {
    //   headers = headers.set('Authorization', `Bearer ${authToken}`);
    // }

    // // Add User-Id header for all authenticated requests (except auth endpoints)
    // if (userId && !req.url.includes('/api/auth/')) {
    //   headers = headers.set('User-Id', userId.toString());
    // }

    // // Add Content-Type for requests with body
    // if (req.method === 'POST' || req.method === 'PUT') {
    //   if (!headers.has('Content-Type')) {
    //     headers = headers.set('Content-Type', 'application/json');
    //   }
    // }

    const authReq = req.clone({ headers });

    // Pass the cloned request to the next handler
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);

        // // Handle different error scenarios
        // if (error.status === 0) {
        //   // Network error or backend not available
        //   console.error('Backend is not available. Please check if the server is running.');
        //   // You can show a user-friendly message here
        // } else if (error.status === 401) {
        //   // Unauthorized - token expired or invalid
        //   console.warn('Authentication failed. Redirecting to login...');
        //   this.authService.logout();
        //   this.router.navigate(['/login'], { 
        //     queryParams: { returnUrl: this.router.url } 
        //   });
        // } else if (error.status === 403) {
        //   // Forbidden - user doesn't have permission
        //   console.error('Access forbidden');
        //   // You can show a permission denied message
        // } else if (error.status === 404) {
        //   // Not found
        //   console.error('Resource not found');
        // } else if (error.status >= 500) {
        //   // Server error
        //   console.error('Server error occurred');
        // }

        // Re-throw the error so components can handle it
        return throwError(() => error);
      })
    );
  }
}