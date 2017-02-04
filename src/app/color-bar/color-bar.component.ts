import { Subscription } from 'rxjs/Rx';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions } from '../store';
import 'rxjs/add/operator/combineLatest'

@Component({
  selector: 'color-bar',
  templateUrl: './color-bar.component.html',
  styleUrls: ['./color-bar.component.scss']
})

export class ColorBarComponent implements AfterViewInit, OnChanges, OnDestroy {
  private htmlElement; // Host HTMLElement
  private d3ParentElement;
  @Input() canvasWidth = 600;
  @Input() colorbarHeight = 50;

  private subscriptions: Array<Subscription> = [];

  public d3: D3; // <-- Define the private member which will hold the d3 reference
  private parentNativeElement: any;
  // @select() counter;
  @select((s: IAppState) => s.colorMin) colorMin$;
  @select((s: IAppState) => s.colorMax) colorMax$;
  @select((s: IAppState) => s.timeIndex) timeIndex$;


  constructor(element: ElementRef, d3Service: D3Service, private ngRedux: NgRedux<IAppState>) {
    this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
    this.d3ParentElement = this.d3.select(element.nativeElement);
  }

  setColorMin(inputValue) {
    const action: Actions = { type: 'SET_COLOR_MIN', colorMin: inputValue };
    this.ngRedux.dispatch(action);
  }

  setColorMax(inputValue) {
    const action: Actions = { type: 'SET_COLOR_MAX', colorMax: inputValue };
    this.ngRedux.dispatch(action);
  }

  ngAfterViewInit() {
    this.subscriptions.push(
      this.colorMin$
        .combineLatest(this.colorMax$, (min, max) => this.transitionD3Axis(min, max)).subscribe()
    );

    this.renderColorBar();
    this.renderD3Axis();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  };

  ngOnChanges() {
  }

  
  renderColorBar() {
    const canvas = this.d3ParentElement.select('canvas').node();
    const context = canvas.getContext('2d');

    let image = context.createImageData(canvas.width, 1); // context is a canvas to draw on
    for (let i = 0, k = 0; i < canvas.width; ++i, k += 4) {
      let c = this.d3.rgb(this.d3.interpolateWarm(i / (canvas.width - 1)));
      image.data[k] = c.r;
      image.data[k + 1] = c.g;
      image.data[k + 2] = c.b;
      image.data[k + 3] = 255;
    }

    context.putImageData(image, 0, 0);
  }

  renderD3Axis() {
    const svg = this.d3.select('svg'),
      margin = { top: 0, left: 0, bottom: 0, right: 0 },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

    let xScale = this.d3.scaleLinear().domain([0, 10]).range([20, width - 20]);
    let xAxisFunc = this.d3.axisBottom(xScale);

    let g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // aligns canvas and axis

    g.append('g')
      .attr('class', 'axis')
      .call(xAxisFunc).selectAll('text')
      .attr('font', '65px sans-serif');

  }

  transitionD3Axis(min, max) {
    let xScale = this.d3.scaleLinear().domain([min, max]).range([20, this.canvasWidth - 20]);
    let xAxisFunc = this.d3.axisBottom(xScale);
    this.d3.select('.axis').call(xAxisFunc);
  }
}
