import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

//go js
import { HtmlParser } from '@angular/compiler';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import * as _ from 'lodash';

import { MouseService } from '../../services/socket/mouse.service';
import {Subscription, timer} from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { generatePalette } from '../../../scripts/palettes';
import { Diagram, Node, NodeModel, NodeConstraints, TextStyleModel } from '@syncfusion/ej2-diagrams';
import { Observer } from '@syncfusion/ej2-base';
import { AnimationSettingsModel, Position, PositionDataModel } from '@syncfusion/ej2-angular-popups';

import { NavigationEnd, Router, ActivationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { inputs, outputs } from '@syncfusion/ej2-angular-popups/src/dialog/dialog.component';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { async } from '@angular/core/testing';



@Component({
  selector: 'app-gojs',
  templateUrl: './gojs.component.html',
  styleUrls: ['./gojs.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class GojsComponent  implements AfterViewInit,OnInit{
  //mouse socket
  mouseSubscription: Subscription;
  shapeSubscription: Subscription;
  elemento : HTMLElement;

  @Output()
  mouseEvent = new EventEmitter();

  role : Boolean;
  atiende : Boolean;

  overviewShow : Boolean;

  @Input()
  iddoc : string;

  public modeloSave="sa";




  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private mouseService: MouseService,
    private activatedRoute : ActivatedRoute
    ) {
    }
    ngOnDestroy(): void {
      this.shapeSubscription.unsubscribe();

    }

    ngOnInit()  {


      this.role = true;
      this.atiende = false;
      this.overviewShow = false;


      this.shapeSubscription = this.mouseService.getMovientoEvento().subscribe((shape : any) =>{

        var shape = shape;//['svg'];
        // #Metodo1

        if(this.atiende){
          this.atiende=false;
          this.myDiagramComponent.diagram.model.applyIncrementalJson(shape);
          this.atiende=true;
        }
        // setTimeout(()=>{
        //   this.atiende = true;
        // }, 400);
        // this.atiende=false;
        // this.myDiagramComponent.diagram.updateAllTargetBindings("geometry");
        //Metodo 2

        // this.myDiagramComponent.diagram.animationManager.initialAnimationStyle = go.AnimationManager.None;
        // this.myDiagramComponent.diagram.model = go.Model.fromJson(shape);
      });



      this.activatedRoute.params.subscribe(({id})=>{
        this.mouseService.getUpdatedDocument(id).then((data)=>{

          setTimeout(()=>{
            if (data==null) {
              this.router.navigate(['/dashboard/documents']);
            }
            this.atiende=false;
            const jsonModel = data;
            this.myDiagramComponent.diagram.model = go.Model.fromJson(jsonModel);
          },(500));
        })
      });


    }



  ngAfterViewInit() {
    // added

    this.router.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(event => {
        if (
          event.id === 1 &&
          event.url === event.urlAfterRedirects
        ) {
            // console.log('reload');
        }
      });


      // LP: necesita ser infinito para no alterar la posicion del cliente socket conectado
    this.myDiagramComponent.diagram.scrollMode = go.Diagram.InfiniteScroll;
    // this.myDiagramComponent.diagram.animationManager.initialAnimationStyle = go.AnimationManager.None;




    //end added
    // this.myDiagramComponent.diagram.addDiagramListener("AnimationStarting",function(e){
    //   console.log(e);
    // });

    // this.myDiagramComponent.diagram.addDiagramListener("BackgroundSingleClicked",function(e){
    //   console.log(e);
    // });

    if (this.observedDiagram) return;
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)
    const gojsComp: GojsComponent = this;
      // listener for inspector
    this.myDiagramComponent.diagram.addDiagramListener('ChangedSelection', function(e) {
      if (e.diagram.selection.count === 0) {
        gojsComp.selectedNode = null;
      }
      const node = e.diagram.selection.first();
      if (node instanceof go.Node) {
        gojsComp.selectedNode = node;
      } else {
        gojsComp.selectedNode = null;
      }
    });

// enre



    this.myDiagramComponent.diagram.mouseOver = (e)=>{
    //  console.log("posicion DOCUMENT",e.documentPoint);// posicion del mouse documento
    //  console.log("PANTALLA",e.viewPoint); //posicion de la vista. screem
    //  console.log("Posicion DIAGRAMA",e.diagram.position); //posicion del griagrama

      // this.elemento = document.getElementById('cursor1');
      // let left =  (e.documentPoint.x - e.diagram.position.x)* (e.diagram.scale);
      // let top =  (e.documentPoint.y - e.diagram.position.y)* (e.diagram.scale);
      // // let left =  e.viewPoint.x;
      // console.log('escale');
      // console.log(e.diagram.scale.toString());

      // console.log('left');
      // console.log(left);


      // this.elemento.style.left = `${left}px`;
      // this.elemento.style.top = `${top}px`;
      // e.documentPoint.x = e.documentPoint.x ;//* e.diagram.scale;
      // e.documentPoint.y = e.documentPoint.y ;//* e.diagram.scale;
      this.mouseEvent.emit(e.documentPoint);

    }

    this.myDiagramComponent.diagram.addModelChangedListener((evt:go.ChangedEvent)=>{

      if (!evt.isTransactionFinished) return;

      var json = evt.model.toIncrementalJson(evt);

      if (this.role && this.atiende){
// #Metodo1

       this.mouseService.sendMovimiento(json,this.iddoc);
      }else{
        this.atiende = true;

      }


    });



  } // end ngAfterViewInit

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent: DiagramComponent;
  @ViewChild('myPalette', { static: true }) public myPaletteComponent: PaletteComponent;




  obtenerModeloActual(){
    return this.myDiagramComponent.diagram.model.toJson();
  }

  mostrarOverView(){
    this.overviewShow =!this.overviewShow;
  }

  obtenerArrayBuffer=()=>{
    var diafas = this.myDiagramComponent.diagram.makeImageData({
      type: "image/png",
      size: new go.Size(250,200),
    }).toString();
    var data = diafas.substr(diafas.indexOf(',')+ 1 );
    var bufferArray = this.base64ToArrayBuffer(data);
    return new Blob([bufferArray], { type: "image/png" });
  }



  obtenerBlob= (type)=>{

    if(this.myDiagramComponent !== undefined){
      var diafas;
      var str;
      var blob;
      switch(type){
        case "png":
          diafas = this.myDiagramComponent.diagram.makeImageData({
            type: "image/png"
          });
          // var data = diafas.substr(diafas.indexOf(',')+ 1 );
          // var bufferArray = this.base64ToArrayBuffer(data);
          blob = diafas.toString();
        break;
        case "svg":
          diafas = this.myDiagramComponent.diagram.makeSvg();
          str = new XMLSerializer().serializeToString(diafas);
          blob = new Blob([str], { type: "image/svg+xml" });
          break;
        case "pdf":
          diafas = this.myDiagramComponent.diagram.makeImageData();
          var data = diafas.substr(diafas.indexOf(',')+ 1 );

          var bufferArray = this.base64ToArrayBuffer(data);
          // str = new XMLSerializer().serializeToString(diafas);
          blob = new Blob([bufferArray], { type: "application/pdf" });
          break;

        case "jpg":
          diafas = this.myDiagramComponent.diagram.makeImageData({
            background: "white",
            type:"image/jpeg",
          });
          blob = diafas.toString();
          break;
        default:
          diafas = this.myDiagramComponent.diagram.makeImage();
          str = new XMLSerializer().serializeToString(diafas);
          blob = new Blob([str], { type: "image/jpg" });
          break;
      }

      return blob;
    }
    return null;
  }

   base64ToArrayBuffer(data) {
    var bString = window.atob(data);
    var bLength = bString.length;
    var bytes = new Uint8Array(bLength);
    for (var i = 0; i < bLength; i++) {
        var ascii = bString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes;
};

  cambiarRole (){
    this.role = !this.role;
    this.atiende = true;
  }

  cambiarPermiso(){
    // this.myDiagramComponent.diagram.isModelReadOnly = true;
    this.myDiagramComponent.diagram.isReadOnly = true;
    // this.myDiagramComponent.diagram.isEnabled = false;
  }







  // initialize diagram / templates
  public initDiagram(): go.Diagram {

    const $ = go.GraphObject.make;
    const dia = $(go.Diagram,
      {
      // mouseOver:function(e:go.InputEvent){
      //   console.log(e.viewPoint.toString()); //posicion de la vista. screem
      //   console.log(e.documentPoint);// posicion del mouse documento
      //   console.log(e.diagram.position); //posicion del griagrama
      //   console.log(this.iddoc);

      //   this.mouseEvent.emit(e.documentPoint);
      //   // this.mouseService.sendMouseEvent(e.documentPoint,this.iddoc);
      // },

      'undoManager.isEnabled': true,

      grid: $(go.Panel, "Grid",
      { gridCellSize: new go.Size(50, 50) },
      $(go.Shape, "LineH", {strokeDashArray:[1,50], stroke: "gray" , strokeWidth:2.0}),
      // $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
      // $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
      // $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
    ),

      "draggingTool.dragsLink": true,
      "draggingTool.isGridSnapEnabled": false,
      "linkingTool.isUnconnectedLinkValid": true,
      "linkingTool.portGravity": 20,
      "relinkingTool.isUnconnectedLinkValid": true,
      "relinkingTool.portGravity": 20,
      "relinkingTool.fromHandleArchetype":
        $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
      "relinkingTool.toHandleArchetype":
        $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
      "linkReshapingTool.handleArchetype":
        $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
      "rotatingTool.handleAngle": 270,
      "rotatingTool.handleDistance": 30,
      "rotatingTool.snapAngleMultiple": 15,
      "rotatingTool.snapAngleEpsilon": 15,


      model: $(go.GraphLinksModel,
        {
          linkToPortIdProperty: 'toPort',
          linkFromPortIdProperty: 'fromPort',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        },

      )
    });

    dia.commandHandler.archetypeGroupData = { key: 'Group', isGroup: true };


    function showSmallPorts(node, show) {
      node.ports.each(function(port) {
        if (port.portId !== "") {  // don't change the default port, which is the big shape
          port.fill = show ? "rgba(0,0,0,.3)" : null;
        }
      });
    }
    const makePort = function(id: string, spot: go.Spot, output, input) {
      return $(go.Shape, 'Rectangle',
        {
          fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
          // stroke: null,
          // desiredSize: new go.Size(7, 7),
          // alignment: spot,  // align the port on the main Shape
          alignmentFocus: spot,  // just inside the Shape
          // portId: name,  // declare this object to be a "port"
          fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
          // fromLinkable: true, toLinkable: true,  // declare whether the user may draw links to/from here
          cursor: "pointer",  // show a different cu

          strokeWidth: 0, desiredSize: new go.Size(15, 15),
          portId: id, alignment: spot,
          fromLinkable: output, toLinkable: input
        }
      );
    }



    function nodeClicked(e, obj) {  // executed by click and doubleclick handlers
      var evt = e.copy();
      var node = obj.part;
      var type = evt.clickCount === 2 ? "Double-Clicked: " : "Clicked: ";
      var msg = type + node.data.key + ". ";
      document.getElementById("myStatus").textContent = msg;
    }



    var nodeSelectionAdornmentTemplate =
        $(go.Adornment, "Auto",
          $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
          $(go.Placeholder)
        );

        var nodeResizeAdornmentTemplate =
        $(go.Adornment, "Spot",
          { locationSpot: go.Spot.Right },
          $(go.Placeholder),
          $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
          $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
          $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

          $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
          $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

          $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
          $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
          $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
        );

        var nodeRotateAdornmentTemplate =
        $(go.Adornment,
          { locationSpot: go.Spot.Center, locationObjectName: "ELLIPSE" },
          $(go.Shape, "Ellipse", { name: "ELLIPSE", cursor: "pointer", desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
          $(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
        );




    function nodeStyle() {
      return [
        { locationSpot: go.Spot.Center },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

       // cambia la escala new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
        { resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
        // { rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },

        new go.Binding("angle").makeTwoWay(),
        {
          // the Node.location is at the center of each node
         // locationSpot: go.Spot.Center
        }
      ];
    }


    var linkSelectionAdornmentTemplate =
        $(go.Adornment, "Link",
          $(go.Shape,
            // isPanelMain declares that this Shape shares the Link.geometry
            { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })  // use selection object's strokeWidth
        );

    dia.linkTemplate =
        $(go.Link,  // the whole link panel
          { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate },
          { relinkableFrom: true, relinkableTo: true, reshapable: true },
          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 5,
            toShortLength: 4
          },
          new go.Binding("points").makeTwoWay(),
          $(go.Shape,  // the link path shape
            { isPanelMain: true, strokeWidth: 2, stroke: "#919191", strokeCap:'square',fill: "transparent", strokeDashArray: [4, 8]}),
          $(go.Shape,  // the arrowhead
            { toArrow: "Standard", stroke: "#919191",}),
          $(go.Panel, "Auto",
            new go.Binding("visible", "visible").ofObject(),
            $(go.Shape, "RoundedRectangle",  // the link shape
              {  strokeWidth: 1.5,
                fill: $(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
                stroke: null
            }),
            $(go.TextBlock,
              {

                textAlign: "center",
                font: "10pt helvetica, arial, sans-serif",
                stroke: "#707070",
                margin: 2,
                minSize: new go.Size(10, NaN),
                editable: true,
              },
              new go.Binding("text").makeTwoWay())
          )
        );




   dia.nodeTemplate =
   $(go.Node, 'Spot',nodeStyle(),{minSize: new go.Size(200,170)},
  //  {key:"sd"},
     {
      mouseEnter: function(e, node) {showSmallPorts(node, true); },
      mouseLeave: function(e, node) { showSmallPorts(node, false); },

     },
     $(go.Panel, 'Auto',
     {name: "PANEL"},
      new go.Binding("desiredSize",  "size", (go.Size.parse,go.Size.parse)).makeTwoWay(
            function Sb(a,b){

              dia.nodes.each((n:go.Node)=>{
                  if(b.key === n.data.key ){
                    var obj = n.findObject("PANEL2");
                    if(b.key.includes('persona')){
                      obj.alignment =  go.Spot.BottomCenter;
                      obj.height = a.height*.6;
                      obj.width = a.width*.9;
                      obj.minSize= new go.Size(200,102);
                    }else{

                      obj.height = a.height*.95;
                      obj.width = a.width*.9;
                      obj.minSize= new go.Size(150,170);

                    }
                  }
              });

              return a.width.toString()+" "+a.height.toString();
            }
          ),


       $(go.Shape,
         {stroke:null,},
      // { geometry: go.Geometry.parse("M120 0 L80 80 0 50z") },
       new go.Binding('geometry','geometry',function(a,b){
        return (a.path==undefined)? a: go.Geometry.parse(a.path);
       }),
       new go.Binding('fill', 'color'),
       new go.Binding('desiredSize', 'size'),
       ),


      $(go.Panel, 'Vertical',
      new go.Binding('desiredSize','newsize').makeTwoWay(),
      new go.Binding('alignment','newalignment').makeTwoWay(),
      {name: "PANEL2"},

          $(go.TextBlock, {
            font: "bold 14pt helvetica, arial, sans-serif",
            stroke: "white",
            margin: 8 , editable: true,
            wrap: go.TextBlock.WrapFit
          },
            new go.Binding('text').makeTwoWay()),

          $(go.TextBlock, {
            font: "10pt helvetica, arial, sans-serif",
            stroke: "white",
            margin: 8, editable: true ,
            wrap: go.TextBlock.WrapFit
          },

          new go.Binding('text','text2').makeTwoWay()), // DOING  text text2 soluciona el problema de actulizar text 2 y 3
          // verificar linia , no envia texto

          $(go.TextBlock, {
            position: new go.Point(100,100),
            stroke: 'white',
            // margin: 20,
            editable: true,
            // overflow: go.TextBlock.,

            wrap: go.TextBlock.WrapFit,
            font: "10pt helvetica, arial, sans-serif",
          },
          new go.Binding('text', 'text3').makeTwoWay()),

      ),
     ),

     // Ports
     makePort('t', go.Spot.Top,true, true),
     makePort('tl', go.Spot.TopLeft,true, true),
     makePort('tr', go.Spot.TopRight,true, true),
     makePort('l', go.Spot.Left,true,true),
     makePort('r', go.Spot.Right,true, true),
     makePort('b', go.Spot.MiddleBottom,true,true),
     makePort('bl', go.Spot.BottomLeft,true,true),
     makePort('br', go.Spot.BottomRight,true,true),

   );

 return dia;
}


public diagramNodeData: Array<go.ObjectData> = [];
public diagramLinkData: Array<go.ObjectData> = [];
public diagramDivClassName: string = 'myDiagramDiv';
public diagramModelData = { prop: 'value' };
public skipsDiagramUpdate = false;

// When the diagram model changes, update app data to reflect those changes
public diagramModelChange = function(changes: go.IncrementalData) {
 // when setting state here, be sure to set skipsDiagramUpdate: true since GoJS already has this update
 // (since this is a GoJS model changed listener event function)
 // this way, we don't log an unneeded transaction in the Diagram's undoManager history


 this.skipsDiagramUpdate = true;
// enre

 this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
 this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
 this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData);


 if(this.myDiagramComponent.diagram.isModified && this.role){
  this.observedDiagram.model.modelData.position = go.Point.stringify(this.observedDiagram.position);

  // this.observedDiagram.model.modelData.canStartMultiTouch= true;// = go.Point.stringify(this.observedDiagram.size);

  // TODO

  this.myDiagramComponent.diagram.isModified = false;
  // Metodo 2
  // var json = this.observedDiagram.model.toJson();
  // console.log(json);
  // this.mouseService.sendMovimiento(json);

}
};



public initPalette(): go.Palette {
 const $ = go.GraphObject.make;
 const palette = $(go.Palette);

 // define the Node template
 palette.nodeTemplate =
   $(go.Node, 'Auto',
     $(go.Shape,new go.Binding('geometry').makeTwoWay(),//new  go.Binding('figure','figure'),
       {

        //  stroke: "1",

         background: 'white',
         width:70,
         height:70

       },
       new go.Binding('fill', 'color')
     ),
     $(go.TextBlock, { stroke: "white",margin: 8 , wrap: go.TextBlock.WrapFit},
       new go.Binding('text','text2')),
   );



 palette.model = $(go.GraphLinksModel,
   {
     linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
   });

 return palette;
}
R_geometry = go.Geometry.parse("m 39 0 z q 1 0 1 1 v 14 q 0 1 -1 1 h -38 q -1 0 -1 -1 v -14 q 0 -1 1 -1 Z", true);
P_geometry = go.Geometry.parse("m 20 0 a 1.4 1.4 90 1 1 0 15 a 1 1 90 1 1 0 -15 z m -15 12 l 30 0 q 5 0 5 5 v 10 q 0 5 -5 5 h -30 q -5 0 -5 -5 v -10 q 0 -5 5 -5 M 7 32 V 26 H 6.9 V 32 M 33 32 V 26 H 32.9 V 32 Z", true);

public paletteNodeData: Array<go.ObjectData> = [
  { key: 'persona', newsize:new go.Size(200,102), newalignment:  go.Spot.BottomCenter, text: "Name", text2:"[Person]", text3:"Descripcion", color: '#08427B', geometry:this.P_geometry},
  { key: 'softesys', alignment:go.Spot.TopCenter, newsize:new go.Size(200,170), text: "Name", text2:"[Software System]", text3:"Descripcion", color: '#999999', geometry:this.R_geometry  },
  { key: 'softsys', alignment:go.Spot.TopCenter, newsize:new go.Size(200,170), text: "Name", text2:"[Software System]", text3:"Descripcion", color: '#1168BD', geometry:this.R_geometry  },

];
public paletteLinkData: Array<go.ObjectData> = [
 {  }
];
public paletteModelData = { prop: 'val' };
public paletteDivClassName = 'myPaletteDiv';
public skipsPaletteUpdate = false;


public paletteModelChange = function(changes: go.IncrementalData) {
 // when setting state here, be sure to set skipsPaletteUpdate: true since GoJS already has this update
 // (since this is a GoJS model changed listener event function)
 // this way, we don't log an unneeded transaction in the Palette's undoManager history
 this.skipsPaletteUpdate = true;


 this.paletteNodeData = DataSyncService.syncNodeData(changes, this.paletteNodeData);
 this.paletteLinkData = DataSyncService.syncLinkData(changes, this.paletteLinkData);
 this.paletteModelData = DataSyncService.syncModelData(changes, this.paletteModelData);
};

// Overview Component testing
public oDivClassName = 'myOverviewDiv';

public initOverview(): go.Overview {

 const $ = go.GraphObject.make;
 const overview = $(go.Overview);
 return overview;
}
public observedDiagram = null;

// currently selected node; for inspector
public selectedNode: go.Node | null = null;



public handleInspectorChange(newNodeData) {
 const key = newNodeData.key;
 // find the entry in nodeDataArray with this key, replace it with newNodeData
 let index = null;
 for (let i = 0; i < this.diagramNodeData.length; i++) {
   const entry = this.diagramNodeData[i];
   if (entry.key && entry.key === key) {
     index = i;
   }
 }

 if (index >= 0) {
   // here, we set skipsDiagramUpdate to false, since GoJS does not yet have this update
   this.skipsDiagramUpdate = false;
   this.diagramNodeData[index] = _.cloneDeep(newNodeData);
   // this.diagramNodeData[index] = _.cloneDeep(newNodeData);
 }

}


}
