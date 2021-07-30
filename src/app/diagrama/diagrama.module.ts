import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GojsComponent } from './gojs/gojs.component';


import { ContextMenuModule, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule, RadioButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { NumericTextBoxModule, SliderModule, UploaderModule, ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GojsAngularModule } from 'gojs-angular';
import { DiagramaComponent } from './diagrama.component';
// socket
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
// const config: SocketIoConfig = {
//   url: 'http://localhost:3000', options: {}
// };




@NgModule({
  declarations: [
    GojsComponent,
    DiagramaComponent
  ],
  exports:[
    GojsComponent,
    DiagramaComponent
  ],
  imports: [
    GojsAngularModule,
    ComponentsModule,
    // SocketIoModule.forRoot(config),

    CommonModule, FormsModule, NumericTextBoxModule, DropDownButtonModule, ContextMenuModule, SliderModule,
    ToolbarModule, DropDownListModule, ButtonModule, RadioButtonModule, UploaderModule,
    DialogModule, CheckBoxModule, MultiSelectModule, TooltipModule, ColorPickerModule, BrowserModule,
    RouterModule
]
})
export class DiagramaModule { }
