import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { IAppState, Actions, Stc } from './store';
import { NgRedux, select } from 'ng2-redux';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class JsonLoaderService {

  constructor(private http: Http, private ngRedux: NgRedux<IAppState>) { }

  loadAll(){
    const hemis = ["lh", "rh"];

    const stcFiles = [
      ['Tone_Change_Left_Right-lh.stc.json','lh'],
      ['Tone_Change_Left_Right-rh.stc.json','rh'],
      ['Tone_Change_Right_Left-lh.stc.json','lh'],
      ['Tone_Change_Right_Left-rh.stc.json','rh'],
    ];


    const infoFiles = [
      'Tone_Change_Left_Right-info.json',
      'Tone_Change_Right_Left-info.json'
    ];

    let allObs$ = [];
    hemis.forEach(hemi => {allObs$.push(this.loadVtk(hemi))});
    stcFiles.forEach(stcFile => {allObs$.push(this.loadStc(stcFile[0], stcFile[1]))});
    infoFiles.forEach(infoFile => {allObs$.push(this.loadConditionInfo(infoFile))});
    allObs$.push(Observable.from([true]).do(this.ngRedux.dispatch({type: 'DATA_LOADED'})));
    return Observable.concat(...allObs$)
  }

  loadVtk(hemi: "lh" | "rh" | String){
    let hemiSide = hemi === 'lh' ? 'left':'right';
    return this.http.get('/assets/geometry/'+ hemiSide +'_hemisphere.json').map(res => JSON.parse(res['_body']))
    .do(geometry => {
        const action: Actions = {type: 'ADD_VTK', vtk: geometry};
        this.ngRedux.dispatch(action);
      });
  }

  loadStc(fileName: String, hemi: 'lh' | 'rh'| String){
    return this.http.get('/assets/data/' + fileName).take(1).map(res => <Stc>JSON.parse(res['_body']))
    .do(stc => {
        let action: Actions = {type: 'ADD_STC', stc: stc};
        this.ngRedux.dispatch(action);

        action = {type: 'SET_TIME_ARRAY', timeArray: stc.times};
        this.ngRedux.dispatch(action);
      });
  }

  loadConditionInfo(fileName: String){
    return this.http.get('/assets/data/' + fileName).take(1).map(res => JSON.parse(res['_body']))
    .do(info => {
        const action: Actions = {type: 'ADD_CONDITION_INFO', conditionInfo: info}
        this.ngRedux.dispatch(action);
      });
  }

}
