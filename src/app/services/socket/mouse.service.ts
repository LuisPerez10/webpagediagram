import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class MouseService {

  constructor(
    public wsService: WebsocketService
  ) { }


  sendMovimiento( e:any,id:string ) {

    const payload = {
      svg: e,
      sala: id
    };

    this.wsService.emit('evento', payload );

  }

  sendMouseEvent(point:any){
    const payload = {
      point: point,
      de: this.wsService.usuario.nombre
    };

    this.wsService.emit('mouse',payload);
  }

  sendMouse(evento:any){
    const payload = {
      move: evento,
      offsetX: evento.offsetX,
      offsetY: evento.offsetY
      // de: this.wsService.getUsuario().nombre,
      // cuerpo: mensaje
    };

    this.wsService.emit('mouse', payload );
  }

  getMovientoEvento() {
    console.log('evento movido Listen');

    return this.wsService.listen('evento-movido');
  }

  getMouseMovido(){
    console.log('mouse movido listen');
    return this.wsService.listen('mouse-movido');

  }


  getUpdatedDocument(sala){
    return new Promise((resolve, rejects)=>{
      const payload = {
        sala: sala      };
      this.wsService.emit('entrarSala', payload,resp=>{
        resolve(resp)
      })
    })

  }

  sendsvg( e: string ) {

    const payload = {
      svg: e,
      // de: this.wsService.getUsuario().nombre,
      // cuerpo: mensaje
    };

    this.wsService.emit('mensaje', payload );

  }
  getsvg() {
    console.log('listen');

    return this.wsService.listen('mensaje-nuevo');
  }
}
