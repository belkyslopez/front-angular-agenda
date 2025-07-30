export interface Servicio {
  id?: string;
  nombre: string;
  descripcion: string;
  duracion: number;     // en minutos
  precio: number;
  imagen?: string;
  categoriaId: string;
}
