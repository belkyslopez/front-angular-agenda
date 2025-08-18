import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriasService } from '../../core/services/categorias.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-categoria.component.html',
  styleUrl: './formulario-categoria.component.css'
})
export class FormularioCategoriaComponent implements OnInit{
  miFormulario: FormGroup;
  mostrarModal: boolean = false;
  modoEditar: boolean = false;

  constructor(private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private router: Router) {
    this.miFormulario = this.fb.group({
      nombre: ['Nueva categoria '],
      descripcion: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fermentum pulvinar lorem, ac mattis libero lobortis eu. Ut sed arcu velit. Aliquam ut vulputate quam, ac lobortis ligula. Integer a bibendum libero, quis aliquet neque. Quisque fermentum vehicula est, sed scelerisque lacus dapibus et. Cras ac ante risus. '],
      // imagen: ['assets/imagenes/default.jpg']
      imagen: ['https://picsum.photos/id/1/200/300']
    });
  }

  ngOnInit(): void {
    // this.router.navigate(['/categorias']);
    this.categoriasService.modal$.subscribe((valor: any) => {
      this.mostrarModal = valor;
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarCategoria() {
    if (this.miFormulario.valid) {
      const datos = this.miFormulario.value;
      this.categoriasService.crearCategoria(datos).subscribe();
      this.cerrarModal();
      window.location.reload();
      this.miFormulario.reset();
    } else {
      this.miFormulario.markAllAsTouched();
    }
  }

}
