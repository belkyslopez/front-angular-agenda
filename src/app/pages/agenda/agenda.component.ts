import { FormularioRegistroComponent } from './../../components/formulario-registro/formulario-registro.component';
import { Component, OnInit } from '@angular/core';
import { AgendaService, Cita } from '../../core/services/agenda.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, TitleCasePipe,CommonModule } from '@angular/common';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, ReactiveFormsModule, CommonModule, FormularioRegistroComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
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
  miForm: FormGroup;
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
  citaAgendada = false;
  payload = {};
  horarioSeleccionado: any;
  profesionalSeleccionado: any;

  rut: string = '';
  usuarioEncontrado: any = null;
  mostrarFormulario = false;
  formBuscar: FormGroup;
  mostrarRut = false;
  busquedaRealizada = false;

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
    this.miForm.get('fecha')?.setValue(fechaISO); // actualiza el form
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
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router) {
    this.miForm = this.fb.group({
      nombreCliente: [''],
      apellidoCliente: [''],
      correoCliente: [''],
      claveCliente: [''],
      telefono: ['', Validators.pattern(/^\d{9}$/)],
      fecha: [''],
      hora: [''],
      servicio: ['']
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
      this.miForm.patchValue({
        servicio: this.servicio._id
      });
    }
    // Obtener usuarios (clientes y profesionales)
    this.usuarioService.getUsuarios().subscribe(data => {
      console.log("data: get usuarios", data);
      this.clientes = data.filter(usuario => usuario.rol === 'cliente');
      this.profesionales = data.filter(usuario => usuario.rol === 'profesional');
      console.log("cliente:", this.clientes);
      console.log("profesional:", this.profesionales);
      // Selecciona automáticamente el primer profesional y cliente
      if (this.profesionales.length > 0) {
        this.profesionalSeleccionado = this.profesionales[0];
        // Ahora que tienes profesional y fecha, puedes cargar los horarios
        const fechaISO = this.fechaSeleccionada?.toISOString().split('T')[0]; // Asegúrate de tener fechaSeleccionada definida
        if (fechaISO) {
          this.agendaService.getHorariosDisponibles(fechaISO, this.profesionalSeleccionado._id).subscribe(horarios => {
            this.horasDisponibles = horarios.map(h => h.hora_inicio);
            console.log("Horas disponibles:", this.horasDisponibles);
          });
        }
      }
      if (this.clientes.length > 0) {
        const cliente = this.clientes[0];
        this.miForm.patchValue({
          nombreCliente: cliente.nombre,
          apellidoCliente: cliente.apellido,
          correoCliente: cliente.correo,
          telefono: cliente.telefono
        });
      }
    });
  }


  verCita(usuarioId: string): void {
    console.log("entro a verCita");
    console.log("usuarioId:", usuarioId);
    this.router.navigate(['/cita', usuarioId]);
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada = hora;
    this.miForm.get('hora')?.setValue(hora);
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
  //  Validación del formulario
    if (this.miForm.invalid || !this.horaSeleccionada || !this.clientes[0] || !this.profesionales[0] || !this.servicio?._id) {
      alert("Faltan datos para agendar la cita. Verifica el cliente, profesional y servicio. y/o selecciona una hora.");
      this.miForm.markAllAsTouched();
      return;
    }
    const payload = {
      usuario_ID: this.clientes[0]._id,
      profesional_ID: this.profesionales[0]._id,
      servicio_ID: this.servicio._id,
      fecha: this.miForm.get('fecha')?.value,
      hora: this.miForm.get('hora')?.value
    };
    this.agendaService.agregarCitaAServicio(payload).subscribe(
      res => {
        console.log('✅ Cita guardada:', res);
        this.horaAgendada = payload.hora;
        this.citaAgendada = true;
        // Recargar horarios disponibles
        this.seleccionarDia(new Date(payload.fecha));
        // Quitar la hora seleccionada del arreglo de horas disponibles
        this.horasDisponibles = this.horasDisponibles.filter(h => h !== this.horaSeleccionada);
        this.agendaService.setClienteId(this.clientes[0]._id);
        alert("Cita agendada con éxito");
        // this.router.navigate(['/confirmacion-cita']);
      },
      err => {
        console.error('❌ Error al guardar la cita:', err);
        alert("Hubo un error al agendar la cita. Intenta nuevamente.");
      }
    );
  }

    buscarUsuario() {
    console.log('entro a buscarUsuario');
    const rutFormateado = this.formBuscar.get('rut')?.value
    ?.replace(/\./g, '')  // quita puntos
    ?.replace(/-/g, '');  // quita guion
    console.log('buscarUsuario: rut', rutFormateado);
    if (!rutFormateado) return;

    this.usuarioService.getUsuariosxRut(rutFormateado).subscribe({
      next: (res: any) => {
        console.log('buscarUsuario: get usuariosxRut', res);
        this.usuarioEncontrado = res || null;
        console.log(' usuarioEncontrado', this.usuarioEncontrado);
        this.busquedaRealizada = true;
      },
      error: () => {
        this.usuarioEncontrado = null;
        this.busquedaRealizada  = true;
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
}
