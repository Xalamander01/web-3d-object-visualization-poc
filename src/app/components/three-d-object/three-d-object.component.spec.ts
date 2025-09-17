import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDObjectComponent } from './three-d-object.component';

describe('ThreeDObjectComponent', () => {
  let component: ThreeDObjectComponent;
  let fixture: ComponentFixture<ThreeDObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeDObjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeDObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
