import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface Categoria {
  id?: number; // opcional al crear
  nombre: string;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private mostrarModalSubject = new BehaviorSubject<boolean>(false);
  modal$ = this.mostrarModalSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api/categorias';

  constructor(private http: HttpClient) { }

   getCategorias() {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearCategoria(categoria: Categoria) {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  abrir() {
    this.mostrarModalSubject.next(true);
  }

  cerrar() {
    this.mostrarModalSubject.next(false);
  }
}
