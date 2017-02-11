import { Observable } from 'rxjs/Rx';
interface Stc {
  data: Array<Array<number>>;
  times: number[];
}

import { Component, ViewChild, OnInit, ViewEncapsulation, Input, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ColorBarComponent } from '../color-bar/color-bar.component';
import * as THREE from 'three'
import { Http } from '@angular/http';
import { D3Service, D3, Selection, ScaleSequential } from 'd3-ng2-service';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions } from '../store';
import 'rxjs/add/operator/concat'
import * as _ from "lodash"; //


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-heatmap',
  template: `
    <md-card class="color-bar" [ngStyle]="{'width': canvasWidth + 20 + 'px', 'height': canvasHeight + 40  + 'px'}"
    style="display: flex; justify-content: center; flex-direction: column; align-items: center; padding: 0">
    <div>Activty for brain verticies and times with stimuli markers</div>
      <canvas #image [ngStyle]="{'width': canvasWidth - margin.left - margin.right + 1 + 'px', 'height': canvasHeight  + 'px'}"
      (click)="canvasClicked($event)" style="cursor:pointer"></canvas> 
      <svg #heatmap [attr.width]="canvasWidth" [attr.height]="'50'" >
      
      <line stroke="grey" y1="0" y2="20" [attr.x1]="pixelTime" [attr.x2]="pixelTime" style="z-index: -1"></line>
      <text text-anchor="middle" dominant-baseline="middle" [attr.x]="pixelTime" y="25">{{timeMs}}ms</text>
            <rect [attr.x]="stims?.stim1.x1" width="70" y = "32" height="5" stroke="#0057e7"  fill="#0057e7"  style="cursor:none"
            (mousemove)="showTooltip($event, 'stim1')" (mouseout)="hideTooltip($event)"> </rect>
            <rect [attr.x]="stims?.stim2.x1" width="70" y = "32" height="5" stroke="#0057e7"  fill="#0057e7"  style="cursor:none"
            (mousemove)="showTooltip($event, 'stim2')" (mouseout)="hideTooltip($event)"> </rect>
      </svg>  
   </md-card>
<div #tooltip class="toolTip" [ngStyle]="{'top': pos.top + 'px','left': pos.left + 'px', 'display': pos.display}">{{tooltipMessage}}</div>
      
  `,
    styles: [`
  .toolTip {
	position: absolute;
  display: inline-block;
  min-width: 80px;
  height: 20px;
  background: none repeat scroll 0 0 #ffffff;
  border: 1px solid black;
  padding: 14px;
  text-align: center;
  pointer-events: none;
}
  `]
})
export class HeatmapComponent implements OnInit, AfterViewInit {
  @ViewChild('image') canvasImage;
  @ViewChild('heatmap') heatmapSvg;
  @select((s: IAppState) => s.colorMin)  colorMin$;
  @select((s: IAppState) => s.colorMax)  colorMax$;
  @select((s: IAppState) => s.timeIndex) timeIndex$;
  @select((s: IAppState) => s.timeArray) timeArray$;
  @select((s: IAppState) => s.stcs) stcs$;
  @select((s: IAppState) => s.conditionInfo) conditionInfo$;

  @Input() infoFile: string;
  @Input() stcFile: string;
  

  d3; color_scale;
  canvasWidth = 500;
  canvasHeight = 200;
  margin   = { top: 0, left: 10, bottom: 0, right: 10 };
  pos     = {top: 0, left: 0, display: "none"}
  tooltipMessage = "";
  stims;
  pixelTime = 0;
  timeMs = 0;
  svg;
  width;
  xScale;

constructor(private http: Http, d3Service: D3Service, private ngRedux: NgRedux<IAppState>) {
    this.d3 = d3Service.getD3();

  }

  ngOnInit(){
    this.xScale = this.d3.scaleLinear().domain([-100, 500]).range([0, this.canvasWidth-this.margin.left-this.margin.right]);
    this.stims ={stim1: {x1: this.xScale(0)+this.margin.left, x2: this.xScale(70)},
                   stim2: {x1: this.xScale(145)+this.margin.left, x2: this.xScale(225)}};

      this.timeIndex$.combineLatest(this.timeArray$, (timeIX, timeArray) => {
      this.pixelTime = this.xScale(timeArray[timeIX]) + this.margin.left;
      this.timeMs = timeArray[timeIX];
    }).subscribe(x=>console.log('heatmap update'))
  }

