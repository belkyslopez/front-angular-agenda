import { ServiciosService } from '../../core/services/servicios.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-formulario-servicio',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './formulario-servicio.component.html',
  styleUrl: './formulario-servicio.component.css'
})
export class FormularioServicioComponent {
  miForm: FormGroup;
  mostrarModal: boolean = false;
  modoEditar: boolean = false;

  constructor(private fb: FormBuilder,
    private serviciosService: ServiciosService
  ) {
    this.miForm = this.fb.group({
      nombre: ['Nuevo servicio'],
      descripcion: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fermentum pulvinar lorem, ac mattis libero lobortis eu. Ut sed arcu velit. Aliquam ut vulputate quam, ac lobortis ligula. Integer a bibendum libero, quis aliquet neque. Quisque fermentum vehicula est, sed scelerisque lacus dapibus et. Cras ac ante risus. '],
      duracion: ['120'],
      precio: ['20'],
      imagen: ['https://picsum.photos/id/1/200/300'],
      categoria: ['']
    });
  }

  ngOnInit(): void {
    this.serviciosService.modal$.subscribe((valor: any) => {
      this.mostrarModal = valor;
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.miForm.reset();
    // this.serviciosService.getServiciosPorCategoria(categoria);
  }

  guardarServicio() {
    console.log("entro a agregarServicio");
    this.miForm.patchValue({
      categoria: this.serviciosService.getCategoriaId()
    });
    if (this.miForm.valid) {
      const datos = this.miForm.value;
      console.log("datos: ", datos);
      this.serviciosService.agregarServicioACategoria(datos).subscribe();
      this.cerrarModal();
      window.location.reload();
      this.miForm.reset();
    } else {
      this.miForm.markAllAsTouched();
    }
  }
}
