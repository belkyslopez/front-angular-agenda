import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../interfaces/cita';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:3000/api/citas'; // Ruta del backend Node.js
  constructor(private http: HttpClient) { }

  getCitasPorMesYProfesional(profesionalId: string, mes: number, anio: number): Observable<Cita[]> {
    const params = new HttpParams()
    .set('profesionalId', profesionalId)
    .set('mes', mes.toString())
    .set('anio', anio.toString());

  return this.http.get<Cita[]>(`${this.apiUrl}`, { params });
}

}
