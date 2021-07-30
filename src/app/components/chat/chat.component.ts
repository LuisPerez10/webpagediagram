import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/socket/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  texto = '';
  mensajesSubscription: Subscription;
  elemento: HTMLElement;

  mensajes: any[] = [];

  constructor(
    public chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.elemento = document.getElementById('chat-mensajes');

    this.mensajesSubscription = this.chatService.getMessages().subscribe( msg => {

      this.mensajes.push( msg );

      setTimeout(() => {
        this.elemento.scrollTop = this.elemento.scrollHeight;

        this.elemento.style.height = (window.screen.height*0.5).toString();
      }, 100);

    });

  }

  ngOnDestroy() {
    this.mensajesSubscription.unsubscribe();
  }


  enviar() {

    if ( this.texto.trim().length === 0 ) {
      return;
    }
    this.rendermensaje( {'cuerpo': this.texto, 'de':'Yo'}, );


    this.chatService.sendMessage( this.texto );


    this.texto = '';

  }

  rendermensaje(msg){
    this.mensajes.push(msg)
    setTimeout(() => {
      this.elemento.scrollTop = this.elemento.scrollHeight;
    }, 50);
  }

}
