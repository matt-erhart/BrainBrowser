import { Observable } from 'rxjs/Rx';
interface Stc {
  data: Array<Array<number>>;
  times: number[];
}

import { Component, ViewChild, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ColorBarComponent } from '../color-bar/color-bar.component';
import * as THREE from 'three'
import { Http } from '@angular/http';
import { D3Service, D3, Selection, ScaleSequential } from 'd3-ng2-service';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions } from '../store';
import 'rxjs/add/operator/concat'
import * as _ from "lodash";

@Component({
  selector: 'app-heatmap',
  template: `
    <div class="color-bar" [ngStyle]="{'width': canvasWidth + 50 + 'px', 'height': canvasHeight  + 'px'}"
    style="display: flex; justify-content: center; flex-direction: column; align-items: center">
      <canvas #image [ngStyle]="{'width': canvasWidth - margin.left - margin.right + 1 + 'px', 'height': canvasHeight  + 'px'}"></canvas>
      <svg [attr.width]="canvasWidth" [attr.height]="'50'" ></svg>
      
   </div>
              

  `,
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements OnInit {
  @ViewChild('image') canvasImage;
  d3; color_scale;
  canvasWidth = 500;
  canvasHeight = 200;
  margin = { top: 0, left: 10, bottom: 0, right: 10 };


constructor(private http: Http, d3Service: D3Service, private ngRedux: NgRedux<IAppState>) {
    this.d3 = d3Service.getD3();
  }
  ngOnInit() {

    let min = 1; 
    let max = 6;
    this.color_scale = this.d3.scaleSequential(this.d3.interpolateWarm).domain([min, max]);
    const getStc$ = this.http.get('/assets/data/Tone_Change_Left_Right-lh.stc.json')
    .take(1).map(res => <Stc>JSON.parse(res['_body']))
      .do(data => { 
      this.timeVertsImage(data, this.color_scale, min);
      this.renderD3Axis();
     }).subscribe();
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

    // let sorted = stc_data.data;//.map(timepoint => timepoint.sort((a,b)=>a-b));
    // let sortRef = stc_data.data[100].sort().splice(0, targetImageSizes.height);

    let sorted = stc_data.data;
    let context = this.canvasImage.nativeElement.getContext("2d")
    let image = context.createImageData(targetImageSizes.width, targetImageSizes.height); // context is a canvas to draw on

    let count = 0;
    heightIx.forEach((h)  => {
      widthIx.forEach((w) => {

        var color_obj: any = colorScale(sorted[w][h]);
        if (h < 2 && w < 2){
        console.log(sorted[w][h] > min, sorted[w][h], min)
      }
        var color = sorted[w][h] > min ? this.d3.rgb(color_obj) : this.d3.color("grey");  // todo grey thresh
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
  let margin = this.margin;
    const svg = this.d3.select('svg'),
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

    let xScale = this.d3.scaleLinear().domain([-100, 500]).range([0, width]);
    let xAxisFunc = this.d3.axisBottom(xScale);

    let g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // aligns canvas and axis

    g.append('g')
      .attr('class', 'axis')
      .call(xAxisFunc).selectAll('text')
      .attr('font', '65px sans-serif');

  }
}
