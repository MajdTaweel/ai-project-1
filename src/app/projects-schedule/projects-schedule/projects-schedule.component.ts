import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CalendarEvent} from 'angular-calendar';
import {addDays, addHours, startOfDay, setHours, setMinutes, setDay, setMonth, setYear} from 'date-fns';
import {Observable, of} from "rxjs";
import {ScheduleConfigsService} from "../../schedule-configs.service";
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {Router} from "@angular/router";

@Component({
    selector: 'app-projects-schedule',
    templateUrl: './projects-schedule.component.html',
    styleUrls: ['./projects-schedule.component.scss']
})
export class ProjectsScheduleComponent implements OnInit, AfterViewInit {

    angleLeft = faAngleLeft;
    viewDate: Date = new Date();
    sessions: {
        project: {
            name: string,
            supervisor: string,
            students: string[]
        },
        day: number,
        time: number,
        room: string,
        examiners: string[],
        numberOfConflicts: number
    }[];

    events: Observable<CalendarEvent[]> = null;

    constructor(private scheduleConfigsService: ScheduleConfigsService, public router: Router) {
    }

    ngOnInit() {
    }

    async ngAfterViewInit() {
        try {
            const sessionJsonStr = await eel.optimize_schedule(
                this.scheduleConfigsService.population,
                this.scheduleConfigsService.iterations,
                !this.scheduleConfigsService.prefsConflicts,
                !this.scheduleConfigsService.rangeConflicts
            )();
            console.log(sessionJsonStr);
            this.sessions = JSON.parse(sessionJsonStr).sessions;
            console.log(this.sessions);
            const events = [];
            for (let session of this.sessions) {
                events.push({
                    start: setYear(setMonth(setDay(setHours(setMinutes(new Date(), 0), (8 + session.time)), (9 + 2 * session.day - 10)), 11), 2019),
                    end: setYear(setMonth(setDay(setHours(setMinutes(new Date(), 50), (8 + session.time)), (9 + 2 * session.day - 10)), 11), 2019),
                    title: `${session.project.name} Room: ${session.room}`,
                    allDay: false,
                })
            }
            console.log(events);
            this.events = of(events);
        } catch (e) {
            await this.router.navigate(['/']);
        }
    }

}
