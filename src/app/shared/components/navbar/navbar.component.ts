import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuAbierto = false;
  constructor() { }

  ngOnInit(): void {
  }
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

}
