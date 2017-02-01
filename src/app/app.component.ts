import { MdListDivider } from '@angular/material';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { ColorBarComponent } from './color-bar/color-bar.component';
import * as THREE from 'three'
import { Http } from '@angular/http';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions } from './store';
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import 'rxjs/add/observable/concat'

import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/concat'

    

      
//   <app-brain></app-brain>
@Component({
    selector: 'app-root',
    template: ` 

  <color-bar></color-bar>
  <div style="display: flex; flex-direction: row">
      <app-brain [stcFile]="'First_Tone_Left_Right-lh.stc.json'" hemi='lh'></app-brain>
      <app-brain [stcFile]="'First_Tone_Left_Right-rh.stc.json'" hemi='rh'></app-brain>
  </div> 
  <div style="display: flex; flex-direction: row">
      <app-brain [stcFile]="'First_Tone_Right_Left-lh.stc.json'" hemi='lh'></app-brain>
      <app-brain [stcFile]="'First_Tone_Right_Left-rh.stc.json'" hemi='rh'></app-brain>
  </div> 
  

    <h1>{{timeIndex$ | async}}</h1>
    <input type = "number" 
    (change)="setTime($event.target.value)"
    [placeholder]="timeIndex$ | async">
                `,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class AppComponent implements OnInit {
    @select((s: IAppState) => s.timeIndex) timeIndex$;

    constructor(private ngRedux: NgRedux<IAppState>) { }

    ngOnInit() {    }

    setTime(inputValue) {
        const action: Actions = { type: 'SET_TIME', timeIndex: inputValue };
        this.ngRedux.dispatch(action);
    }


}
