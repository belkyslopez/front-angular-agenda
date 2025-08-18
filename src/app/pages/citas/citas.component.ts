import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AgendaService } from '../../core/services/agenda.service';
import { DatePipe, TitleCasePipe, CommonModule } from '@angular/common';
@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, CommonModule],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent {
  citas: any[] = [];

  constructor(private route: ActivatedRoute, private agendaService: AgendaService) { }

  ngOnInit() {
    console.log("entro a citas");
    const usuarioId = this.route.snapshot.paramMap.get('id');
    console.log("usuarioId en citas:", usuarioId);
    if (usuarioId) {
      this.agendaService.getCitasxUsuario(usuarioId).subscribe(data => {
        this.citas = data;
        console.log("citas:", this.citas);

      });
    }
  }
}
