import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../services/document.service';
import { delay } from 'rxjs/operators';
import { Document } from '../models/document.model';
import Swal from 'sweetalert2';
import { Clipboard } from '@angular/cdk/clipboard';
import { GojsComponent } from './gojs/gojs.component';
import { Diagram } from '@syncfusion/ej2-diagrams';
import { FileUploadService } from '../services/file-upload.service';
import { UsuarioService } from '../services/usuario.service';
import { WebsocketService } from '../services/socket/websocket.service';
import { MouseService } from '../services/socket/mouse.service';
import { Subscription } from 'rxjs';
import { element } from 'protractor';
import { ChatService } from '../services/socket/chat.service';
import { Observable } from 'rxjs/Observable';
declare function customInitFunctions();

@Component({
  selector: 'app-diagrama',
  templateUrl: './diagrama.component.html',
  styleUrls: ['./diagrama.component.css'],
})



export class DiagramaComponent implements OnInit {

  public cargando: boolean = true;
  public mousecargando:boolean =  false;
  public document: Document;
  public id:string;
  @ViewChild(GojsComponent) gojs : GojsComponent;
  mouseSubscription: Subscription;
  mouses:any[] = [];
  elemento: HTMLElement;

  usuariosActivosObs: Observable<any>;



  constructor(
    private activatedRoute: ActivatedRoute,
    private documentService: DocumentService,
    private router : Router,
    private clipboard: Clipboard,
    private fileUploadService :FileUploadService,
    private usuarioService : UsuarioService,
    private wsService: WebsocketService,
    private mouseService : MouseService,
    private chatService : ChatService

  ) {

  }

  ngOnInit(): void {

    this.wsService.login(this.usuarioService.usuario.nombre);

    this.usuariosActivosObs = this.chatService.getUsuariosActivos();


    customInitFunctions();
    this.activatedRoute.params.subscribe(({id})=>{
      this.id = id;
      this.cargarDocumento(id)});

  }
  ngAfterViewInit(): void {
    this.mouseSubscription = this.mouseService.getMouseMovido().subscribe((mouse:any)=>{
        // console.log(mouse);
        // this.elemento = document.getElementById(mouse.cid);
        this.elemento = document.getElementById(mouse['cid']);
        let left =  (mouse['point'].x   - this.gojs.myDiagramComponent.diagram.position.x)* this.gojs.myDiagramComponent.diagram.scale ;//* (e.diagram.scale);
        let top =  (mouse['point'].y   - this.gojs.myDiagramComponent.diagram.position.y)* this.gojs.myDiagramComponent.diagram.scale ;//* (e.diagram.scale);

        this.elemento.style.left = `${left}px`;
        this.elemento.style.top = `${top}px`;


        // this.mouses.push(mouse);



    });
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  guardarCambios(){
    this.document.diagram = this.gojs.obtenerModeloActual();
    const data = {
        diagram: this.document.diagram
    }
    this.documentService.actualizarDocument(this.id,data)
      .subscribe( (resp: any) => {
        Swal.fire('Guardado', `Guardado correctamente`, 'success');

        this.actualizarImagen();


        // this.router.navigateByUrl(`/dashboard/estudio/${ resp.estudio._id }`)
    })
  }

  actualizarImagen(){
    var blob = this.gojs.obtenerArrayBuffer();
    var file = new File([blob],'actualizado.png',{
      type: "image/png",
    });

    this.subirImagen(file);
  }

  subirImagen(file) {

    this.fileUploadService
      .actualizarFoto( file, 'document',this.id )
      .then( img => {

        this.document.img = img;
        // Swal.fire('Guardado', 'Imagen de usuario actualizada', 'success');
      }).catch( err => {
        console.log(err);
        // Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      })

  }


  cargarDocumento(id: string) {

    if ( id === 'nuevo' ) {
      return;
    }
    this.cargando = true;
     this.documentService.getDocumentById( id )
      .pipe(
        delay(100)
      )
      .subscribe( (document:Document) => {

        if ( !document ) {
          return this.router.navigateByUrl(`/dashboard/documents`);
        }

        setTimeout(()=>{
          const diagram = document.diagram;
          this.document = document;
          localStorage.setItem(`diagram`, diagram);
          //this.myDiagramComponent.diagram.model = go.Model.fromJson(localStorage.getItem('diagram'));
        },10);
        this.cargando = false;
      });

  }

  onMouseEvent(point){
    if(!this.mousecargando){
     this.mouseService.sendMouseEvent(point);
     this.mousecargando= true;
     setTimeout(()=>{
        this.mousecargando=false;
      },(40));
    }
  }

  mostrarOverView(){
    this.gojs.mostrarOverView();
  }


  descargarSVG = ()=>{this.descargarFile('svg');};
  descargarPNG = ()=>{this.descargarFile('png');};
  descargarJPG = ()=>{this.descargarFile('jpg');};
  imprimir = ()=>{this.descargarFile('pdf');};

  descargarFile(type){
    var blob = this.gojs.obtenerBlob(type);
    if(blob == null){
      Swal.fire('No encontro archivo', `No se puedo realizar la descarga`, 'error');
    }else{

      this._myCallback(blob,this.document.nombre,type);
      Swal.fire({
        position: 'top-right',
        icon: 'success',
        title: 'Descargado con exito',
        showConfirmButton: false,
        timer: 1000
      })
    }
  }

  copiarClipBoard() {
    var id = this.id
    var url = this.getURL();
    var fullPath = `${url}/diagram/${id}`;
    Swal.fire({
      position: 'bottom',
      icon: 'success',
      title: 'URL copiada en porta papeles',
      showConfirmButton: false,
      timer: 1200
    })

   this.clipboard.copy(fullPath);
  }

   blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date().getTime();
    theBlob.name = fileName;
    return theBlob;
}

  getURL(){
    return window.location.host;

  }

  _myCallback(blob: string,name,ext) {
    if(ext == "pdf" || ext == "svg")
      var url =  window.URL.createObjectURL(blob);
    else
      var url = blob;

    var filename = `${name}.${ext}`;

    var a = document.createElement("a");
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = filename;

    // IE 11
    if (window.navigator.msSaveBlob !== undefined) {
      window.navigator.msSaveBlob(blob, filename);
      return;
    }

    document.body.appendChild(a);
    requestAnimationFrame(function() {
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  getColor(idx:number) :object{
    var palettes = ['#EF5451', '#07D79C', '#3A8BF7','#F2BC0A', '#EE609E'];
    var i = idx % palettes.length;

    return {'color': palettes[i]};
  }
}
