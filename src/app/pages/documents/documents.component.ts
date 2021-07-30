import { Component, OnInit } from '@angular/core';

import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { Clipboard } from '@angular/cdk/clipboard';
import Swal from 'sweetalert2';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  public cargando: boolean = true;
  public documents: Document[] = [];

  public imagenSubir: File;
  public imgTemp: any = null;


  constructor(
    private documentService: DocumentService,
    private clipboard: Clipboard,

  ) { }

  ngOnInit(): void {
    this.cargarDocuments();

  }

  guardarCambios(){}



  async abrirSweetAlert() {
    const { value = '' } = await Swal.fire<string>({
      title: 'Nuevo Documento',
      text: 'Ingrese el nombre del nuevo documento',
      input: 'text',
      inputPlaceholder: 'Nombre del documento',
      showCancelButton: true,
    });

    if( value.trim().length > 0 ) {
      this.documentService.crearDocument( value )
        .subscribe( (resp: any) => {
          this.documents.push( resp.diagram );
     })
    }
  }

  cargarDocuments() {
    this.cargando = true;
    this.documentService.cargarDocuments()
      .subscribe( documentss => {
        this.cargando = false;
        this.documents = documentss;
      });
  }

  copiarClipBoard(id) {
    var url = this.getURL();
    // console.log(url , id);
    var fullPath = `${url}/diagram/${id}`;
    Swal.fire({
      position: 'bottom',
      icon: 'success',
      title: 'URL copiada en porta papeles',
      showConfirmButton: false,
      timer: 1200
    })
    // Swal.fire('Copiardo', `Copiado al portapapeles`, 'success');

   this.clipboard.copy(fullPath);
  }

  getURL(){
    return window.location.host;

  }
}
