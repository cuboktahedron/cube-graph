import GraphNode from '../models/GraphNode'
import GraphLink from '../models/GraphLink'

export default class RotationContext {
  _pendingPaths = [];
  _progress = 0
  _positive = true;
  _currentLink: GraphLink = null;

  constructor (public velocity: number) {}

  addPath(path: string): void {
    this._pendingPaths.push(path);
  }

  setCurrentLink(link:GraphLink, positive: boolean) {
    this._currentLink = link;
    this._progress = 0;
    this._currentLink.isActive = true;
    this._positive = positive;
  }

  get currentLink(): GraphLink {
    return this._currentLink;
  }

  get progressPerFrame(): number {
    if (this.velocity === 0) {
      return 0;
    }

    if (this.velocity === 20) {
      return 100;
    }

    const sec = 0.1 * (20 - this.velocity);
    const frame = 60 * sec;
    return 100 / frame;
  }

  next(): {
    node: GraphNode,
    path: string
  } {
    if (!this.currentLink) {
      return;
    }

    this._progress = Math.min(this._progress + this.progressPerFrame, 100);
    this._currentLink.progress = this.progress;
    if (this._progress === 100) {
      this._currentLink.isActive = false;

      let nextNode;
      if (this._positive) {
        nextNode = this._currentLink.target;
      } else {
        nextNode = this._currentLink.source;
      }
      this._currentLink = null;
      
      let nextPath;
      if (this._pendingPaths.length === 0) {
        nextPath = null;
      } else {
        nextPath = this._pendingPaths.shift();
      }
      return {
        "node": nextNode,
        "path": nextPath,
      };
    } else {
      return null;
    }
  }

  get progress(): number {
    if (this._positive) {
      return this._progress;
    } else {
      return -this._progress;
    }
  }
}
