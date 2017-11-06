import GraphLink from './GraphLink'
import CubeUtils from './CubeUtils'

export default class GraphNode {
  private static cid: number = 0;
  static baseStatus: number[] = [];

  static initialize() {
    for (var i = 0; i < 54; i++) {
      GraphNode.baseStatus.push(i);
    }

    GraphNode.initializeRotationPattern();
  }

  private rootNode: GraphNode = null;
  private _id: number;
  private _name: string;

  get id() {
    return this._id;
  }

  set id(id: number) {
    this._id = id;
  }

  get name():string {
    if (this._name == null) {
      return this._id + "";
    } else {
      return this._name;
    }
  }

  set name(newValue: string) {
    this._name = newValue;
  }

  get isRoot(): boolean {
    return this.rootNode === this;
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

  links: GraphLink[];
  status: number[];
  x: number = 0;
  y: number = 0;
  fx: number = null;
  fy: number = null;
  _distance: number = 0;

  constructor(base?: number[], path?: string) {
    base = base || GraphNode.baseStatus;
    path = path || "";

    this.status = base.concat();
    for (let i = 0; i < path.length; i++) {
      this.rotate(path[i]);
    }

    this.id = ++GraphNode.cid;
    this.links = [];
  }

  copy(): GraphNode {
    let newGraphNode = new GraphNode();
    newGraphNode.status = this.status.concat();
    newGraphNode.x = this.x;
    newGraphNode.y = this.y;
    newGraphNode.fx = null;
    newGraphNode.fy = null;
    newGraphNode.rootNode = this.rootNode;

    return newGraphNode;
  }

  remove() {
    let removeNodes: GraphNode[] = [this];
    let removeLinks: GraphLink[] = this.links.concat();

    const nextNodes = removeLinks.filter(link => link.source === this)
      .map(link => link.target);

    removeLinks.forEach(link => {
      link.source.removeLink(link);
      link.target.removeLink(link);
    });
    nextNodes.forEach(node => node.updateLinkDirections());
    this.updateDistance();
  }

  rotate(mark): void {
    var movePatterns = GraphNode.RotationTable[mark];
    var movePattern;
    var pStatus = this.status.concat();
    var i, movePatternsLength = movePatterns.length;
    for (i = 0; i < movePatternsLength; i++) {
      movePattern = movePatterns[i];
      this.status[movePattern.to] = pStatus[movePattern.from];
    }

  }

  isSameStatus(cube): boolean {
    var i, length = this.status.length;
    for (i = 0; i < length; i++) {
      if (this.status[i] !== cube.status[i]) {
        return false;
      }
    }

    return true;
  }

  updateDistance(): void {
    if (this.isRoot) {
      this._distance = 0;
      return;
    }

    var distances = this.links.filter(link => link.target === this)
      .map(link => link.source.distance).filter(distance => distance >= 0);
    if (distances.length === 0) {
      this._distance = -1;
    } else {
      this._distance = Math.min.apply(null, distances) + 1;
    }
  }

  get distance(): number {
    return this._distance;
  }

  addLink(link: GraphLink): void {
    this.links.push(link);
  }

  removeLink(link: GraphLink): void {
    this.links.splice(this.links.indexOf(link), 1);
  }

  updateLinkDirections(): void {
    this.updateDistance();

    if (this.distance === -1) {
      let sourcedLinks = this.links.filter((link) => {
        return link.source === this && link.target.distance >= 0;
      });
      sourcedLinks.forEach(link => {
        let target = link.target;
        link.target = this;
        link.source = target;
        link.path += "'";
        target.updateLinkDirections();
      });
      this.updateDistance();
    } else {
      const targetedLinks = this.links.filter(link => link.target === this);
      targetedLinks.forEach(link => {
        const sourceOfTarget = link.source;
        if (sourceOfTarget.distance === -1 || this.distance < sourceOfTarget.distance) {
          link.source = this;
          link.target = sourceOfTarget;
          link.path += "'";
          link.target.updateLinkDirections();
        }
      });

      const sourceLinks = this.links.filter(link => link.source === this);
      sourceLinks.forEach(link => {
        const target = link.target;
        if (target.distance === -1) {
          target.updateLinkDirections();
        }
      });
    }
  }

  pathsFromRoot(): string[] {
    const paths = [];

    this.links.filter((link) => link.source !== this)
      .forEach((link) => {
        const sourcePaths = link.source.pathsFromRoot().map((path) => path + link.path);
        Array.prototype.push.apply(paths, sourcePaths);
      });

    if (paths[0] === undefined) {
      // for root node
      paths.push("");
    }

    return paths;
  }

  pathsToRoot(): string[] {
    const paths = this.pathsFromRoot();
    return paths.map(CubeUtils.reversePath);
  }

  root(): void {
    if (this.rootNode === this) {
      return;
    }

    this.rootNode = this;
    this.updateDistance();

    let nodeStack: GraphNode[] = [this];
    while (nodeStack.length > 0) {
      const workNodeStack = nodeStack.concat();
      nodeStack.length = 0;
      workNodeStack.concat().forEach(node => {
        const nodesYetReferredOldRoot = node.links.map(link => {
          if (link.source === node) {
            return link.target;
          } else {
            return link.source;
          }
        }).filter(node => node.rootNode !== this);
        nodesYetReferredOldRoot.forEach(node => {
          node.rootNode = this
          node._distance = -1;
        });
        nodeStack = nodeStack.concat(nodesYetReferredOldRoot);
      });
    }

    this.links.filter(link => link.source === this).forEach(link => {
      link.target.updateLinkDirections();
    });

    this.links.filter(link => link.target === this).forEach(link => {
      const source = link.source;
      link.source = this;
      link.target = source;
      link.path += "'";
      link.target.updateLinkDirections();
    });

    // TODO: reconstruct paths
  }

  private static RotationTable: object;
  private static initializeRotationPattern(): void {
    GraphNode.RotationTable =
      {
        "U": [
          { "from": 6, "to": 15 },
          { "from": 7, "to": 16 },
          { "from": 8, "to": 17 },
          { "from": 15, "to": 24 },
          { "from": 16, "to": 25 },
          { "from": 17, "to": 26 },
          { "from": 24, "to": 33 },
          { "from": 25, "to": 34 },
          { "from": 26, "to": 35 },
          { "from": 33, "to": 6 },
          { "from": 34, "to": 7 },
          { "from": 35, "to": 8 },
          { "from": 36, "to": 42 },
          { "from": 39, "to": 43 },
          { "from": 42, "to": 44 },
          { "from": 37, "to": 39 },
          //   { "from": 40, "to": 40 },
          { "from": 43, "to": 41 },
          { "from": 38, "to": 36 },
          { "from": 41, "to": 37 },
          { "from": 44, "to": 38 }
        ],

        "D": [
          { "from": 0, "to": 27 },
          { "from": 1, "to": 28 },
          { "from": 2, "to": 29 },
          { "from": 9, "to": 0 },
          { "from": 10, "to": 1 },
          { "from": 11, "to": 2 },
          { "from": 18, "to": 9 },
          { "from": 19, "to": 10 },
          { "from": 20, "to": 11 },
          { "from": 27, "to": 18 },
          { "from": 28, "to": 19 },
          { "from": 29, "to": 20 },

          { "from": 45, "to": 51 },
          { "from": 48, "to": 52 },
          { "from": 51, "to": 53 },
          { "from": 46, "to": 48 },
          //   { "from": 49, "to": 49 },
          { "from": 52, "to": 50 },
          { "from": 47, "to": 45 },
          { "from": 50, "to": 46 },
          { "from": 53, "to": 47 }
        ],

        "R": [
          { "from": 2, "to": 38 },
          { "from": 5, "to": 41 },
          { "from": 8, "to": 44 },
          { "from": 38, "to": 24 },
          { "from": 41, "to": 21 },
          { "from": 44, "to": 18 },
          { "from": 24, "to": 47 },
          { "from": 21, "to": 50 },
          { "from": 18, "to": 53 },
          { "from": 47, "to": 2 },
          { "from": 50, "to": 5 },
          { "from": 53, "to": 8 },
          { "from": 27, "to": 33 },
          { "from": 30, "to": 34 },
          { "from": 33, "to": 35 },
          { "from": 28, "to": 30 },
          //  { "from": 31, "to": 31 },
          { "from": 34, "to": 32 },
          { "from": 29, "to": 27 },
          { "from": 32, "to": 28 },
          { "from": 35, "to": 29 }
        ],

        "L": [
          { "from": 0, "to": 45 },
          { "from": 3, "to": 48 },
          { "from": 6, "to": 51 },
          { "from": 36, "to": 0 },
          { "from": 39, "to": 3 },
          { "from": 42, "to": 6 },
          { "from": 26, "to": 36 },
          { "from": 23, "to": 39 },
          { "from": 20, "to": 42 },
          { "from": 45, "to": 26 },
          { "from": 48, "to": 23 },
          { "from": 51, "to": 20 },
          { "from": 11, "to": 9 },
          { "from": 14, "to": 10 },
          { "from": 17, "to": 11 },
          { "from": 10, "to": 12 },
          //  { "from": 13, "to": 13 },
          { "from": 16, "to": 14 },
          { "from": 9, "to": 15 },
          { "from": 12, "to": 16 },
          { "from": 15, "to": 17 }
        ],

        "F": [
          { "from": 36, "to": 33 },
          { "from": 37, "to": 30 },
          { "from": 38, "to": 27 },
          { "from": 33, "to": 53 },
          { "from": 30, "to": 52 },
          { "from": 27, "to": 51 },
          { "from": 53, "to": 11 },
          { "from": 52, "to": 14 },
          { "from": 51, "to": 17 },
          { "from": 11, "to": 36 },
          { "from": 14, "to": 37 },
          { "from": 17, "to": 38 },
          { "from": 0, "to": 6 },
          { "from": 3, "to": 7 },
          { "from": 6, "to": 8 },
          { "from": 1, "to": 3 },
          //  { "from": 4,  "to": 4 },
          { "from": 7, "to": 5 },
          { "from": 2, "to": 0 },
          { "from": 5, "to": 1 },
          { "from": 8, "to": 2 }
        ],

        "B": [
          { "from": 44, "to": 15 },
          { "from": 43, "to": 12 },
          { "from": 42, "to": 9 },
          { "from": 15, "to": 45 },
          { "from": 12, "to": 46 },
          { "from": 9, "to": 47 },
          { "from": 45, "to": 29 },
          { "from": 46, "to": 32 },
          { "from": 47, "to": 35 },
          { "from": 29, "to": 44 },
          { "from": 32, "to": 43 },
          { "from": 35, "to": 42 },
          { "from": 18, "to": 24 },
          { "from": 21, "to": 25 },
          { "from": 24, "to": 26 },
          { "from": 19, "to": 21 },
          //  { "from": 22, "to": 22 },
          { "from": 25, "to": 23 },
          { "from": 20, "to": 18 },
          { "from": 23, "to": 19 },
          { "from": 26, "to": 20 }
        ],

        "E": [
          { "from": 3, "to": 30 },
          { "from": 4, "to": 31 },
          { "from": 5, "to": 32 },
          { "from": 12, "to": 3 },
          { "from": 13, "to": 4 },
          { "from": 14, "to": 5 },
          { "from": 21, "to": 12 },
          { "from": 22, "to": 13 },
          { "from": 23, "to": 14 },
          { "from": 30, "to": 21 },
          { "from": 31, "to": 22 },
          { "from": 32, "to": 23 },
        ],

        "M": [
          { "from": 1, "to": 46 },
          { "from": 4, "to": 49 },
          { "from": 7, "to": 52 },
          { "from": 37, "to": 1 },
          { "from": 40, "to": 4 },
          { "from": 43, "to": 7 },
          { "from": 25, "to": 37 },
          { "from": 22, "to": 40 },
          { "from": 19, "to": 43 },
          { "from": 46, "to": 25 },
          { "from": 49, "to": 22 },
          { "from": 52, "to": 19 },
        ],

        "S": [
          { "from": 39, "to": 34 },
          { "from": 40, "to": 31 },
          { "from": 41, "to": 28 },
          { "from": 34, "to": 50 },
          { "from": 31, "to": 49 },
          { "from": 28, "to": 48 },
          { "from": 50, "to": 10 },
          { "from": 49, "to": 13 },
          { "from": 48, "to": 16 },
          { "from": 10, "to": 39 },
          { "from": 13, "to": 40 },
          { "from": 16, "to": 41 },
        ],
      }

      const tbl = GraphNode.RotationTable;
      for (let p in GraphNode.RotationTable) {
        tbl[p + "'"] = GraphNode.RotationTable[p].map((d) => {
        return {
          "from": d.to,
          "to": d.from,
        }
      });
    }

    tbl["Uw"] = tbl["U"].concat(tbl["E'"]);
    tbl["Dw"] = tbl["D"].concat(tbl["E"]);
    tbl["Rw"] = tbl["R"].concat(tbl["M'"]);
    tbl["Lw"] = tbl["L"].concat(tbl["M"]);
    tbl["Fw"] = tbl["F"].concat(tbl["S"]);
    tbl["Bw"] = tbl["B"].concat(tbl["S'"]);
    tbl["Uw'"] = tbl["U'"].concat(tbl["E"]);
    tbl["Dw'"] = tbl["D'"].concat(tbl["E'"]);
    tbl["Rw'"] = tbl["R'"].concat(tbl["M"]);
    tbl["Lw'"] = tbl["L'"].concat(tbl["M'"]);
    tbl["Fw'"] = tbl["F'"].concat(tbl["S'"]);
    tbl["Bw'"] = tbl["B'"].concat(tbl["S"]);
    tbl["x"] = tbl["L'"].concat(tbl["M'"], tbl["R"]);
    tbl["y"] = tbl["U"].concat(tbl["E'"], tbl["D'"]);
    tbl["z"] = tbl["F"].concat(tbl["S"], tbl["B'"]);
    tbl["x'"] = tbl["L"].concat(tbl["M"], tbl["R'"]);
    tbl["y'"] = tbl["U'"].concat(tbl["E"], tbl["D"]);
    tbl["z'"] = tbl["F'"].concat(tbl["S'"], tbl["B"]);
  }
}

GraphNode.initialize();
