import * as THREE from 'three'
import CubeColor from './CubeColor'

export default class Cube {
  _pos: THREE.Vector3;
  _position: THREE.Vector3;
  _dir: THREE.Quaternion = new THREE.Quaternion();
  quaternion: THREE.Quaternion = new THREE.Quaternion();
  colors: CubeColor[];
  static Size = 10;
  static Gap = 1;
  static Unit = Cube.Size + Cube.Gap;

  constructor(public no: number) {
  }

  get dir(): THREE.Quaternion {
    return this._dir;
  }

  set dir(newValue: THREE.Quaternion) {
    this._dir = newValue;
    this.quaternion = this._dir.clone();
  }

  get pos(): THREE.Vector3 {
    return this._pos;
  }

  set pos(newValue: THREE.Vector3) {
    this._pos = newValue;
    this._position = this.pos.clone().multiplyScalar(Cube.Unit);
  }

  get position(): THREE.Vector3 {
    return this._position;
  }

  calculateRadius(pos1: number, pos2: number) {
    return Math.sqrt(pos1 * pos1 + pos2 * pos2);
  }

  rotate(axisWithSign: string, dir: THREE.Vector3, radian: number) {
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(dir.normalize(), radian).multiply(this.dir);
    this.quaternion = q;
    const v = this.pos.clone();
    const sign = axisWithSign.charAt(0) === '-' ? -1 : 1;
    const axis = axisWithSign.charAt(axisWithSign.length - 1);
    const addRagian = sign * radian;
    if (axis === 'X') {
      const radius = this.calculateRadius(this._pos.y, this._pos.z);
      const baseRad = Math.atan2(this._pos.y, this._pos.z);
      v.x *= Cube.Unit;
      v.y = (Math.sin(baseRad + addRagian) * radius * Cube.Unit);
      v.z = (Math.cos(baseRad + addRagian) * radius * Cube.Unit);
    } else if (axis === 'Y') {
      const radius = this.calculateRadius(this._pos.x, this._pos.z);
      const baseRad = Math.atan2(this._pos.x, this._pos.z);
      v.x = (Math.sin(baseRad + addRagian) * radius * Cube.Unit);
      v.y *= Cube.Unit;
      v.z = (Math.cos(baseRad + addRagian) * radius * Cube.Unit);
    } else if (axis === 'Z') {
      const radius = this.calculateRadius(this._pos.x, this._pos.y);
      const baseRad = Math.atan2(this._pos.x, this._pos.y);
      v.x = (Math.sin(baseRad + addRagian) * radius * Cube.Unit);
      v.y = (Math.cos(baseRad + addRagian) * radius * Cube.Unit);
      v.z *= Cube.Unit;
    } else {
      throw new Error(`Invalid axis(${axis})`);
    }
    this._position = v;
  }
}
