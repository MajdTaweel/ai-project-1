import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeComponent} from './home.component';
import {SharedModule} from '../shared/shared.module';
import {RouterModule, Routes} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
    declarations: [HomeComponent],
    imports: [CommonModule, SharedModule, RouterModule.forChild(routes), ReactiveFormsModule],
    exports: [RouterModule]
})
export class HomeModule {
}
