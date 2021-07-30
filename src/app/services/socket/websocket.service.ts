import { Injectable } from '@angular/core';
import { io, Socket} from 'socket.io-client';
// import {io} from 'socket.io-client/build/index';
// import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';
// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Usuario } from '../../models/usuario.model';
import { Router } from '@angular/router';
import { Usuarioc } from '../../models/usuarioc.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socketStatus = false;
  public usuario: Usuarioc = null;

  private socket:Socket;

  constructor(
    // private socket: Socket
    private router: Router

    ) {
    console.log('checkStatus');

    this.socket = io('http://localhost:3000',{
      extraHeaders: {
        'x-token': localStorage.getItem('token') || '',
      }
    });
    //  this.checkStatus();
  }

    get token(): string {
      return localStorage.getItem('token') || '';
    }




    checkStatus(){

      this.socket.on('connect',()=>{
        console.log('Conectado al servidor');
        this.socketStatus = true;
      });
      this.socket.on('disconnect',()=>{
        console.log('Desconectado del servidor');
        this.socketStatus = true;
      });
    }

    emit( evento: string, payload?: any, callback?: Function ) {

      console.log('Emitiendo', evento);
      // emit('EVENTO', payload, callback?)
      this.socket.emit( evento, payload, callback );

    }

    listen(evento: string){
      return new Observable((Subscribe)=>{
        this.socket.on(evento,(data)=>{
          Subscribe.next(data);
        })
      })
    }

    connect(){
      this.connect()
      console.log('Conectado al servidor');
        this.socketStatus = true;
    }

    login(nombre:string){
      console.log('login');
      console.log(nombre);

      this.usuario = new Usuarioc(nombre);
    }

    loginWS( nombre: string ) {

      return new Promise(  (resolve, reject) => {

        this.emit( 'configurar-usuario', { nombre }, resp => {

          this.usuario = new Usuarioc( nombre );
          this.guardarStorage();

          resolve();

        });

      });

    }

    logoutWS() {
      this.usuario = null;
      localStorage.removeItem('usuario');

      const payload = {
        nombre: 'sin-nombre'
      };

      this.emit('configurar-usuario', payload, () => {} );
      this.router.navigateByUrl('');

    }


    getUsuario() {
      return this.usuario;
    }

    guardarStorage() {
      localStorage.setItem( 'usuario', JSON.stringify( this.usuario ) );
    }

    cargarStorage() {

      if ( localStorage.getItem('usuario') ) {
        this.usuario = JSON.parse( localStorage.getItem('usuario') );
        this.loginWS( this.usuario.nombre );
      }

    }

    // listen( evento: string ) {
    //   return this.socket.fromEvent(evento);
    // }


}
