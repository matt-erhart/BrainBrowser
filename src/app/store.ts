import {tassign} from 'tassign'
export interface IAppState {
    colorMin: Number;
    colorMax: Number;
    timeIndex: Number;
    timeArray: Array<number>;

};

export interface Actions {
    type: 'SET_COLOR_MIN' | 'SET_COLOR_MAX' | 'SET_TIME' | 'SET_TIME_ARRAY' | 'ZOOM_BRAINS' |
    'RESET_BRAIN_VIEW';
    colorMin?: Number;
    colorMax?: Number;
    timeIndex?: Number;
    timeArray?: Array<number>;
};

export const Initial_State: IAppState = {
    colorMin: 2,
    colorMax: 10,
    timeIndex: 0,
    timeArray: []
};

export function rootReducer(state: IAppState, action: Actions): IAppState {
    switch( action.type ){
        case 'SET_COLOR_MIN':     return tassign( state, {colorMin:  action.colorMin });
        case 'SET_COLOR_MAX':     return tassign( state, {colorMax:  action.colorMax });
        case 'SET_TIME':          return tassign( state, {timeIndex: action.timeIndex });
        case 'SET_TIME_ARRAY':    return tassign( state, {timeArray: action.timeArray });
        }
    return state;
};