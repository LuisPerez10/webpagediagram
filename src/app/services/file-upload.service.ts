import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }


  async actualizarFotos(
    archivo: Array<File>,
    tipo: 'usuarios'|'eventos',
    dir: 'img'|'galeria',
    id: string
  ) {

    try {

      const url = `${ base_url }/upload/${ tipo }/${dir}/${ id }`;
      const formData = new FormData();
      for (let i = 0; i < archivo.length; i++) {
        formData.append('imagen',archivo[i]);
      }

      const resp = await fetch( url, {
        method: 'PUT',
        headers: {
          'x-token': localStorage.getItem('token') || ''
        },
        body: formData
      });

      const data = await resp.json();

      if ( data.ok ) {
        console.log(data.msg);
        console.log(data.nombreArchivos);
        return data.nombreArchivos;
      } else {
        console.log('salio mal');
        console.log(data.msg);
        return false;
      }

    } catch (error) {
      console.log(error);
      console.log('error front');
      return false;
    }

  }


  async actualizarFoto(
    archivo: File,
    tipo: 'usuarios'|'document',
    id: string
  ) {


    try {

      const url = `${ base_url }/upload/${ tipo }/${ id }`;
      const formData = new FormData();
      formData.append('imagen', archivo);

      const resp = await fetch( url, {
        method: 'PUT',
        headers: {
          'x-token': localStorage.getItem('token') || ''
        },
        body: formData
      });

      const data = await resp.json();

      if ( data.ok ) {
        console.log(data.nombreArchivo);

        return data.nombreArchivo;
      } else {
        console.log(data.msg);
        return false;
      }

    } catch (error) {
      console.log(error);
      return false;
    }

  }




}
