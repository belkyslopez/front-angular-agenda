import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';

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
  payload = {};

  constructor(private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.miForm = this.fb.group({
      rut: ['', [Validators.required, this.validarRut.bind(this)]],
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
    console.log("entro a registrarUsuario");
    // extraemos y limpiamos el RUT
    const rutFormateado = this.miForm.get('rut')?.value
      ?.replace(/\./g, '')  // quita puntos
      ?.replace(/-/g, '');  // quita guion

    console.log('registrarUsuario: rut', rutFormateado);
    if (!rutFormateado) return;

    // construimos el payload con el RUT ya limpio
    const payload = {
      ...this.miForm.value,
      rut: rutFormateado,
      rol: 'cliente'
    };

    this.usuarioService.registrar(payload).subscribe({
      next: () => {
        alert('Usuario registrado');
        console.log('Usuario registrado:', this.miForm.value);
        this.miForm.reset();
        this.cerrarModal();
      },
      error: () => alert('Error al registrar')
    });
  }

  formatearRut(event: any) {
    let valor = event.target.value.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (valor.length > 1) {
      valor = valor.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + valor.slice(-1);
    }
    event.target.value = valor;
    this.miForm.get('rut')?.setValue(valor, { emitEvent: false });
  }

  validarRut(control: AbstractControl): ValidationErrors | null {
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
