import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authToken = localStorage.getItem('token');
  const apiUrl = 'http://127.0.0.1:8000/api/'; 

  if (authToken && req.url.startsWith(apiUrl)) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Token ${authToken}`)
    });
    console.log('AuthInterceptor: Added token to request for', req.url); 
    return next(authReq);
  }
  return next(req);
};