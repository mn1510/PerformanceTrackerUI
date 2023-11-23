import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ActivitiesListComponent } from './activities/activities-list/activities-list.component';
import { ActivityDetailComponent } from './activities/activity-detail/activity-detail.component';
import { authGuard } from './_guards/auth.guard';
import { TestErrorComponent } from './errors/test-error/test-error.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';

const routes: Routes = [
  {path:'', component:HomeComponent},
  {path:'',
    runGuardsAndResolvers:'always',
    canActivate:[authGuard],
    children:[
      {path:'activities', component:ActivitiesListComponent},
      {path:'activities/:id', component:ActivityDetailComponent},
    ]
  },
  {path:'errors', component:TestErrorComponent },
  {path:'not-found', component:NotFoundComponent },
  {path:'server-error', component:ServerErrorComponent },

  {path:'**', component:NotFoundComponent, pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
