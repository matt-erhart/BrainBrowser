/**
 * Created by me on 6/24/2016.
 */
declare var THREE: any;
import {Stc} from '../interfaces/stc';
import { D3Service, D3 } from 'd3-ng2-service';

export class CortexService {

    private scene: any;
    private camera:   THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: THREE.TrackballControls;

    private mesh: THREE.Mesh;
    public stc_data: Stc;
    private verts_per_hemi = 2562; // set number of verts
    public tp = 0;
    public min: number;
    public max: number;
    private stc_loaded = false;
    private hemi: string;
    public stc_colors;
    public stc_colors_up2date;
    public d3;

    constructor(d3Service: D3Service) { // <-- pass the D3 Service into the constructor
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
    }

    public init(container: HTMLElement, hemi: string) {
        this.hemi = hemi;
        var w = 510;
        var h = 370;
        var fullWidth = w * 2;
        var fullHeight = h * 2;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 20, container.clientWidth / container.clientHeight, 1, 10000 );
        this.camera.setViewOffset( fullWidth, fullHeight, w * .5, h * .5, w, h );

        this.camera.position.set(-140,15,12);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.controls = new THREE.TrackballControls(this.camera, container);

        //LIGHTS
        var light_color = new THREE.Color('rgb(192,192,192)');
        var light_strength = .4;
        var directionalLight = new THREE.DirectionalLight( light_color, light_strength );
        directionalLight.position.set(-194,15,12);
        directionalLight.name = 'directionalLight';
        this.scene.add( directionalLight );

        var directionalLight = new THREE.DirectionalLight( light_color, light_strength );
        directionalLight.position.set(194,15,12);
        directionalLight.name = 'directionalLight';
        this.scene.add( directionalLight );

        var ambientLight = new THREE.AmbientLight( light_color, 1 );
        ambientLight.name = 'ambientLight';
        this.scene.add(this.camera, ambientLight);

        var loader = new THREE.VTKLoader(); // todo: get this loader

        var vtk_file = (hemi === 'lh') ? 'left_hemisphere.vtk' : 'right_hemisphere.vtk'; // todo: get these files
        loader.load( 'app/assets/' + vtk_file, geometry => this.onloaded(geometry, hemi) ); 

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor( 0xffffff );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( w, h );
        container.appendChild( this.renderer.domElement );

        this.renderer.setSize( container.clientWidth, container.clientHeight );
        // start animation
        this.animate();

        // bind to window resizes
        // window.addEventListener('resize', _ => this.onResize());
    }

    public animate() {
        window.requestAnimationFrame(_ => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public onloaded(geometry, hemi) {

        var material = new THREE.MeshLambertMaterial( {
            side: THREE.FrontSide,
            vertexColors: THREE.VertexColors,
        } );

        geometry.center();
        geometry.computeVertexNormals();
        geometry.normalizeNormals();
        var lutColors = Array.apply(null, Array(this.verts_per_hemi *3)).map(Number.prototype.valueOf, .5); // zeros for RGB
        for (var i = 0; i < this.verts_per_hemi * 3; i++) {
            lutColors[i] = Math.random();
        }

        geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( lutColors ), 3 ) );
        geometry.attributes.color.dynamic = true;
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

    public set_stc_data(stc_data: Stc, hemi: string) { // tried to make this a service of a service. Super difficult w/ these promises @RC1.
        this.stc_data = stc_data;
        this.stc_colors = Array.apply(null, Array(this.stc_data.times.length - 1)).map(Array.prototype.valueOf, []);
        this.stc_colors_up2date = Array.apply(null, Array(this.stc_data.times.length - 1)).map(Boolean.prototype.valueOf, false);
        var color_scale = this.d3.scaleSequential(this.d3.interpolateWarm)
           .domain([this.min, this.max]);
        this.color_timepoints('one_tp');

        this.color_timepoints('all');
        this.showColors(this.stc_colors[this.tp]);

        this.stc_loaded = true;

        // this.color_vertices(this.stc_data.data[0], hemi);

    }

    public color_vertices(data, color_scale) { // one time point
        // var t0 = performance.now();

        var lutColors: number[] = [];

        for (var i = 0; i < this.verts_per_hemi; i++) {
            var color_obj: any = color_scale(data[i]);

            let color = data[i] > this.min ? this.d3.rgb(color_obj) : this.d3.color('gray');  // ignore
// console.log(this.min)
            if (color === undefined) {
                console.log('ERROR: ' + data[i]);
            } else {
                    lutColors[3 * i]     = color.r / 255.0;
                    lutColors[3 * i + 1] = color.g / 255.0;
                    lutColors[3 * i + 2] = color.b / 255.0;
            }
        }
        // var t1 = performance.now();
        // console.log((t1 - t0).toFixed(4), 'milliseconds to color');

        return lutColors;

    }

    color_timepoints(what2run){ // n timepoints
        let color_scale = this.d3.scaleSequential(this.d3.interpolateWarm)
           .domain([this.min, this.max]);

        if (what2run === 'all') {
            let time_points = this.stc_data.times.length - 1;
            for (let i = 0; i < time_points; i++) {
                this.stc_colors[i] = this.color_vertices(this.stc_data.data[i], color_scale);
                this.stc_colors_up2date[i] = 1;
            }
        }
        else {
            this.stc_colors[this.tp] = this.color_vertices(this.stc_data.data[this.tp], color_scale);
            this.stc_colors_up2date[this.tp] = 1;
            }

    }

    keyControls (key) {
        if (this.stc_loaded ) {
            //noinspection TypeScriptUnresolvedVariable
            let time_points = this.stc_data.times.length - 1;
            // asdw controls
            if ( key === 'd' ) {this.tp = (this.tp < time_points ) ? this.tp+1 : time_points; } // a: move ahead a tp but not too far
            if ( key === 'a' ) {this.tp = (this.tp > 0 ) ? this.tp-1 : 0; } // a: move ahead a tp but not too far
             // d: move back but not too far
            if ( key === 'Enter' ) {
                this.color_timepoints('all');
                console.log(';)');

            } // pre-computer all timepoints

            //noinspection TypeScriptUnresolvedVariable
            // this.color_timepoints('this_time_point')
            this.showColors(this.stc_colors[this.tp]);
            // console.log(this.stc_colors[this.tp])

            // this.color_vertices(this.stc_data.data[this.tp], this.hemi);

        }
    }

    updateColor (min, max) {
        if (this.stc_loaded) {
            this.min = min;
            this.max = max;
            let color_scale = this.d3.scaleSequential(this.d3.interpolateWarm)
               .domain([this.min, this.max]);
            this.color_timepoints('one');
            this.showColors(this.stc_colors[this.tp]);
        }
    }

    showColors(lutColors){
        this.scene.getObjectByName(this.hemi).geometry.attributes.color.array = new Float32Array(lutColors);
        this.scene.getObjectByName(this.hemi).geometry.attributes.color.needsUpdate = true;
    }
}