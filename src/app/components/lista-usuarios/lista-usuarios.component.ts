import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../services/socket/chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  // styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {
  usuariosActivosObs: Observable<any>;

  constructor(
    public chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.usuariosActivosObs = this.chatService.getUsuariosActivos();

    // Emitir el obtenerUsuarios
    this.chatService.emitirUsuariosActivos();
  }



  getColor(idx:number) :object{
    var palettes = ['#EF5451', '#07D79C', '#3A8BF7','#F2BC0A', '#EE609E'];
    var i = idx % palettes.length;

    return {'background': palettes[i]};
  }



}
