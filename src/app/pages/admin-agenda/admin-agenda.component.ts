import { Component, OnInit } from '@angular/core';
import { AgendaService } from '../../core/services/agenda.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Cita } from '../../core/interfaces/cita';
import { Usuario } from '../../core/interfaces/usuario';
import { DatePipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CitasService } from '../../core/services/citas.service';

@Component({
  selector: 'app-admin-agenda',
  standalone: true,
  imports: [DatePipe, CommonModule, ReactiveFormsModule, FormsModule,],
  templateUrl: './admin-agenda.component.html',
  styleUrl: './admin-agenda.component.css'
})
export class AdminAgendaComponent implements OnInit {

  profesionales: Usuario[] = [];
  profesionalSeleccionado!: Usuario;
  citas: Cita[] = [];
  fechaActual: Date = new Date();
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarioDias: { fecha: Date, citas: { hora: string, cliente: string }[] }[] = [];
  usuario_ID: string = '';

  constructor(private agendaService: AgendaService,
    private citasService: CitasService,
    private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(usuarios => {
      this.profesionales = usuarios.filter(u => u.rol === 'profesional');
    });
    this.generarCalendario();
  }

  onProfesionalChange(): void {
    if (!this.profesionalSeleccionado) return;
    const mes = this.fechaActual.getMonth() + 1;
    const anio = this.fechaActual.getFullYear();
    this.citasService.getCitasPorMesYProfesional(this.profesionalSeleccionado._id!, mes, anio)
      .subscribe(citas => {
        this.citas = citas;
        this.asignarCitasAlCalendario(citas);
      });
  }

  cambiarMes(offset: number): void {
    const nuevaFecha = new Date(this.fechaActual);
    nuevaFecha.setMonth(this.fechaActual.getMonth() + offset);
    this.fechaActual = nuevaFecha;
    this.onProfesionalChange();
  }

  generarCalendario(): void {
    this.calendarioDias = [];
    const year = this.fechaActual.getFullYear();
    const month = this.fechaActual.getMonth();
    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);
    const primerDiaSemana = primerDiaMes.getDay();
    const totalDias = ultimoDiaMes.getDate();
    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      this.calendarioDias.push({ fecha: null as any, citas: [] });
    }
    // Días del mes
    for (let i = 1; i <= totalDias; i++) {
      const fecha = new Date(year, month, i);
      this.calendarioDias.push({ fecha, citas: [] });
    }
  }

  asignarCitasAlCalendario(citasObtenidas: any[]): void {
    this.generarCalendario(); // limpia y genera el mes de nuevo
    for (let cita of citasObtenidas) {
      const fechaCita = new Date(cita.fecha);
      const dia = this.calendarioDias.find(d =>
        d.fecha &&
        d.fecha.getDate() === fechaCita.getDate() &&
        d.fecha.getMonth() === fechaCita.getMonth() &&
        d.fecha.getFullYear() === fechaCita.getFullYear()
      );
      if (dia) {
        dia.citas.push({
          hora: cita.hora,
          cliente: cita.usuario_ID?.nombre || 'Cliente sin nombre'
        });
      }
      this.usuario_ID = cita.usuario_ID;
    }
  }

  // getCitasDelDia(dia: { fecha: Date, citas: Cita[] } | null): Cita[] {
  //   return dia?.citas || [];
  // }
}
