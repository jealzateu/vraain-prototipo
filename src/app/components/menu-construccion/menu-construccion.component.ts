import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-construccion',
  templateUrl: './menu-construccion.component.html',
  styleUrls: ['./menu-construccion.component.css']
})
export class MenuConstruccionComponent implements OnInit {

  public options: string[] = [
    'Consultorio medico', 'Centro medico', 'Hospital 1er nivel', 'Hospital 2do nivel', 'Hospital 3er nivel'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
