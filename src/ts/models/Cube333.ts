import Cube from './Cube'
import CubeColor from './CubeColor'
import CubeUtils from './CubeUtils'
import GraphNode from './GraphNode'
import * as THREE from 'three'

export default class Cube333 {
  cubes: Cube[];
  rotations: string[] = [];

  constructor() {
    this.cubes = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const no = x * 9 + y * 3 + z;
          const cube = new Cube(no);
          cube.pos = new THREE.Vector3(x - 1, y - 1, z - 1);
          cube.colors = Cube333.cubeColors[x][y][z];
          this.cubes.push(cube);
        }
      }
    }
  }

  action() {
  }

  fixate(path: string) {
    const targets: Cube[] = [];
    Cube333.targetCubes[path].forEach((no) => {
      this.cubes[no].rotate(Cube333.axes[path], Cube333.directions[path], Math.PI / 2);
    });

    const previousCubes = this.cubes.concat();
    Cube333.cubeMoves[path].forEach((no, index) => {
      this.cubes[no] = previousCubes[Cube333.targetCubes[path][index]];
      const z = (no % 3) - 1;
      const y = Math.floor((no / 3) % 3) - 1;
      const x = Math.floor((no / 9)) - 1;
      const v = new THREE.Vector3(x, y, z);
      this.cubes[no].pos = v;
      this.cubes[no].dir = this.cubes[no].quaternion.clone();
    });
  }

  reset(node: GraphNode) {
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const no = x * 9 + y * 3 + z;
          const cube = this.cubes.filter((cube) => cube.no === no)[0];
          cube.pos = new THREE.Vector3(x - 1, y - 1, z - 1);
          cube.dir = new THREE.Quaternion();
        }
      }
    }

    this.cubes = this.cubes.sort((c1, c2) => (c1.no < c2.no) ? -1 : 1)

    const paths = node.pathsFromRoot()[0];
    const pathsArr: string[] = CubeUtils.pathsToArray(paths);
    pathsArr.forEach(path => {
      this.fixate(path);
    });
  }

  static cubeColors = (() => {
    const W = CubeColor.White,
      B = CubeColor.Blue,
      O = CubeColor.Orange,
      G = CubeColor.Green,
      R = CubeColor.Red,
      Y = CubeColor.Yellow,
      K = CubeColor.Black;
    const cubeColors = [
      [
        [
          [K, G, K, W, K, R],
          [K, G, K, W, K, K],
          [K, G, K, W, O, K],
        ], [
          [K, G, K, K, K, R],
          [K, G, K, K, K, K],
          [K, G, K, K, O, K],
        ], [
          [K, G, Y, K, K, R],
          [K, G, Y, K, K, K],
          [K, G, Y, K, O, K],
        ]
      ], [
        [
          [K, K, K, W, K, R],
          [K, K, K, W, K, K],
          [K, K, K, W, O, K],
        ], [
          [K, K, K, K, K, R],
          [K, K, K, K, K, K],
          [K, K, K, K, O, K],
        ], [
          [K, K, Y, K, K, R],
          [K, K, Y, K, K, K],
          [K, K, Y, K, O, K],
        ]
      ], [
        [
          [B, K, K, W, K, R],
          [B, K, K, W, K, K],
          [B, K, K, W, O, K],
        ], [
          [B, K, K, K, K, R],
          [B, K, K, K, K, K],
          [B, K, K, K, O, K],
        ], [
          [B, K, Y, K, K, R],
          [B, K, Y, K, K, K],
          [B, K, Y, K, O, K],
        ]
      ],
    ];

    return cubeColors;
  })()

  static axes = (() => {
    const axes = {
      "U" : "-Y",
      "D" : "Y",
      "R" : "-X",
      "L" : "X",
      "F" : "-Z",
      "B" : "Z",
      "E" : "Y",
      "M" : "X",
      "S" : "-Z",
      "Uw": "-Y",
      "Dw": "Y",
      "Rw": "-X",
      "Lw": "X",
      "Fw": "-Z",
      "Bw": "Z",
      "x" : "-X",
      "y" : "-Y",
      "z" : "-Z",
    }

    for (let p in axes) {
      if (axes[p].charAt(0) === '-') {
        axes[p + "'"] = axes[p].charAt(1);
      } else {
        axes[p + "'"] = '-' + axes[p].charAt(0);
      }
    }

    return axes;
  })()

  static directions = (() => {
    const directions = {
      "U"  : new THREE.Vector3(0, -1, 0),
      "D"  : new THREE.Vector3(0, 1, 0),
      "R"  : new THREE.Vector3(1, 0, 0),
      "L"  : new THREE.Vector3(-1, 0, 0),
      "F"  : new THREE.Vector3(0, 0, 1),
      "B"  : new THREE.Vector3(0, 0, -1),
      "E"  : new THREE.Vector3(0, 1, 0),
      "M"  : new THREE.Vector3(-1, 0, 0),
      "S"  : new THREE.Vector3(0, 0, 1),
      "Uw" : new THREE.Vector3(0, -1, 0),
      "Dw" : new THREE.Vector3(0, 1, 0),
      "Rw" : new THREE.Vector3(1, 0, 0),
      "Lw" : new THREE.Vector3(-1, 0, 0),
      "Fw" : new THREE.Vector3(0, 0, 1),
      "Bw" : new THREE.Vector3(0, 0, -1),
      "x"  : new THREE.Vector3(1, 0, 0),
      "y"  : new THREE.Vector3(0, -1, 0),
      "z"  : new THREE.Vector3(0, 0, 1),
    };

    for (let p in directions) {
      directions[p + "'"] = directions[p].clone().multiplyScalar(-1)
    }

    return directions;
  })();

  static targetCubes = (() => {
    const targetCubes = {
      'U': [6, 7, 8, 15, 16, 17, 24, 25, 26],
      'D': [0, 1, 2, 9, 10, 11, 18, 19, 20],
      'R': [0, 1, 2, 3, 4, 5, 6, 7, 8],
      'L': [18, 19, 20, 21, 22, 23, 24, 25, 26],
      'F': [0, 3, 6, 9, 12, 15, 18, 21, 24],
      'B': [2, 5, 8, 11, 14, 17, 20, 23, 26],
      'E': [3, 4, 5, 12, 13, 14, 21, 22, 23],
      'M': [9, 10, 11, 12, 13, 14, 15, 16, 17],
      'S': [1, 4, 7, 10, 13, 16, 19, 22, 25],
    };

    targetCubes['Uw'] = targetCubes['U'].concat(targetCubes['E']);
    targetCubes['Dw'] = targetCubes['D'].concat(targetCubes['E']);
    targetCubes['Rw'] = targetCubes['R'].concat(targetCubes['M']);
    targetCubes['Lw'] = targetCubes['L'].concat(targetCubes['M']);
    targetCubes['Fw'] = targetCubes['F'].concat(targetCubes['S']);
    targetCubes['Bw'] = targetCubes['B'].concat(targetCubes['S']);
    targetCubes['x']  = targetCubes['L'].concat(targetCubes['M'], targetCubes['R']);
    targetCubes['y']  = targetCubes['U'].concat(targetCubes['E'], targetCubes['D']);
    targetCubes['z']  = targetCubes['F'].concat(targetCubes['S'], targetCubes['B']);

    for (let p in targetCubes) {
      targetCubes[p + "'"] = targetCubes[p].concat();
    }

    return targetCubes;
  })()

  static cubeMoves = (() => {
    const cubeMoves = {
      "U": [24, 15, 6, 25, 16, 7, 26, 17, 8],
      "D": [2, 11, 20, 1, 10, 19, 0, 9, 18],
      "R": [6, 3, 0, 7, 4, 1, 8, 5, 2],
      "L": [20, 23, 26, 19, 22, 25, 18, 21, 24],
      "F": [18, 9, 0, 21, 12, 3, 24, 15, 6],
      "B": [8, 17, 26, 5, 14, 23, 2, 11, 20],
      "E": [5, 14, 23, 4, 13, 22, 3, 12, 21],
      "M": [11, 14, 17, 10, 13, 16, 9, 12, 15],
      "S": [19, 10, 1, 22, 13, 4, 25, 16, 7],
    };

    for (let p in cubeMoves) {
      cubeMoves[p + "'"] = cubeMoves[p].concat().reverse();
    }

    cubeMoves["Uw"] = cubeMoves["U"].concat(cubeMoves["E'"]);
    cubeMoves["Dw"] = cubeMoves["E"].concat(cubeMoves["D"]);
    cubeMoves["Rw"] = cubeMoves["R"].concat(cubeMoves["M'"]);
    cubeMoves["Lw"] = cubeMoves["L"].concat(cubeMoves["M"]);
    cubeMoves["Fw"] = cubeMoves["F"].concat(cubeMoves["S"]);
    cubeMoves["Bw"] = cubeMoves["B"].concat(cubeMoves["S'"]);
    cubeMoves["Uw'"] = cubeMoves["U'"].concat(cubeMoves["E"]);
    cubeMoves["Dw'"] = cubeMoves["E'"].concat(cubeMoves["D'"]);
    cubeMoves["Rw'"] = cubeMoves["R'"].concat(cubeMoves["M"]);
    cubeMoves["Lw'"] = cubeMoves["L'"].concat(cubeMoves["M'"]);
    cubeMoves["Fw'"] = cubeMoves["F'"].concat(cubeMoves["S'"]);
    cubeMoves["Bw'"] = cubeMoves["B'"].concat(cubeMoves["S"]);
    cubeMoves["x"] = cubeMoves["L'"].concat(cubeMoves["M'"], cubeMoves["R"]);
    cubeMoves["y"] = cubeMoves["U"].concat(cubeMoves["E'"], cubeMoves["D'"]);
    cubeMoves["z"] = cubeMoves["F"].concat(cubeMoves["S"], cubeMoves["B'"]);
    cubeMoves["x'"] = cubeMoves["L"].concat(cubeMoves["M"], cubeMoves["R'"]);
    cubeMoves["y'"] = cubeMoves["U'"].concat(cubeMoves["E"], cubeMoves["D"]);
    cubeMoves["z'"] = cubeMoves["F'"].concat(cubeMoves["S'"], cubeMoves["B"]);

    return cubeMoves;
  })();
}
