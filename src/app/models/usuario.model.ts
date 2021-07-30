import { environment } from '../../environments/environment';

const base_url = environment.base_url;
const s3_url = environment.s3_url;

export class Usuario {

    constructor(
        public nombre: string,
        public email: string,
        public password?: string,
        public img?: string,
        public google?: boolean,
        public role?: 'ADMIN_ROLE' | 'USER_ROLE',
        public uid?: string,
    ) {}

    get imagenUrl() {


        if ( !this.img) {
            return `${ base_url }/upload/usuarios/no-image`;
        } else if ( this.img.includes('https') ) {
            return this.img;
        } else if (  this.img != '') {
            return `${ s3_url }/uploads/usuarios/${this.uid}/img/${ this.img}`;
        } else {
            return `${ base_url }/upload/usuarios/no-image`;
        }
    }
}

