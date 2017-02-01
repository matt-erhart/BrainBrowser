/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BrainComponent } from './brain.component';

describe('BrainComponent', () => {
  let component: BrainComponent;
  let fixture: ComponentFixture<BrainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
