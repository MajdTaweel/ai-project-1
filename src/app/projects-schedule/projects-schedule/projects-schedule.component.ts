import { AfterViewInit, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";

import { Observable, of } from "rxjs";

import { ScheduleConfigsService } from "../../schedule-configs.service";

import { CalendarEvent } from 'angular-calendar';

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_kelly from '@amcharts/amcharts4/themes/kelly';

// Apply chart themes
am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_kelly);




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
export class ProjectsScheduleComponent implements OnInit, AfterViewInit, OnDestroy {

    angleLeft = faAngleLeft;
    viewDate: Date = new Date(2019, 12, 20);
    schedule: Session[];
    numberOfConflicts: number;

    events: Observable<CalendarEvent[]> = null;
    eventsTmp: Observable<CalendarEvent[]> = null;
    canceled = false;
    chart: am4charts.XYChart3D;

    constructor(private zone: NgZone, private scheduleConfigsService: ScheduleConfigsService, public router: Router) {
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
                !this.scheduleConfigsService.rangeConflicts,
                !this.scheduleConfigsService.consecutiveConflicts
            )());

            let maxFitness = fitness.max.value;

            this.zone.runOutsideAngular(() => {
                let chart = am4core.create('chartdiv', am4charts.XYChart3D);
                chart.colors
                chart.data = [
                    {
                        gen: 'Gen 1',
                        minFitness: fitness.min.value,
                        avgFitness: fitness.avg,
                        maxFitness: fitness.max.value
                    }
                ];
                // Create axes
                const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
                categoryAxis.dataFields.category = "gen";
                categoryAxis.title.text = "Generation";

                const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
                valueAxis.title.text = "Fitness";

                // Create series
                const series = chart.series.push(new am4charts.ColumnSeries3D());
                series.dataFields.valueY = "minFitness";
                series.dataFields.categoryX = "gen";
                series.name = "Min Fitness";
                series.tooltipText = "{name}: [bold]{valueY}[/]";

                const series2 = chart.series.push(new am4charts.ColumnSeries3D());
                series2.dataFields.valueY = "avgFitness";
                series2.dataFields.categoryX = "gen";
                series2.name = "Avg Fitness";
                series2.tooltipText = "{name}: [bold]{valueY}[/]";

                const series3 = chart.series.push(new am4charts.ColumnSeries3D());
                series3.dataFields.valueY = "maxFitness";
                series3.dataFields.categoryX = "gen";
                series3.name = "Max Fitness";
                series3.tooltipText = "{name}: [bold]{valueY}[/]";

                // Add legend
                chart.legend = new am4charts.Legend();

                // Add cursor
                chart.cursor = new am4charts.XYCursor();

                // Add simple vertical scrollbar
                chart.scrollbarY = new am4core.Scrollbar();

                // Add horizotal scrollbar with preview
                var scrollbarX = new am4charts.XYChartScrollbar();
                scrollbarX.series.push(series);
                chart.scrollbarX = scrollbarX;

                this.chart = chart;
            });

            console.log(this.scheduleConfigsService.iterations);
            for (let i = 0; i < this.scheduleConfigsService.iterations; i++) {
                if (this.canceled) {
                    return;
                }
                if (maxFitness == 1) {
                    break;
                }

                if (this.scheduleConfigsService.iterations >= 1000) {
                    if (i === Math.trunc(this.scheduleConfigsService.iterations * 0.4)) {
                        this.scheduleConfigsService.prefsConflicts = false;
                        this.scheduleConfigsService.consecutiveConflicts = false;
                        // fitness = JSON.parse(await eel.populate(
                        //     !this.scheduleConfigsService.prefsConflicts,
                        //     !this.scheduleConfigsService.rangeConflicts
                        // )());
                    }

                    if (i === Math.trunc(this.scheduleConfigsService.iterations * 0.75)) {
                        this.scheduleConfigsService.rangeConflicts = false;
                        // fitness = JSON.parse(await eel.populate(
                        //     !this.scheduleConfigsService.prefsConflicts,
                        //     !this.scheduleConfigsService.rangeConflicts
                        // )());
                    }
                }

                fitness = JSON.parse(await eel.get_next_gen(
                    !this.scheduleConfigsService.prefsConflicts,
                    !this.scheduleConfigsService.rangeConflicts,
                    !this.scheduleConfigsService.consecutiveConflicts
                )());

                this.chart.addData(
                    {
                        gen: `Gen ${i + 2}`,
                        minFitness: fitness.min.value,
                        avgFitness: fitness.avg,
                        maxFitness: fitness.max.value
                    }
                );

                // const len = this.barChartLabels.length;
                // if (len > 10) {
                //     this.barChartLabels.splice(0, 1);
                //     this.barChartData[0].data.splice(0, 1);
                //     this.barChartData[1].data.splice(0, 1);
                //     this.barChartData[2].data.splice(0, 1);
                // }

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
                const hours = [9, 10, 11, 12, 13, 14];
                const minutes = [0, 50];
                let students = '';
                let first = true;
                session.project.students.forEach(student => {
                    if (first) {
                        students += student;
                        first = false;
                    } else {
                        students += `, ${student}`;
                    }
                });
                events.push({
                    start: new Date(2019, 12, 18 + 2 * session.day, hours[session.time - 1], minutes[0]),
                    // setYear(setMonth(setDay(setHours(setMinutes(new Date(), minutes[0]), hours[session.time - 1]), (2 * session.day - 1)), 10), 2019),
                    end: new Date(2019, 12, 18 + 2 * session.day, hours[session.time - 1], minutes[1]),
                    // setYear(setMonth(setDay(setHours(setMinutes(new Date(), minutes[1]), hours[session.time - 1]), (2 * session.day - 1)), 10), 2019),
                    title: `${session.project.name} - Supervisor: ${session.project.supervisor} - Students: ${students} - Room: ${session.room} - Examiners: ${session.examiners[0]}, ${session.examiners[1]}`,
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

    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }
}
