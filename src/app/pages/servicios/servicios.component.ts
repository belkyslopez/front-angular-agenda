import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ServiciosService } from '../../core/services/servicios.service';
import { ActivatedRoute } from '@angular/router';
import { FormularioServicioComponent } from '../../components/formulario-servicio/formulario-servicio.component';
import { CategoriasService } from '../../core/services/categorias.service';
import { AgendaService } from '../../core/services/agenda.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormularioServicioComponent],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent implements OnInit {
  servicios: any[] = [];
  mostrarModal: boolean = false;
  modoEditar: boolean = false;
  categoriaId: string = '';
  servicioId: string = '';
  categoriaNombre: string = ''; // propiedad nueva
  categoria: any = {};
  nuevoServicio = {
    categoria: '',
    nombre: '',
    descripcion: '',
    duracion: null,
    precio: null,
    imagen: ''
  };
  constructor(private router: Router,
    private http: HttpClient,
    private serviciosService: ServiciosService,
    private agendaService: AgendaService,
    private categoriasService: CategoriasService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.paramMap.get('id') || '';
    this.serviciosService.setCategoriaId(this.categoriaId);
    this.obtenerServiciosPorCategoria();
  }

  obtenerServiciosPorCategoria() {
    this.serviciosService.getServiciosPorCategoria(this.categoriaId).subscribe((data: any) => {
      this.servicios = data;
      this.categoriasService.guardarCategoria(this.servicios[0].categoria);
      this.categoria = this.categoriasService.consultarCategoria();
      this.agendaService.setServicioId(this.servicioId);
    });
  }

  agendarServicio(servicio: any) {
    this.agendaService.guardarServicio(servicio);
    this.router.navigate(['/agendar/servicio']);
  }

  modificarServicio(servicio: any) {
    this.modoEditar = true;
    this.nuevoServicio = { ...servicio };
    this.mostrarModal = true;
  }

  eliminarServicio(servicio: any) {
    const confirmacion = confirm(`¿Seguro que quieres eliminar el servicio "${servicio.nombre}"?`);
    const id = servicio._id || servicio.id;
    if (confirmacion && id) {
      this.http.delete(`http://localhost:3000/api/servicios/${id}`).subscribe({
        next: () => {
          alert('🗑️ Servicio eliminado');
          this.obtenerServiciosPorCategoria();
        },
        error: (err) => {
          console.error('Error al eliminar servicio:', err);
          alert('❌ Error al eliminar servicio: ' + err.message);
        }
      });
    }
  }

  abrirModal() {
    this.serviciosService.abrir();
  }
  cerrarModal() {
    this.mostrarModal = false;
  }
}
