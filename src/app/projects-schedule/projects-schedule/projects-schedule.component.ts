import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

import {Observable, of} from "rxjs";

import {ScheduleConfigsService} from "../../schedule-configs.service";

import {CalendarEvent} from 'angular-calendar';
import {setHours, setMinutes, setDay, setMonth, setYear} from 'date-fns';

import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';

import {ChartOptions, ChartType, ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import 'chartjs-plugin-zoom';


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
    chart;

    public barChartOptions: ChartOptions = {
        responsive: true,
        title: {
            display: true,
            text: 'Fitness Chart'
        },
        scales: {xAxes: [{}], yAxes: [{}]},
        plugins: {
            zoom: {
                // Container for pan options
                pan: {
                    // Boolean to enable panning
                    enabled: true,

                    drag: true,

                    // Panning directions. Remove the appropriate direction to disable
                    // Eg. 'y' would only allow panning in the y direction
                    // A function that is called as the user is panning and returns the
                    // available directions can also be used:
                    //   mode: function({ chart }) {
                    //     return 'xy';
                    //   },
                    mode: 'x',

                    rangeMin: {
                        // Format of min pan range depends on scale type
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        // Format of max pan range depends on scale type
                        x: null,
                        y: null
                    },

                    // Function called while the user is panning
                    onPan: ({chart}) => {
                        console.log(`I'm panning!!!`);
                        this.chart = chart;
                    },
                    // Function called once panning is completed
                    onPanComplete: function ({chart}) {
                        console.log(`I was panned!!!`);
                    }
                },

                // Container for zoom options
                zoom: {
                    // Boolean to enable zooming
                    enabled: true,

                    // Enable drag-to-zoom behavior
                    drag: false,

                    // Drag-to-zoom effect can be customized
                    // drag: {
                    // 	 borderColor: 'rgba(225,225,225,0.3)'
                    // 	 borderWidth: 5,
                    // 	 backgroundColor: 'rgb(225,225,225)',
                    // 	 animationDuration: 0
                    // },

                    // Zooming directions. Remove the appropriate direction to disable
                    // Eg. 'y' would only allow zooming in the y direction
                    // A function that is called as the user is zooming and returns the
                    // available directions can also be used:
                    //   mode: function({ chart }) {
                    //     return 'xy';
                    //   },
                    mode: 'x',

                    rangeMin: {
                        // Format of min zoom range depends on scale type
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        // Format of max zoom range depends on scale type
                        x: null,
                        y: null
                    },

                    // Speed of zoom via mouse wheel
                    // (percentage of zoom on a wheel event)
                    speed: 5.0,

                    // Function called while the user is zooming
                    onZoom: ({chart}) => {
                        console.log(`I'm zooming!!!`);
                        this.chart = chart;
                    },
                    // Function called once zooming is completed
                    onZoomComplete: function ({chart}) {
                        console.log(`I was zoomed!!!`);
                    }
                }
            }
        }
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

                if (this.scheduleConfigsService.iterations >= 1000) {
                    if (i === Math.trunc(this.scheduleConfigsService.iterations * 0.4)) {
                        this.scheduleConfigsService.rangeConflicts = false;
                        // fitness = JSON.parse(await eel.populate(
                        //     !this.scheduleConfigsService.prefsConflicts,
                        //     !this.scheduleConfigsService.rangeConflicts
                        // )());
                    }

                    if (i === Math.trunc(this.scheduleConfigsService.iterations * 0.75)) {
                        this.scheduleConfigsService.prefsConflicts = false;
                        // fitness = JSON.parse(await eel.populate(
                        //     !this.scheduleConfigsService.prefsConflicts,
                        //     !this.scheduleConfigsService.rangeConflicts
                        // )());
                    }
                }

                fitness = JSON.parse(await eel.get_next_gen(
                    !this.scheduleConfigsService.prefsConflicts,
                    !this.scheduleConfigsService.rangeConflicts
                )());

                this.barChartLabels.push(`Gen ${i + 2}`);
                this.barChartData[0].data.push(fitness.min.value);
                this.barChartData[1].data.push(fitness.avg);
                this.barChartData[2].data.push(fitness.max.value);

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
                const hours = [9, 10, 11, 12, 1, 2];
                const minutes = [0, 50];
                events.push({
                    start: setYear(setMonth(setDay(setHours(setMinutes(new Date(), minutes[0]), hours[session.time - 1]), (2 * session.day - 1)), 11), 2019),
                    end: setYear(setMonth(setDay(setHours(setMinutes(new Date(), minutes[1]), hours[session.time - 1]), (2 * session.day - 1)), 11), 2019),
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

    onResetZoom() {
        if (this.chart) {
            this.chart.resetZoom();
        }
    }
}
