import { environment } from 'src/environments/environment';

const base_url = environment.base_url;
const s3_url = environment.s3_url;

interface _DocumentUser {
  _id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  img: string;
}

export class Document {

  constructor(
      public nombre: string,
      public diagram: string,
      public _id?: string,
      public img?: string,
      public usuario?: _DocumentUser,
  ) {}


  get imagenUrl() {
    console.log(this.img);

    if ( !this.img) {
        return `${ base_url }/upload/document/no-doc`;
    } else if ( this.img.includes('https') ) {
        return this.img;
    } else if (  this.img != '') {
        return `${ s3_url }/uploads/document/${this._id}/img/${ this.img}`;
    } else {
        return `${ base_url }/upload/document/no-doc`;
    }
}

}
