export interface Usuario {
  id?: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: 'cliente' | 'profesional' | 'admin';
  password?: string;
}
