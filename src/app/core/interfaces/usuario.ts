export interface Usuario {
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: 'cliente' | 'profesional' | 'admin';
  password?: string;
}
