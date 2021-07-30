import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

import { Document } from '../models/document.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor( private http: HttpClient ) { }
  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }
  cargarDocuments() {

    const url = `${ base_url }/diagram`;
    return this.http.get( url, this.headers )
              .pipe(
                map( (resp: {ok: boolean, diagrams: Document[] }) => resp.diagrams )
              );
  }

  getDocumentById(_id:string){
  const url =  `${base_url}/diagram/${_id}`;
  return this.http.get(url, this.headers)
        .pipe(
          map((res:{ok:boolean, diagram: Document})=> res.diagram)
        );
  }

  crearDocument( nombre: string ) {

    const url = `${ base_url }/diagram`;
    return this.http.post( url, { nombre }, this.headers );
  }

  actualizarDocument( _id: string, document ) {

    const url = `${ base_url }/diagram/${ _id }`;
    return this.http.put( url,  document , this.headers );
  }
}
