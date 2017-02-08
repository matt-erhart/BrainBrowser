import { Observable } from 'rxjs/Rx';


import { Component, ViewChild, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ColorBarComponent } from '../color-bar/color-bar.component';
import * as THREE from 'three'
import { Http } from '@angular/http';
import { D3Service, D3, Selection, ScaleSequential } from 'd3-ng2-service';
import { NgRedux, select } from 'ng2-redux';
import { IAppState, Actions, Stc } from '../store';
import 'rxjs/add/operator/concat'
import * as _ from "lodash";

@Component({
  selector: 'app-brain',
  template: `
            <div #canvasid style="
                width: 510px;
                height: 370px;"
                ></div>

                `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./brain.component.css']
})


export class BrainComponent implements OnInit {
  @Input() color_min: number = 1;
  @Input() color_max: number = 5;
  @Input() hemi: string;
  @Input() stcFile: string;
  @Input() conditionInfoFile = 'Tone_Change_Left_Right-info.json';
  @select((s: IAppState) => s.timeIndex) timeIndex$;

  private tp;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: THREE.TrackballControls;

  private mesh: THREE.Mesh;
  private verts_per_hemi = 2562; // set number of verts
  // public min: number;
  // public max: number;
  private stc_loaded = false;
  public stc_colors;
  public stc_colors_up2date;
  public stc_data: Stc;
  public d3;
  private color_scale: ScaleSequential<number>;
  title = 'app works!';

  @ViewChild('canvasid') canvas;
  @ViewChild('image') canvasImage;
  @select((s: IAppState) => s.colorMin) colorMin$;
  @select((s: IAppState) => s.colorMax) colorMax$;

  constructor(private http: Http, d3Service: D3Service, private ngRedux: NgRedux<IAppState>) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {

    this.color_scale = this.d3.scaleSequential(this.d3.interpolateWarm).domain([this.color_min, this.color_max]);

    let hemiSide = this.hemi === 'lh' ? 'left':'right';
    this.init(this.canvas.nativeElement, this.hemi)  
    let files$ = this.http.get('/assets/geometry/'+ hemiSide +'_hemisphere.json').map(res => JSON.parse(res['_body']))
      .subscribe(geometry => this.onGeometryLoaded(geometry, this.hemi));

    //vtk, stc, condition
    const getStc$ = this.http.get('/assets/data/' + this.stcFile).take(1).map(res => <Stc>JSON.parse(res['_body']))
      .do(data => { this.initFromLoadedStc(data, 'lh') });

    const getStcInfo$ = this.http.get('/assets/data/' + this.conditionInfoFile).take(1).map(res => <Stc>JSON.parse(res['_body']))
      .do(data => { this.initFromLoadedStc(data, 'lh') });

    const timeOrColorChange$ = this.colorMin$
        .combineLatest(this.colorMax$, this.timeIndex$,
         (min, max, time) => {
          this.color_scale.domain([min, max]);
          let colors = this.calculateVertexColors(this.stc_data, this.color_scale, time, min);
          this.renderVertexColors(colors);
         });

    Observable.concat(getStc$, timeOrColorChange$).subscribe();

  }

  public initFromLoadedStc(stc_data: Stc, hemi: string) {
    this.stc_data = stc_data;
    this.stc_data.times = this.stc_data.times.map(x=>Math.round(x*1000));
    const action: Actions = { type: 'SET_TIME_ARRAY', timeArray: this.stc_data.times };
    this.ngRedux.dispatch(action);
    this.stc_colors = Array.apply(null, Array(this.stc_data.times.length - 1)).map(Array.prototype.valueOf, []);
    this.stc_loaded = true; //todo redux state

    let colors = this.calculateVertexColors(this.stc_data, this.color_scale, 0, this.color_min);
    this.renderVertexColors(colors);
  }

  public calculateVertexColors(stc: Stc,
    colorScale: ScaleSequential<number>,
    timePoint: number, 
    greyThresh: number): Array<number> {
    //returns Array formated for three BufferAttribute

    var data = stc.data[timePoint];
    var lutColors: number[] = [];

    for (var i = 0; i < this.verts_per_hemi; i++) {
      var color_obj: any = colorScale(data[i]);

      var color = data[i] > greyThresh ? this.d3.rgb(color_obj) : this.d3.color("gray");  //ignore
      if (color === undefined) {
        console.log("ERROR: " + data[i]);
      } else {
        lutColors[3 * i]     = color.r / 255.0;
        lutColors[3 * i + 1] = color.g / 255.0;
        lutColors[3 * i + 2] = color.b / 255.0;
      }
    }

    return lutColors;
  }

  renderVertexColors(lutColors): void {
    const brainMesh = <THREE.Mesh>this.scene.getObjectByName(this.hemi);
    let brainGeo = <THREE.BufferGeometry>brainMesh.geometry;
    let brainAttr = <THREE.BufferAttribute>brainGeo.attributes;
    brainAttr.color.array = new Float32Array(lutColors);
    brainAttr.color.needsUpdate = true;
  }

  init(container: HTMLElement, hemi: string) {
    this.hemi = hemi;
    var w = 510;
    var h = 370;
    var fullWidth = w * 2;
    var fullHeight = h * 2;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(20, container.clientWidth / container.clientHeight, 1, 10000);
    this.camera.setViewOffset(fullWidth, fullHeight, w * .5, h * .5, w, h);

    this.camera.position.set(-140, 15, 12);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    // this.controls = new THREE.TrackballControls(this.camera, container);

    //LIGHTS
    var light_color = new THREE.Color('rgb(192,192,192)');
    var light_strength = .4;
    var directionalLight = new THREE.DirectionalLight(); //light_color.getHex, light_strength
    directionalLight.position.set(-194, 15, 12);
    directionalLight.name = 'directionalLight';
    this.scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight();// light_color, light_strength );
    directionalLight.position.set(194, 15, 12);
    directionalLight.name = 'directionalLight';
    this.scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(); //
    ambientLight.name = 'ambientLight';
    this.scene.add(this.camera);
    this.scene.add(ambientLight)
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    // start animation
    this.animate();

    // bind to window resizes
    // window.addEventListener('resize', _ => this.onResize());
  }

  public animate() {
    window.requestAnimationFrame(_ => this.animate());
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onGeometryLoaded(geo, hemi) {

    var loader = new THREE.BufferGeometryLoader();
    let geometry = loader.parse(geo)

    var material = new THREE.MeshLambertMaterial({
      side: THREE.FrontSide,
      vertexColors: THREE.VertexColors,
    });

    geometry.center();
    geometry.computeVertexNormals();
    geometry.normalizeNormals();
    var lutColors = Array.apply(null, Array(this.verts_per_hemi * 3)).map(Number.prototype.valueOf, .5); // zeros for RGB
    for (var i = 0; i < this.verts_per_hemi * 3; i++) {
      lutColors[i] = Math.random();
    }

    geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(lutColors), 3));
    
    
    let brainAttr   = <THREE.BufferAttribute>geometry.attributes;
    brainAttr.color.dynamic = true;

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotateX(-30);
    this.mesh.rotateY(Math.PI);

    if (hemi === 'lh') {
      this.mesh.rotateZ(Math.PI);
      this.mesh.rotateX(Math.PI / 12.5);
    }

    this.mesh.scale.multiplyScalar(0.2);
    this.mesh.name = hemi;
    this.scene.add(this.mesh);
  }

}
