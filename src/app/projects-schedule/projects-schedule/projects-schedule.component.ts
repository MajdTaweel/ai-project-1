import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

import {Observable, of} from "rxjs";

import {ScheduleConfigsService} from "../../schedule-configs.service";

import {CalendarEvent} from 'angular-calendar';
import {setHours, setMinutes, setDay, setMonth, setYear} from 'date-fns';

import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';

import {ChartOptions, ChartType, ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';


interface Session {
    project: {
        name: string,
        supervisor: string,
        students: string[]
    },
    day: number,
    time: number,
    room: string,
    examiners: string[]
}

@Component({
    selector: 'app-projects-schedule',
    templateUrl: './projects-schedule.component.html',
    styleUrls: ['./projects-schedule.component.scss']
})
export class ProjectsScheduleComponent implements OnInit, AfterViewInit {

    angleLeft = faAngleLeft;
    viewDate: Date = new Date();
    schedule: Session[];
    numberOfConflicts: number;

    events: Observable<CalendarEvent[]> = null;
    eventsTmp: Observable<CalendarEvent[]> = null;
    canceled = false;

    public barChartOptions: ChartOptions = {
        responsive: true,
        scales: {xAxes: [{}], yAxes: [{}]}
    };
    public barChartLabels: Label[] = [];
    public barChartType: ChartType = 'bar';
    public barChartLegend = true;
    public barChartPlugins = [];

    public barChartData: ChartDataSets[] = [
        {data: [], label: 'Min Fitness'},
        {data: [], label: 'Avg Fitness'},
        {data: [], label: 'Max Fitness'}
    ];

    constructor(private scheduleConfigsService: ScheduleConfigsService, public router: Router) {
    }

    ngOnInit() {
    }

    async ngAfterViewInit() {
        try {
            let fitness: {
                max: {
                    value: number,
                    index: number
                },
                min: {
                    value: number,
                    index: number
                },
                avg: number,
                schedule: Session[],
                numberOfConflicts: number
            } = JSON.parse(await eel.populate(
                !this.scheduleConfigsService.prefsConflicts,
                !this.scheduleConfigsService.rangeConflicts
            )());

            let maxFitness = fitness.max.value;

            this.barChartLabels.push('Gen 1');
            this.barChartData[0].data.push(fitness.min.value);
            this.barChartData[1].data.push(fitness.avg);
            this.barChartData[2].data.push(fitness.max.value);

            console.log(this.scheduleConfigsService.iterations);
            for (let i = 0; i < this.scheduleConfigsService.iterations; i++) {
                if (this.canceled) {
                    return;
                }
                if (maxFitness == 1) {
                    break;
                }
                fitness = JSON.parse(await eel.get_next_gen(
                    !this.scheduleConfigsService.prefsConflicts,
                    !this.scheduleConfigsService.rangeConflicts
                )());

                this.barChartLabels.push(`Gen ${i + 2}`);
                this.barChartData[0].data.push(fitness.min.value);
                this.barChartData[1].data.push(fitness.avg);
                this.barChartData[2].data.push(fitness.max.value);

                const len = this.barChartLabels.length;
                if (len > 10) {
                    this.barChartLabels.splice(0, 1);
                    this.barChartData[0].data.splice(0, 1);
                this.barChartData[1].data.splice(0, 1);
                this.barChartData[2].data.splice(0, 1);
                }

                maxFitness = fitness.max.value;
            }

            // const sessionJsonStr = await eel.optimize_schedule(
            //     this.scheduleConfigsService.population,
            //     this.scheduleConfigsService.iterations,
            //     !this.scheduleConfigsService.prefsConflicts,
            //     !this.scheduleConfigsService.rangeConflicts
            // )();
            // console.log(sessionJsonStr);
            // this.schedule = JSON.parse(sessionJsonStr).schedule;
            // console.log(this.schedule);

            this.schedule = fitness.schedule;
            this.numberOfConflicts = fitness.numberOfConflicts;
            console.log(this.schedule);
            const events = [];
            for (let session of this.schedule) {
                const hours = [9, 9, 10, 11, 12, 1, 2, 2];
                const minutes = [0, 50, 40, 30, 20, 10, 0, 50];
                events.push({
                    start: setYear(setMonth(setDay(setHours(setMinutes(new Date(), minutes[session.time]), hours[session.time]), (9 + 2 * session.day - 10)), 11), 2019),
                    end: setYear(setMonth(setDay(setHours(setMinutes(new Date(), minutes[session.time + 1]), hours[session.time + 1]), (9 + 2 * session.day - 10)), 11), 2019),
                    title: `${session.project.name} Room: ${session.room}`,
                    allDay: false,
                })
            }
            console.log(events);
            this.eventsTmp = of(events);
            $('#exampleModalCenter').modal('show');
        } catch (e) {
            console.log(e);
            await this.router.navigate(['/']);
        }
    }
}
