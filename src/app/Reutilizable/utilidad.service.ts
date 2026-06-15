import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Sesion } from '../Interfaces/sesion';
@Injectable({
  providedIn: 'root'
})
export class UtilidadService {

  constructor(private _snackBar:MatSnackBar) { }

  mostrarAlerta(mensaje:string, tipo:string){
    this._snackBar.open(mensaje,tipo,{
      horizontalPosition:"end",
      verticalPosition:"top",
      duration:3000
    })
  }

  guardarSesionUsuario(usuarioSession:Sesion){
    localStorage.setItem("usuario",JSON.stringify(usuarioSession));
  }

  obtenerSesionUsuario(){
    const dataCadena = localStorage.getItem("usuario");
    if (!dataCadena) return null;
    return JSON.parse(dataCadena);
  }

  eliminarSesionUsuario(){
    localStorage.removeItem("usuario");
  }

  redimensionarImagen(file: File, maxPx: number = 500): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxPx && height <= maxPx) {
          resolve(file);
          return;
        }
        if (width > height) {
          height = height * (maxPx / width);
          width = maxPx;
        } else {
          width = width * (maxPx / height);
          height = maxPx;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('No se pudo redimensionar'));
        }, file.type, 0.85);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }
}
