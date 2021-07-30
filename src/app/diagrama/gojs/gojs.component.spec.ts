import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GojsComponent } from './gojs.component';

describe('GojsComponent', () => {
  let component: GojsComponent;
  let fixture: ComponentFixture<GojsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GojsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GojsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
