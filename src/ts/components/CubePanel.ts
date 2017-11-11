import Vue, { ComponentOptions } from 'vue'
import * as THREE from 'three'
import * as d3 from 'd3';
import 'imports-loader?THREE=three!three/examples/js/controls/OrbitControls';

import Cube333 from '../models/Cube333'
import Cube from '../models/Cube'

interface CubePanel extends Vue {
  cubes: Cube333,
  controls: THREE.OrbitControls,
  scene: THREE.Scene,
  light: THREE.Light,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,

  action(): void,
  initCube(): void,
  render(): void,

  load(data: any): void,
  save(data: any): void,
  rebase(): void,
}

export default {
  data: function () {
  return {
    cubes: new Cube333()
  };
  },

  template: `
  <div id="cube-stage">
    <cube v-once v-for="(cube, index) in cubes.cubes"
    :id="index"
    :cube="cube"
    :scene="scene"
    key="index">
    </cube>
    </div>`,

  created: function () {
    const width = 320;
    const height = 320;
    const backgroundColor = 0x333333;

    this.scene = new THREE.Scene();

    this.light = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.light);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.set(-50, 30, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(backgroundColor);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.scene.add(new THREE.AxisHelper(1000));

    this.$store.state.bus.$on('loadCube', this.load);
    this.$store.state.bus.$on('saveCube', this.save);
    this.$store.state.bus.$on('rebaseCube', this.rebase);
  },

  mounted: function () {
    document.getElementById('cube-stage').appendChild(this.renderer.domElement);

    this.render();
  },

  methods: {
    render: function () {
      requestAnimationFrame(this.render);
      this.action();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },

    action: function () {
      const activeLink = this.$store.state.activeLink;
      this.cubes.action(activeLink);
    },

    load: function(data: any): void {
      const cubes: Cube[] = [];
      data.baseCubes.forEach(baseCube => {
        const cube: Cube = this.cubes.cubes.filter(baseCube.No)[0];
        cube.pos = new THREE.Vector3(baseCube.pos.x, baseCube.pos.y, baseCube.pos.z);
        cube.dir = new THREE.Quaternion(baseCube.dir.x, baseCube.dir.y, baseCube.dir.z, baseCube.dir.w);
        cubes.push(cube);
      });
      this.cubes.cubes = cubes;
      this.cubes.rebase();
    },

    save: function(outData: any): void {
      outData.baseCubes = this.cubes.baseCubes.map(baseCube => {
        return {
          pos: {
            x: baseCube.pos.x,
            y: baseCube.pos.y,
            z: baseCube.pos.z,
          },
          dir: {
            x: baseCube.dir.x,
            y: baseCube.dir.y,
            z: baseCube.dir.z,
            w: baseCube.dir.w,
          },
        };
      });
    },

    rebase: function(): void {
      this.cubes.rebase();
    }
  },

  watch: {
    '$store.state.selectedNode': function (node) {
      if (node == null) {
        return;
      }

      this.cubes.reset(node);
    }
  }
} as ComponentOptions<CubePanel>
