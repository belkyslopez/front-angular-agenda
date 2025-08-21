import { FormularioRegistroComponent } from './../../components/formulario-registro/formulario-registro.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgendaService, Cita } from '../../core/services/agenda.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, ReactiveFormsModule, CommonModule, FormularioRegistroComponent, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {

  @Input() nuevoUsuario: any = {};
  // Para pintar el nombre del día
  dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  today = new Date();
  weekStart = this.startOfWeek(this.today);   // lunes de esta semana
  fechaSeleccionada: Date | null = null;
  horasDisponibles: string[] = [];
  horarios: any[] = [];
  clientes: any[] = [];
  cliente: any = null;
  profesionales: any[] = [];
  fecha = '2025-07-31';
  formularioCita: FormGroup;
  servicioNombre: string = '';
  servicioId: string = '';
  citas: any[] = [];
  servicio: any = {};
  nuevaCita: any = {
    servicio: '',
    nombreCliente: '',
    fecha: '',
    hora: null,
    precio: null,
    imagen: ''
  };
  horaSeleccionada: string | null = null;
  horaAgendada: string | null = null;
  payload = {};
  horarioSeleccionado: any;
  profesionalSeleccionado: any;

  rut: string = '';
  usuarioEncontrado: any = null;
  mostrarFormulario = false;
  formBuscar: FormGroup;
  mostrarRut = false;
  busquedaRealizada = false;
  usuarioNuevo: any = {};
  mostrarBusquedaRut = false

  isPast(date: Date): boolean {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return d < t;
  }

  isToday(date: Date): boolean {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return d.getTime() === t.getTime();
  }

  seleccionarDia(dia: Date): void {
    if (this.isPast(dia)) return;
    this.fechaSeleccionada = dia;
    const fechaISO = dia.toISOString().split('T')[0];
    this.formularioCita.get('fecha')?.setValue(fechaISO); // actualiza el form
    // Llamar al backend para obtener horarios del día seleccionado
    this.agendaService.getHorarios(fechaISO).subscribe(data => {
      this.horarios = Array.isArray(data) ? data : [];
      // Filtra solo las horas disponibles para ese día
      this.horasDisponibles = this.horarios
        .filter(h => h.fecha === fechaISO && (h.disponible === true || !h.cita || h.estado !== 'ocupado'))
        .map(h => h.hora_inicio);
      // ✅ Filtrar horas antiguas solo si la fecha seleccionada es hoy
      if (this.isToday(dia)) {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        const minutosActual = ahora.getMinutes();

        this.horasDisponibles = this.horasDisponibles.filter(hora => {
          const [h, m] = hora.split(':').map(Number);
          if (h > horaActual) return true;
          if (h === horaActual && m >= minutosActual) return true;
          return false;
        });
      }
      // Si no hay horarios para ese día, asegúrate de que sea un array vacío
      if (!Array.isArray(this.horasDisponibles)) {
        this.horasDisponibles = [];
      }
      console.log('Horas disponibles para', fechaISO, ':', this.horasDisponibles);
    }, error => {
      // Manejo de error (ej. si falla la petición)
      this.horasDisponibles = [];
      console.error('Error al obtener horarios:', error);
    });
  }

  constructor(private route: ActivatedRoute,
    private agendaService: AgendaService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private router: Router) {

    this.formularioCita = this.fb.group({
      servicio_ID: [''],
      usuario_ID: [''],
      profesional_ID: [''],
      fecha: [''],
      hora: ['']
    });

    this.formBuscar = this.fb.group({
      rut: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Obtener el servicio desde el localStorage o servicio compartido
    this.servicio = this.agendaService.consultarServicio();
    // Si tienes el servicio, precargar el campo
    if (this.servicio) {
      this.formularioCita.patchValue({
        servicio_ID: this.servicio._id
      });
    }
    // Obtener usuarios (clientes y profesionales)
    this.usuarioService.getUsuarios().subscribe(data => {
      console.log("data: get usuarios", data);
      // this.clientes = data.filter(usuario => usuario.rol === 'cliente');
      this.profesionales = data.filter(usuario => usuario.rol === 'profesional');
      // console.log("cliente:", this.clientes);
      console.log("profesional:", this.profesionales);
    });
  }


  verCita(usuarioId: string): void {
    console.log("entro a verCita");
    console.log("usuarioId:", usuarioId);
    this.router.navigate(['/cita', usuarioId]);
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada = hora;
    this.formularioCita.get('hora')?.setValue(hora);
    console.log('Hora seleccionada:', hora);
    this.horarioSeleccionado = this.horaSeleccionada;
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
  prevWeek() {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.weekStart = new Date(this.weekStart);   // fuerza detección de cambios
  }

  nextWeek() {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.weekStart = new Date(this.weekStart);
  }

  agendarCitaAServicio() {
    console.log("entró aagendarCitaAServicio...");
    console.log("this.formularioCita.value:", this.formularioCita.value);
    const unid = this.formularioCita.get('usuario_ID')?.value;
    console.log('id usuario:', unid);
    this.agendaService.agregarCita(this.formularioCita.value).subscribe({
      next: (response) => {
        alert('Cita registrada');
        this.formularioCita.reset();
        console.log('Respuesta de la API al agendar cita:', response);
      },
      error: () => alert('Error al registrar')
    });
    this.router.navigate(['/cita', unid]);
  }

  buscarUsuario() {
    const rutFormateado = this.formBuscar.get('rut')?.value
      ?.replace(/\./g, '')  // quita puntos
      ?.replace(/-/g, '');  // quita guion
    if (!rutFormateado) return;

    this.usuarioService.getUsuariosxRut(rutFormateado).subscribe({
      next: (res: any) => {
        const respuesta = res;
        this.usuarioEncontrado = respuesta.usuarioEncontrado || null;
        if (this.usuarioEncontrado) {
          this.formularioCita.patchValue({
            usuario_ID: this.usuarioEncontrado._id
          });
        }
        this.busquedaRealizada = true;
      },
      error: () => {
        this.usuarioEncontrado = null;
        this.busquedaRealizada = true;
      }
    });
  }

  formatearRut(event: any) {
    let valor = event.target.value.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (valor.length > 1) {
      valor = valor.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + valor.slice(-1);
    }
    event.target.value = valor;
    this.formBuscar.get('rut')?.setValue(valor, { emitEvent: false });
  }

  validarRut(control: AbstractControl) {
    const rut = control.value?.replace(/\./g, '').replace(/-/g, '');
    if (!rut || rut.length < 8) return { rutInvalido: true };

    const cuerpo = rut.slice(0, -1);
    let dv = rut.slice(-1).toUpperCase();

    let suma = 0, multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const dvEsperado = 11 - (suma % 11);
    let dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dvFinal === dv ? null : { rutInvalido: true };
  }

  seleccionarProfesional() {
    console.log('seleccionarProfesional');
    console.log('profesionalSeleccionado', this.profesionalSeleccionado);

    this.formularioCita.patchValue({
      profesional_ID: this.profesionalSeleccionado._id
    });
    // Ahora que tienes profesional y fecha, puedes cargar los horarios
    const fechaISO = this.fechaSeleccionada?.toISOString().split('T')[0]; // Asegúrate de tener fechaSeleccionada definida
    if (fechaISO) {
      this.agendaService.getHorariosDisponibles(fechaISO, this.profesionalSeleccionado._id).subscribe(horarios => {
        this.horasDisponibles = horarios.map(h => h.hora_inicio);
        console.log("Horas disponibles:", this.horasDisponibles);
      });

    }
  }

  recibirMensaje() {
    const co = this.usuarioService.getUsuarioNuevo();
    console.log('recibirMensaje', co);

    if (co) {
      this.usuarioEncontrado = co.nuevoUsuario;
      this.formularioCita.patchValue({
        usuario_ID: this.usuarioEncontrado._id
      });
    }
  }
}
