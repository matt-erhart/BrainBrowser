import { MdListDivider } from '@angular/material';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { ColorBarComponent } from './color-bar/color-bar.component';
import * as THREE from 'three';
import { Http } from '@angular/http';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions } from './store';
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/do';

//   <div style="display: flex; flex-direction: row">
//       <app-brain [stcFile]="'Tone_Change_Right_Left-lh.stc.json'" hemi='lh'></app-brain>
//       <app-brain [stcFile]="'Tone_Change_Right_Left-rh.stc.json'" hemi='rh'></app-brain>
//   </div> 
@Component({
    selector: 'app-root',
    template: ` 
<app-heatmap></app-heatmap>
<div *ngIf="false">
  <color-bar></color-bar>
<app-brain [stcFile]="'Tone_Change_Right_Left-lh.stc.json'" hemi='lh'></app-brain>
  <div style="display: flex; flex-direction: row">
      <app-brain [stcFile]="'Tone_Change_Left_Right-lh.stc.json'" hemi='lh'></app-brain>
      <app-brain [stcFile]="'Tone_Change_Left_Right-rh.stc.json'" hemi='rh'></app-brain>
  </div> 

    <h1 *ngIf="time$|async" >{{(time$ | async)}} milliseconds</h1>
    <input *ngIf="time$|async" type = "number"
    [min]="minTime" [max]="maxTime" [step]="stepTime" [value]="time$|async"
    (change)="setTime($event.target.value)"
    [placeholder]="timeIndex$ | async">
    <md-slider thumbLabel tickInterval="50" min="-100" max="500" step="2" [value]="time$|async" style= "width: 500px"
    (change)="setTime($event.value)"></md-slider>
    </div>
                `,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AppComponent implements OnInit {
    @select((s: IAppState) => s.timeIndex) timeIndex$;
    @select((s: IAppState) => s.timeArray) timeArray$;
    time$: Observable<any>;
    minTime: number;
    maxTime: number;
    stepTime: number;

    constructor(private ngRedux: NgRedux<IAppState>) {  }

    ngOnInit() {
        this.time$ = this.timeArray$.filter(x => x !== null).do(timeArray => {
            this.minTime  = timeArray[0];
            this.maxTime  = timeArray[timeArray.length - 1];
            this.stepTime = timeArray[1] - timeArray[0];
            console.log('step',this.stepTime);
        }).switchMap( timeArray => {
            return this.timeIndex$.filter(x => x !== null).map(ix => timeArray[ix]);
        }
        );
      }

    setTime(inputValue) {
        this.timeArray$.take(1).subscribe(timeArray=>{
            const action: Actions = { type: 'SET_TIME', timeIndex: timeArray.indexOf(+inputValue) };
            this.ngRedux.dispatch(action);
        });
    }
    slider(event){
        console.log(event);
    }
}
