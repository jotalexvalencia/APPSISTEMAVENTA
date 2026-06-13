import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UtilidadService } from './utilidad.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private _utilidadServicio: UtilidadService) {}
  canActivate(): boolean {
    const usuario = this._utilidadServicio.obtenerSesionUsuario();
    if (usuario) return true;
    this.router.navigate(['login']);
    return false;
  }
}
