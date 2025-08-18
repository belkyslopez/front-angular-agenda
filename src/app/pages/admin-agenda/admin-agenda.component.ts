import { Component, OnInit } from '@angular/core';
import { AgendaService } from '../../core/services/agenda.service';
import { AdminService } from '../../core/services/admin.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Cita } from '../../core/interfaces/cita';
import { Usuario } from '../../core/interfaces/usuario';
import { DatePipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

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
  calendarioDias: { fecha: Date, citas: any[] }[] = [];

  constructor(private agendaService: AgendaService,
    private adminService: AdminService,
    private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(usuarios => {
      this.profesionales = usuarios.filter(u => u.rol === 'profesional');
      console.log('Profesionales:', this.profesionales);
      if (this.profesionales.length > 0) {
        this.profesionalSeleccionado = this.profesionales[0];
        this.onProfesionalChange(); // carga agenda automáticamente al iniciar
      }
    });

    this.generarCalendario();
  }

  onProfesionalChange(): void {
    if (!this.profesionalSeleccionado) return;
    const mes = this.fechaActual.getMonth() + 1;
    const anio = this.fechaActual.getFullYear();
    this.adminService.getCitasPorMesYProfesional(this.profesionalSeleccionado.id!, mes, anio)
      .subscribe(citas => {
        this.citas = citas;
        console.log('Citas cargadas:', this.citas);
        this.asignarCitasAlCalendario(citas);
      });
  }

  cambiarMes(offset: number): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
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
      this.calendarioDias.push({ fecha: new Date(0), citas: [] });
    }
    // Días del mes
    for (let i = 1; i <= totalDias; i++) {
      const fecha = new Date(year, month, i);
      this.calendarioDias.push({ fecha, citas: [] });
    }
  }

  asignarCitasAlCalendario(citas: any[]): void {
    this.generarCalendario(); // limpia y genera el mes de nuevo
    for (let cita of citas) {
      const fechaCita = new Date(cita.fecha);
      const dia = this.calendarioDias.find(d =>
        d.fecha.getDate() === fechaCita.getDate() &&
        d.fecha.getMonth() === fechaCita.getMonth() &&
        d.fecha.getFullYear() === fechaCita.getFullYear()
      );
      if (dia) {
        dia.citas.push({
          hora: cita.hora,
          cliente: cita.usuario_ID
        });
      }
    }
  }

  getDiaCalendario(index: number): number | '' {
    const fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
    const primerDiaSemana = fecha.getDay();
    const dia = index - primerDiaSemana + 1;

    const totalDias = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0).getDate();
    return dia > 0 && dia <= totalDias ? dia : '';
  }

  hayCitaEnDia(index: number): boolean {
    const dia = this.getDiaCalendario(index);
    if (!dia) return false;

    const fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), dia).toISOString().slice(0, 10);
    return this.citas.some(c => c.fecha?.startsWith(fecha));
  }

  getCitasDelDia(index: number): Cita[] {
    const dia = this.getDiaCalendario(index);
    if (!dia) return [];

    const fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), dia).toISOString().slice(0, 10);
    return this.citas.filter(c => c.fecha?.startsWith(fecha));
  }
}
