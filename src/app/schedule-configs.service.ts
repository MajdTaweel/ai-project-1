import {Injectable} from '@angular/core';
import {FormControl} from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class ScheduleConfigsService {

    population = 20;
    iterations = 2000;
    prefsConflicts = true;
    rangeConflicts = true;

    constructor() {
    }
}
