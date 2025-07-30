import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  _id?: string; // MongoDB genera este campo automáticamente
  nombreCliente: string;
  telefono: number,
  fecha: string;
  hora: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  servicioId: string = '';
  private apiUrl = 'http://localhost:3000/api/citas'; // Ruta del backend Node.js
  servicio = {};

  constructor(private http: HttpClient) { }


  // Obtener todas las citas
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  // Obtener todas las citas por servicio
  getCitasPorServicio(servicioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios/${servicioId}`);
  }

  agregarCitaAServicio(cita: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, cita);
  }

  // Crear una nueva cita
  agregarCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  // Eliminar una cita por ID
  eliminarCita(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  setServicioId(servicioId: any) {
    this.servicioId = servicioId;
  }

  getServicioId() {
    return this.servicioId;
  }

  guardarServicio(servicio: any) {
    this.servicio = servicio;
  }

  consultarServicio() {
    console.log("servicio: ", this.servicio);
    return this.servicio;
  }

  getHorarios(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/horarios/${fecha}`);
  }

  getAvailability(date: string): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:3000/api/citas/availability?date=${date}`);
  }

  bookSlot(body: { date: string, duration: number }) {
    return this.http.post('http://localhost:3000/book', body);
  }
}
