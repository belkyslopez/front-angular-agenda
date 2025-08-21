import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  usuarioRut: string = '';
  usuarioNuevo: any;
  private apiUrl = 'http://localhost:3000/api'; // Ruta del backend Node.jsF

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  getUsuariosxRut(rut: string): any {
    const body = {
      "rut": rut
    };
    return this.http.post(`${this.apiUrl}/usuarios/buscar`, body);
  }

  registrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }

  setUsuarioNuevo(Usuario: any) {
    this.usuarioNuevo = Usuario;
  }

  getUsuarioNuevo() {
    return this.usuarioNuevo;
  }
}
