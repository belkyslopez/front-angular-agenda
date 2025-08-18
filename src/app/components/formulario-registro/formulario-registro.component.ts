import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formulario-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario-registro.component.html',
  styleUrl: './formulario-registro.component.css'
})
export class FormularioRegistroComponent {

  miForm!: FormGroup;
  mostrarModal = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.miForm = this.fb.group({
      rut: ['', [Validators.required, this.validarRut]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', Validators.required],
      clave: ['', Validators.required],
      celular: ['', Validators.required],
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  registrarUsuario() {
    if (this.miForm.valid) {
      console.log('Usuario registrado:', this.miForm.value);
      this.cerrarModal();
    }
  }

  formatearRut(event: any) {
    let valor = event.target.value.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (valor.length > 1) {
      valor = valor.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + valor.slice(-1);
    }
    event.target.value = valor;
    this.miForm.get('rut')?.setValue(valor, { emitEvent: false });
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
