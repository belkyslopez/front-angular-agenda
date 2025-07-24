
import { Component, OnInit } from '@angular/core';
import { SlicePipe, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CategoriasService } from '../../../core/services/categorias.service';
import { Router } from '@angular/router';
import { FormularioCategoriaComponent } from "../../../components/formulario-categoria/formulario-categoria.component";

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [SlicePipe, HttpClientModule, CommonModule, FormularioCategoriaComponent],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  nombre: string = '';
  imagen: string = '';
  newCategoria: any;
  mostrarModal: boolean = false;
  modoEditar: boolean = false;
  verMas: { [key: string]: boolean } = {};

  constructor(private http: HttpClient,
    private router: Router,
    private categoriasService: CategoriasService
  ) { }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  toggleVerMas(id: string) {
    this.verMas[id] = !this.verMas[id];
  }

  obtenerCategorias() {
    this.categoriasService.getCategorias().subscribe(data => {
      this.categorias = data;
      // console.log("categorias obtenerCategorias", this.categorias);
    });
  }

  verServicioxCategoria(_id: number) {
    console.log("entro a verServicioxCategoria");
    this.router.navigate(['/servicios/categoria', _id]);
    console.log("_id: ", _id);
  }

  // abrir modal para editar
  editarCategoria(categoria: any) {
    this.modoEditar = true;
    this.mostrarModal = true;
  }

  // abrir modal para crear
  crearCategoria() {
    this.modoEditar = false;
    this.mostrarModal = true;
  }

  abrirModal() {
    this.categoriasService.abrir();
  }

  modificarCategoria(categoria: any): void {
    console.log('📝 Modificar categoría:', categoria);
  }

  eliminarCategoria(categoria: any) {
    const confirmacion = confirm(`¿Seguro que quieres eliminar la categoría "${categoria.nombre}"?`);
    if (confirmacion) {
      const id = categoria.id || categoria._id;
      if (!id) {
        alert('❌ ID de categoría no válido');
        return;
      }
      this.http.delete(`http://localhost:3000/api/categorias/${id}`).subscribe({
        next: () => {
          alert('🗑️ Categoría eliminada');
          this.obtenerCategorias();
        },
        error: (err) => {
          console.error('Error al eliminar categoría:', err);
          alert('❌ Error al eliminar categoría: ' + err.message);
        }
      });
    }
  }

  // onImageError(event: any) {
  //   event.target.src = 'assets/default.jpeg';
  // }
}
