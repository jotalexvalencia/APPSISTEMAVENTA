import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const sesion = JSON.parse(usuario);
        if (sesion?.token) {
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${sesion.token}` }
          });
          return next.handle(cloned);
        }
      } catch { }
    }
    return next.handle(req);
  }
}
