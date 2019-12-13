import { TestBed } from '@angular/core/testing';

import { ScheduleConfigsService } from './schedule-configs.service';

describe('ScheduleConfigsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScheduleConfigsService = TestBed.get(ScheduleConfigsService);
    expect(service).toBeTruthy();
  });
});