  ngAfterViewInit() {
    this.svg = this.d3.select(this.heatmapSvg.nativeElement);
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    
    let stc$ = this.stcs$.map(arr=> arr.filter(x => x.fileName === this.stcFile)).filter(x=>x.length>0).take(1)
    let loadStc$ = stc$.do(stc => {
          this.color_scale = this.d3.scaleSequential(this.d3.interpolateWarm).domain([1, 5]);
          this.timeVertsImage(stc[0], this.color_scale, 0);
          console.log('heatmap STC', stc[0], this.stcFile === stc[0].fileName)
          this.renderD3Axis();
    });
    const timeOrColorChange$ = this.colorMin$
        .combineLatest(this.colorMax$, stc$,
         (min, max, stc) => {
          this.color_scale.domain([min,max])
          this.timeVertsImage(stc[0], this.color_scale, min);
          //update time here?
         });
    Observable.concat(loadStc$, timeOrColorChange$).subscribe(x=>console.log('update heatmap'));
    
    
  }

public timeVertsImage(stc_data: Stc, colorScale, min){
    var dataDims = {width: stc_data.data.length, height: stc_data.data[0].length};
    var targetImageSizes = {width: dataDims.width, height: 1000};

    var widthStepSize = dataDims.width / targetImageSizes.width;
    var heightStepSize = dataDims.height / targetImageSizes.height;

    var widthIx  = this.d3.range(0,dataDims.width,  widthStepSize).map(x=>Math.round(x));
    var widthIx  = widthIx.length > targetImageSizes.width ? widthIx.splice(0,widthIx.length-1) : widthIx;
    var heightIx = this.d3.range(0,dataDims.height, heightStepSize).map(x=>Math.round(x));
    var heightIx  = heightIx.length > targetImageSizes.height ? heightIx.splice(0,heightIx.length-1) : heightIx;

    let sorted = stc_data.data;
    let context = this.canvasImage.nativeElement.getContext("2d")
    let image = context.createImageData(targetImageSizes.width, targetImageSizes.height); // context is a canvas to draw on

    let count = 0;
    heightIx.forEach((h)  => {
      widthIx.forEach((w) => {

        var color_obj: any = colorScale(sorted[w][h]);
        if (h < 2 && w < 2){
      }
        var color = sorted[w][h] > min ? this.d3.rgb(color_obj) : this.d3.color("rgb(160,160,160)");  // todo grey thresh
        image.data[count] = color.r;
        image.data[count + 1] = color.g;
        image.data[count + 2] = color.b;
        image.data[count + 3] = 255;
        count+=4;
      });
    });

    context.putImageData(image, 0, 0);

  }
renderD3Axis() { //todo service
    let xAxisFunc = this.d3.axisBottom(this.xScale);

    let g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')'); // aligns canvas and axis

    g.append('g')
      .attr('class', 'axis')
      .call(xAxisFunc).selectAll('text')
      .attr('font', '65px sans-serif');

      // set stim1 stim2 locations


  }

showTooltip(event: MouseEvent, stim: string) {
  this.pos.top  = event.clientY;
  this.pos.left = event.clientX;
  this.pos.display = 'inline-block'
  this.conditionInfo$.take(1).subscribe(info => info.filter(x=>x.fileName === this.infoFile).map(x=> this.tooltipMessage = x[stim]));
}

hideTooltip(event: MouseEvent) {
  this.pos.display = "none";
}

canvasClicked(event: MouseEvent) {
    var rect = this.canvasImage.nativeElement.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    let index = Math.round(this.xScale.invert(x));
    index = index % 2 === 0 ? index : index-1;
    // index = index < 0 ? 0: index; 
    this.setTime(index);
}
setTime(inputValue) {
        this.timeArray$.take(1).subscribe(timeArray=>{
            const action: Actions = { type: 'SET_TIME', timeIndex: timeArray.indexOf(+inputValue) };
            this.ngRedux.dispatch(action);
        });
    }
}
