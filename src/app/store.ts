import { tassign } from 'tassign'
export interface IAppState {
    colorMin: Number;
    colorMax: Number;
    timeIndex: Number;
    timeArray: Array<number>;
    stcs: Array<Stc>;
    vtks: Array<Vtk>;
    conditionInfo: Array<ConditionInfo>;
    dataLoaded: boolean;
};

export interface Actions {
    type: 'SET_COLOR_MIN' | 'SET_COLOR_MAX' | 'SET_TIME' | 'SET_TIME_ARRAY' | 'ADD_STC' |
    'ADD_CONDITION_INFO' | 'ADD_VTK' | 'DATA_LOADED';
    colorMin?: Number;
    colorMax?: Number;
    timeIndex?: Number;
    timeArray?: Array<number>;
    stc?: Stc;
    vtk?: Vtk;
    conditionInfo?: Array<ConditionInfo>;
    dataLoaded?: boolean;
};

export const Initial_State: IAppState = {
    colorMin: 1,
    colorMax: 5,
    timeIndex: 0,
    timeArray: [],
    stcs: [],
    vtks: [],
    conditionInfo: [],
    dataLoaded: false
};

export function rootReducer(state: IAppState, action: Actions): IAppState {
    switch (action.type) {
        case 'SET_COLOR_MIN':  return tassign(state, { colorMin: action.colorMin });
        case 'SET_COLOR_MAX':  return tassign(state, { colorMax: action.colorMax });
        case 'SET_TIME':       return tassign(state, { timeIndex: action.timeIndex });
        case 'SET_TIME_ARRAY': return tassign(state, { timeArray: action.timeArray });
        case 'ADD_STC':        return tassign(state, { stcs: [...state.stcs, action.stc] });
        case 'ADD_VTK':        return tassign(state, { vtks: [...state.vtks, action.vtk] });
        case 'ADD_CONDITION_INFO': return tassign(state, { conditionInfo: [...state.conditionInfo, action.conditionInfo] });
        case 'DATA_LOADED':     return tassign(state, {dataLoaded: true});
    }
    return state;
}

export interface Stc {
  data?: Array<Array<number>>;
  times?: number[];
  hemi?: String | 'lh' | 'rh';
  fileName?: String;
};

export interface Vtk {
  data?: any;
  hemi?: String | 'lh' | 'rh';
  fileName?: String;
};

export interface ConditionInfo {
  stim1?: String;
  stim2?: String;
  fileName?: String;
};