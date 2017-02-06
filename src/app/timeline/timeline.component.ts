import { MdTooltip } from '@angular/material';
import { Subscription } from 'rxjs/Rx';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { D3Service, D3, Selection,ScaleLinear } from 'd3-ng2-service';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions } from '../store';
import 'rxjs/add/operator/combineLatest';

@Component({
  selector: 'app-timeline',
  template: `
<div #tooltip class="toolTip" [ngStyle]="{'top': pos.top + 'px','left': pos.right + 'px', 'display': pos.display}">{{tooltipMessage}}</div>

       `,
  styles: [`
  .toolTip {
	position: absolute;
  display: inline-block;
  min-width: 80px;
  height: 100px;
  background: none repeat scroll 0 0 #ffffff;
  border: 1px solid #6F257F;
  padding: 14px;
  text-align: center;
  pointer-events: none;
}
  `]
})
export class TimelineComponent implements AfterViewInit {
  private d3ParentElement;
  private d3: D3;
  private svg;
  private tooltipMessage;
  @ViewChild('tooltip') tooltip;
  public pos = {top: 0, right: 0, display: 'none'};

  constructor(element: ElementRef, d3Service: D3Service, private ngRedux: NgRedux<IAppState>) {
    this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
    this.d3ParentElement = this.d3.select(element.nativeElement);
  }

  ngAfterViewInit() {
        console.log(this.tooltip)

      let outerWidth = 600; let outerHeight = 200;
      let margin = {left: 100, right: 50, top: 50, bottom: 50};
      let innerWidth  = outerWidth - margin.left - margin.right;
      let innerHeight = outerHeight - margin.top - margin.bottom;

      this.svg = this.d3ParentElement.append('svg').attr('width', outerWidth).attr('height', outerHeight)
         .append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);


    const xScale = this.d3.scaleLinear().domain([-100, 500]).range( [0, outerWidth] );
    const yScale = this.d3.scaleBand().range( [innerHeight, 0] ).domain(['condition1', 'condition2'])
    let   xAxisFunc = this.d3.axisBottom(xScale);
    let   yAxisFunc = this.d3.axisLeft(yScale);
    
    const data = [
      {name: 'condition1', start: 0, width: 70},
      {name: 'condition2', start: 145, width: 70}
      ];
      var tooltip =  this.d3ParentElement.append("div").attr("class", "toolTip");

    this.svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.start))
        .attr("height", yScale.bandwidth())
        .attr("y", function(d) { return yScale(d.name); })
        .attr("width", function(d) { return xScale(d.width - 100); })
        .on("mousemove", d => { this.tooltipMessage = d.name;
                                this.pos.right = this.d3.event.clientX+5;
                                this.pos.top = this.d3.event.clientY+5
                                this.pos.display = 'inline-block' })
    		.on("mouseout", d =>  { this.tooltipMessage = '', this.pos.display = 'none'})

        this.svg.append("line")
        .attr('y1', 0)
        .attr('x2', xScale(0))
        .attr('y2', innerHeight)
        .attr('x1', xScale(0))
        .style("stroke", "black")  // colour the line

   
   let yAxis = this.svg.append('g').call(yAxisFunc).selectAll('text').attr('font-size', 15);
   let xAxis = this.svg.append('g').attr('transform', `translate(0,${innerHeight} )`).call(xAxisFunc).selectAll('text')
                    .attr('font-size', 15);
// var g = svg.append("g")
// 		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
// d3.json("data.json", function(error, data) {
//   	if (error) throw error;
  
//   	data.sort(function(a, b) { return a.value - b.value; });
  
//   	x.domain([0, d3.max(data, function(d) { return d.value; })]);
//     y.domain(data.map(function(d) { return d.area; })).padding(0.1);

//     g.append("g")
//         .attr("class", "x axis")
//        	.attr("transform", "translate(0," + height + ")")
//       	.call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

//     g.append("g")
//         .attr("class", "y axis")
//         .call(d3.axisLeft(y));

//     g.selectAll(".bar")
//         .data(data)
//       .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", 0)
//         .attr("height", y.bandwidth())
//         .attr("y", function(d) { return y(d.area); })
//         .attr("width", function(d) { return x(d.value); })
//         .on("mousemove", function(d){
//             tooltip
//               .style("left", d3.event.pageX - 50 + "px")
//               .style("top", d3.event.pageY - 70 + "px")
//               .style("display", "inline-block")
//               .html((d.area) + "<br>" + "£" + (d.value));
//         })
//     		.on("mouseout", function(d){ tooltip.style("display", "none");});
// });
  }

}
