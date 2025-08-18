import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  usuarioRut: string = '';
  private apiUrl = 'http://localhost:3000/api'; // Ruta del backend Node.jsF

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  getUsuariosxRut(usuarioRut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/${usuarioRut}`);
  }
}
