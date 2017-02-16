import { DevToolsExtension } from 'ng2-redux/lib/components/dev-tools';
// angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// 3rd party
import { D3Service } from 'd3-ng2-service'; // <-- import statement
import { NgRedux, NgReduxModule } from 'ng2-redux';
import { MaterialModule } from '@angular/material';
import 'hammerjs';
import { AngularFireModule } from 'angularfire2';

// my services
// import {CortexService} from './services/cortex.service';
import { IAppState, Initial_State, rootReducer } from './store';
import {JsonLoaderService} from './json-loader.service'

// my components
import { AppComponent } from './app.component';
import { ColorBarComponent } from './color-bar/color-bar.component';


import { BrainComponent } from './brain/brain.component';
import { TimelineComponent } from './timeline/timeline.component';
import { HeatmapComponent } from './heatmap/heatmap.component';

@NgModule({
  declarations: [
    AppComponent,
    ColorBarComponent,
    BrainComponent,
    TimelineComponent,
    HeatmapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgReduxModule,
    MaterialModule.forRoot(),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyDMohBmhN4j6PCQvrSMp7fFOtiH1AEWL4E",
      authDomain: "brainbrowser-ab65c.firebaseapp.com",
      databaseURL: "https://brainbrowser-ab65c.firebaseio.com",
      storageBucket: "brainbrowser-ab65c.appspot.com",
      messagingSenderId: "400307061060"
    }),
  ],
  providers: [D3Service,JsonLoaderService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {
  constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
    let enhancer = isDevMode() ? [devTools.enhancer()] : [];
    let middleware = [];
    ngRedux.configureStore(rootReducer, Initial_State, middleware, []);

  }
}
