import Vue, { ComponentOptions } from 'vue'
import * as THREE from 'three'
import * as d3 from 'd3';

import Cube from '../models/Cube'
import CubeColor from '../models/CubeColor'

interface CubeView extends Vue {
  id: number
  cube: Cube,
  mesh: THREE.Mesh,
  scene: THREE.Scene,
}

export default {
  props: ['id', 'cube', 'scene'],
  data: function () {
    return {
    };
  },

  template: '<div :id="`cube-view-${id}`"/>',

  mounted: function () {
    const size = 10;
    const materials = [];
    const colors = (() => {
      var colors = [];
      colors[CubeColor.White] = 0xffffff;
      colors[CubeColor.Blue] = 0x0000ff;
      colors[CubeColor.Orange] = 0xff8c00;
      colors[CubeColor.Green] = 0x00ff00;
      colors[CubeColor.Red] = 0xff0000;
      colors[CubeColor.Yellow] = 0xffff00;
      colors[CubeColor.Black] = 0x000000;

      return colors;
    })();

    for (let i = 0; i < 6; i++) {
      materials.push(new THREE.MeshLambertMaterial({ color: colors[this.cube.colors[i]] }));
    }

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      materials
    );

    mesh.position.copy(this.cube.position);

    this.scene.add(mesh);
    this.mesh = mesh;
  },

  watch: {
    'cube.position': function () {
      this.mesh.position.copy(this.cube.position)
    },

    'cube.quaternion': function () {
      this.mesh.quaternion.copy(this.cube.quaternion);
    }
  }
} as ComponentOptions<CubeView>
