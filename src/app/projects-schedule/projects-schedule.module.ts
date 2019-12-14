import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectsScheduleComponent} from './projects-schedule/projects-schedule.component';
import {RouterModule, Routes} from "@angular/router";
import {CalendarModule, DateAdapter} from "angular-calendar";
import {adapterFactory} from "angular-calendar/date-adapters/date-fns";
import {SharedModule} from '../shared/shared.module';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ChartsModule} from "ng2-charts";

const routes: Routes = [
    {
        path: '',
        component: ProjectsScheduleComponent
    }
];

@NgModule({
    declarations: [ProjectsScheduleComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        SharedModule,
        FontAwesomeModule,
        ChartsModule
    ],
    exports: [RouterModule]
})
export class ProjectsScheduleModule {
}
