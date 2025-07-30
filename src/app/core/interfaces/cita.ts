export interface Cita {
  id?: string;
  fecha: string;        // formato ISO 'YYYY-MM-DDTHH:mm:ssZ'
  hora: string;
  servicioId: string;
  usuarioId: string;
  profesionalId: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  observaciones?: string;
}
