export interface Agenda {
  id?: string;
  fecha: string; // ISO format: '2025-08-01T14:00:00Z'
  disponible: boolean;
  servicioId: string;
  profesionalId: string;
  clienteId?: string;       // si ya fue agendada por alguien
}
