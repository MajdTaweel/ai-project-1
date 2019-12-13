import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsScheduleComponent } from './projects-schedule.component';

describe('ProjectsScheduleComponent', () => {
  let component: ProjectsScheduleComponent;
  let fixture: ComponentFixture<ProjectsScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
