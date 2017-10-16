import GraphNode from './GraphNode'
import CubeUtils from './CubeUtils'

export default class GraphLink {
  private _id: string;
  private _path: string;
  isActive: boolean = false;
  progress: number = 0;

  constructor(path: string, public source: GraphNode, public target: GraphNode) {
    this.path = path;
    this._id = GraphLink.createLinkId(source, target);
    source.addLink(this);
    target.addLink(this);
    target.updateDistance();
  }

  get id(): string {
    return this._id;
  }

  get path(): string {
    return this._path;
  }

  set path(newValue: string) {
    this._path = CubeUtils.normalize(newValue);
  }

  private _focused: boolean = false;

  get focused() {
    return this._focused;
  }

  focus() {
    this._focused = true;
  }

  blur() {
    this._focused = false;
  }

  static createLinkId(source: GraphNode, target: GraphNode) {
    if (source.id < target.id) {
      return source.id + "-" + target.id;
    } else {
      return target.id + "-" + source.id;
    }
  }

  static orderBySource(node) {
    return (l1, l2) => {
      if (l1.source === node && l2.source !== node) {
        return -1;
      } else if (l1.source !== node && l2.source === node) {
        return 1;
      } else {
        return (l1.id < l2.id) ? -1 : 1;
      }
    };
  }

  static orderByTarget(node) {
    return (l1, l2) => {
      if (l1.target === node && l2.target !== node) {
        return -1;
      } else if (l1.target !== node && l2.target === node) {
        return 1;
      } else {
        return (l1.id < l2.id) ? -1 : 1;
      }
    };
  }

  static orderByCW(node: GraphNode, baseLink: GraphLink) {
    const vBase = (baseLink.source === node) ? baseLink.target : baseLink.source;
    const baseX = vBase.x - node.x;
    const baseY = vBase.y - node.y;
    const absVBase = Math.sqrt(baseX * baseX + baseY * baseY);

    var calculateTheta = (link: GraphLink) => {
      // Calculate theta between link and baselink from definition of dot product.
      const v: GraphNode = (link.source === node) ? link.target : link.source;
      const x = v.x - node.x;
      const y = v.y - node.y;
      const absV = Math.sqrt(x * x + y * y);
      const cosTheta = (baseX * x + baseY * y) / (absVBase * absV);
      const theta = Math.acos(cosTheta);

      // Cross product >= 0 means clockwise.
      if (baseX * y - baseY * x >= 0) {
        return theta;
      } else {
        return 2 * Math.PI - theta;
      }
    }

    return (l1, l2) => {
      if (l1 === baseLink) {
        return 1;
      } else if (l2 === baseLink) {
        return -1;
      }

      const theta1 = calculateTheta(l1);
      const theta2 = calculateTheta(l2);
      return theta1 - theta2;
    };
  }

  static orderByCCW(node: GraphNode, baseLink: GraphLink) {
    const orderByCW = GraphLink.orderByCW(node, baseLink);
    return (l1, l2) => {
      if (l1 === baseLink) {
        return 1;
      } else if (l2 === baseLink) {
        return -1;
      }

      return -1 * orderByCW(l1, l2);
    };
  }
}
