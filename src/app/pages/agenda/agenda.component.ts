import { Component, OnInit } from '@angular/core';
import { AgendaService, Cita } from '../../core/services/agenda.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, ReactiveFormsModule, CommonModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent {
  // Días de la semana a mostrar (7 días)
  // days = Array.from({ length: 7 }, (_, i) => {
  //   const d = new Date();
  //   d.setDate(d.getDate() + i);   // hoy, mañana, pasado…
  //   return d;
  // });

  // Para pintar el nombre del día
  dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  today = new Date();
  weekStart = this.startOfWeek(this.today);   // lunes de esta semana


  miForm: FormGroup;
  servicioNombre: string = '';
  servicioId: string = '';
  citas: any;

  nuevaCita: any = {
    servicio: '',
    nombreCliente: '',
    fecha: '',
    hora: null,
    precio: null,
    imagen: ''
  };

  constructor(private route: ActivatedRoute,
    private agendaService: AgendaService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router) {
    this.miForm = this.fb.group({
      nombreCliente: [''],
      telefono: [''],
      fecha: [''],
      hora: [''],
      servicio: ['']
    });
  }


  ngOnInit(): void {
    console.log("ngOnInit de agenda.component.ts");
    this.servicioId = this.route.snapshot.paramMap.get('_id') || '';
    this.servicioNombre = this.route.snapshot.paramMap.get('nombre') || '';
    this.agendaService.setServicioId(this.servicioId);
    console.log('setServicioId:', this.servicioId);
    console.log('servicioId:', this.servicioId);
    console.log('servicio recibido:', this.servicioNombre);
    // this.obtenerCitasPorServicio();
  }

  /* ── Getters para el template ── */
  get days() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(this.weekStart.getDate() + i);
      return d;
    });
  }

  /* ── Métodos ── */
  startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();          // 0=dom, 1=lun …
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  nextWeek() {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.weekStart = new Date(this.weekStart);
  }


  // obtenerCitasPorServicio() {
  //   if (!this.servicioId) return;
  //   this.agendaService.getCitasPorServicio(this.servicioId).subscribe(data => {
  //     this.citas = data;
  //     console.log("citas del servicio seleccionado", this.citas);
  //   });
  // }

  // getCitas() {
  //   this.agendaService.getCitas().subscribe(data => {
  //     this.citas = data;
  //     console.log("citas", this.citas);
  //   });
  // }

  // agendarCitaAServicio() {
  //   console.log("entro a agregarServicio");
  //   this.miForm.patchValue({
  //     servicio: this.agendaService.getServicioId()
  //   });
  //   console.log("entro a agendarCitaAServicio");
  //   if (this.miForm.valid) {
  //     const datos = this.miForm.value;
  //     console.log("datos: ", datos);
  //     this.agendaService.agregarCitaAServicio(datos).subscribe(
  //       res => {
  //         console.log('Cita guardada:', res);
  //       },
  //       err => {
  //         console.error('Error al guardar la cita:', err);
  //       }
  //     );
  //     console.log('Cita guardada:', datos);
  //           // window.location.reload();
  //   } else {
  //     this.miForm.markAllAsTouched();
  //   }
  // }

}
