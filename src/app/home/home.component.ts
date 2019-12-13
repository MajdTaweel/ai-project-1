import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ScheduleConfigsService} from "../schedule-configs.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    form = new FormGroup({
        iterations: new FormControl(2000),
        prefsConflicts: new FormControl(true),
        rangeConflicts: new FormControl(true)
    });

    constructor(public scheduleConfigsService: ScheduleConfigsService, private router: Router) {
    }

    ngOnInit(): void {
    }

    async generateSchedule() {
        this.scheduleConfigsService.iterations = this.form.value.iterations;
        this.scheduleConfigsService.prefsConflicts = this.form.value.prefsConflicts;
        this.scheduleConfigsService.rangeConflicts = this.form.value.rangeConflicts;
        await this.router.navigate(['projects-schedule'])
    }
}
