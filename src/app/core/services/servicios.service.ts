import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface Servicio {
  id?: number; // opcional al crear
  titulo: string;
  descripcion: string;
  imagen?: string;
  precio: number;
  duracion: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private mostrarModalSubject = new BehaviorSubject<boolean>(false);
  modal$ = this.mostrarModalSubject.asObservable();
  categoriaId: string = '';
  private apiUrl = 'http://localhost:3000/api/servicios';

  constructor(private http: HttpClient) { }


  getServiciosPorCategoria(categoriaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  agregarServicioACategoria( servicio: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, servicio);
  }

  abrir() {
    this.mostrarModalSubject.next(true);
  }

  cerrar() {
    this.mostrarModalSubject.next(false);
  }

  setCategoriaId(categoriaId: any) {
    this.categoriaId = categoriaId;
  }

  getCategoriaId() {
    return this.categoriaId;
  }
}
