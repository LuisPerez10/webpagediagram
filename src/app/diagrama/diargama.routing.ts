import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { AuthGuard } from '../guards/auth.guard';

import { GojsComponent } from './gojs/gojs.component';
import { DiagramaComponent } from './diagrama.component';

const routes: Routes = [
    { path: 'diagram/:id',
      component: DiagramaComponent,
      canActivate: [ AuthGuard ],
      canLoad: [ AuthGuard ],

    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DiagramaRoutingModule {}
