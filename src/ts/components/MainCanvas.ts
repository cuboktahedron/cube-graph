import Vue, { ComponentOptions } from 'vue'
import * as d3 from 'd3';
import { GraphNodeElement } from './GraphNodeElement'
import { GraphLinkElement } from './GraphLinkElement'

import CubeUtils from '../models/CubeUtils'
import GraphNode from '../models/GraphNode'
import GraphLink from '../models/GraphLink'
import RotationContext from '../models/RotationContext'

export interface MainCanvas extends Vue {
  height: number,
  width: number,
  nodes: GraphNode[],
  links: GraphLink[],
  linkIds: {},
  rotationContext: RotationContext,
  zoom: any,

  centering(node: GraphNode): void,
  dragstarted(d: any): void,
  dragged(d: any): void,
  dragended(d: any): void,
  deleteNode(node: GraphNode):boolean,
  onKeyDown(event: KeyboardEvent): void,
  loadData(data: any);
  rotatePaths(paths: string): void,
  rotate(node: GraphNode, mark: string): boolean,
  forwardNode(selectedNode: GraphNode, selectedLink: GraphLink),
  backwardNode(selectedNode: GraphNode, selectedLink: GraphLink),
  selectLeftLink(selectedNode: GraphNode, selectedLink: GraphLink),
  selectRightLink(selectedNode: GraphNode, selectedLink: GraphLink),
  selectRoot(),
  mainLoop(): void,
  openNew(): void,
  save(outData: any): void
  update(): void,
  onZoom(): void,
}

export default {
  props: ['height', 'width'],
  data: function () {
    return {
      nodes: [],
      links: [],
      linkIds: {},
      rotationContext: new RotationContext(),
      zoom: null,
    }
  },

  template: `
    <svg id="cube-graph-canvas" class="canvas"
      @click="onClick"
      @mousemove="onMouseMove">
      <defs>
        <marker id="arrow" markerWidth="4" markerHeight="4" refX="15" refY="2"
            orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,4 L4,2 z" fill="#f00" fill-opacity="0.6"></path>
        </marker>
        <marker id="arrow2" markerWidth="4" markerHeight="4" refX="15" refY="2"
            orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,4 L4,2 z" fill="#00f" fill-opacity="0.6"></path>
        </marker>
      </defs>

      <g :transform="transform">
        <g class="links">
          <g-link v-for="link in links" key="link.id" :link="link" />
        </g>
        <g class="nodes">
          <g-node v-for="node in nodes" key="node.id" :cube="node" />
        </g>
      </g>
    </svg>`,

  created: function () {
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d: any) { return d.id; }).distance(80))
      .force("charge", d3.forceManyBody());

    simulation.force("link")['links'](this.links);
    this.$store.dispatch('setSimulation', simulation);

    this.$store.state.bus.$on('loadData', this.loadData);
    this.$store.state.bus.$on('rotatePaths', this.rotatePaths);
    this.$store.state.bus.$on('saveCanvas', this.save);
  },

  mounted: function () {
    document.body.addEventListener('keydown', this.onKeyDown);

    this.zoom = d3.zoom();
    d3.select("svg").call(this.zoom
      .scaleExtent([0.1, 5])
      .on("zoom", this.onZoom));

    setInterval(this.mainLoop, 1000 / 60);

    this.openNew();
  },

  computed: {
    viewBoxBounds: function () {
      return `0 0 ${this.width} ${this.height}`;
    },

    transform: function () {
      const transX = this.$store.state.transform.translate.x;
      const transY = this.$store.state.transform.translate.y;
      const scale = this.$store.state.transform.scale;
      return `translate(${transX}, ${transY})scale(${scale})`;
    }
  },

  methods: {
    onZoom: function () {
      const transform = {
        translate: {
          x: d3.event.transform.x,
          y: d3.event.transform.y,
        },

        scale: d3.event.transform.k,
      };

      this.$store.dispatch('setTransform', transform);
    },

    onKeyDown: function (event: KeyboardEvent) {
      if (event.target !== document.getElementsByTagName('body')[0]) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      let selectedNode: GraphNode = this.$store.state.selectedNode;
      if (this.$store.state.selectedNode == null) {
        if (event.which === 82) { // R
          this.selectRoot();
        }

        return;
      }

      let keycodes = {};
      keycodes['66'] = 'B';
      keycodes['68'] = 'D';
      keycodes['69'] = 'E';
      keycodes['70'] = 'F';
      keycodes['76'] = 'L';
      keycodes['77'] = 'M';
      keycodes['82'] = 'R';
      keycodes['83'] = 'S';
      keycodes['85'] = 'U';
      keycodes['88'] = 'x';
      keycodes['89'] = 'y';
      keycodes['90'] = 'z';

      if (event.which in keycodes) {
        let path = keycodes[event.which] + ((event.shiftKey) ? "'" : "");
        if (this.rotate(selectedNode, path)) {
          this.update();
        }
      }

      const selectedLink = this.$store.state.selectedLink;
      if (event.which === 37) { // left arrow
        this.selectLeftLink(selectedNode, selectedLink);
      }

      if (event.which === 38) { // up arrow
        this.forwardNode(selectedNode, selectedLink);
      }

      if (event.which === 39) { // right arrow
        this.selectRightLink(selectedNode, selectedLink);
      }

      if (event.which === 40) { // down arrow
        this.backwardNode(selectedNode, selectedLink);
      }

      if (event.which === 72) { // H
        this.centering(selectedNode);
      }

      if (event.which === 46) { // Del
        const nextLinks = selectedNode.links.filter(link => link.target === selectedNode)
        const nextNode = !!nextLinks[0] ? nextLinks[0].source : null;
        if (this.deleteNode(selectedNode)) {
          this.$store.dispatch('selectNode', nextNode);
          this.update();
        }
      }
    },

    forwardNode: function (selectedNode: GraphNode, selectedLink: GraphLink) {
      if (selectedLink.source === selectedNode && !this.rotationContext.currentLink) {
        let path = this.$store.state.selectedLink.path
        this.rotate(selectedNode, path);
      } else {
        let nextLink = selectedNode.links.concat()
          .sort(GraphLink.orderBySource(selectedNode))[0];
        this.$store.dispatch('selectLink', nextLink);
      }
    },

    backwardNode: function (selectedNode: GraphNode, selectedLink: GraphLink) {
      if (selectedLink.target === selectedNode && !this.rotationContext.currentLink) {
        let path = this.$store.state.selectedLink.path
        this.rotate(selectedNode, CubeUtils.normalize(path + "'"));
      } else {
        let nextLink = selectedNode.links.concat()
          .sort(GraphLink.orderByTarget(selectedNode))[0];
        this.$store.dispatch('selectLink', nextLink);
      }
    },

    selectLeftLink: function (selectedNode: GraphNode, selectedLink: GraphLink) {
      let nextLink = selectedNode.links.concat()
        .sort(GraphLink.orderByCCW(selectedNode, selectedLink))
        .filter((link) => {
          return link.source === selectedLink.source
            || link.target === selectedLink.target
        })[0]
      this.$store.dispatch('selectLink', nextLink);
    },

    selectRightLink: function (selectedNode: GraphNode, selectedLink: GraphLink) {
      let nextLink = selectedNode.links.concat()
        .sort(GraphLink.orderByCW(selectedNode, selectedLink))
        .filter((link) => {
          return link.source === selectedLink.source
            || link.target === selectedLink.target
        })[0]
      this.$store.dispatch('selectLink', nextLink);
    },

    update: function () {
      this.$store.state.simulation.nodes(this.nodes);
      this.$store.state.simulation.force("link").links(this.links);
      this.$store.state.simulation.alphaTarget(0.7).restart();
    },

    onClick: function (e: PointerEvent) {
      this.$store.dispatch('selectNode', null);
    },

    onMouseMove: function (e: MouseEvent) {
      this.$store.dispatch("setCoordinates", { x: e.offsetX, y: e.offsetY });
    },

    rotatePaths: function (paths: string[]) {
      if (this.$store.state.selectedNode == null) {
        return;
      }

      paths.forEach((path) => {
        const selectedNode: GraphNode = this.$store.state.selectedNode;
        if (this.rotate(selectedNode, path)) {
          this.update();
        }
      });
    },

    rotate: function (node: GraphNode, mark: string): boolean {
      if (!!this.rotationContext.currentLink) {
        this.rotationContext.addPath(mark);
        return;
      }

      let newGraphNode = node.copy();
      let nextLink: GraphLink;
      let source: GraphNode;
      let target: GraphNode
      let nextNode: GraphNode;
      newGraphNode.rotate(mark);
      let sameGraphNode = this.nodes.filter(function (node: GraphNode) {
        return node.isSameStatus(newGraphNode);
      });

      if (sameGraphNode.length === 0) {
        this.nodes.push(newGraphNode);
        source = node;
        target = newGraphNode;
        nextLink = new GraphLink(mark, source, target);
        this.links.push(nextLink);
        nextNode = newGraphNode;
      } else {
        nextNode = sameGraphNode[0];
        let linkId = GraphLink.createLinkId(node, sameGraphNode[0]);
        nextLink = this.linkIds[linkId];
        if (!!nextLink) {
          const positive = (nextLink.path === mark);
          this.rotationContext.setCurrentLink(nextLink, positive);
          return false;
        }

        if (node.distance < sameGraphNode[0].distance) {
          source = node;
          target = sameGraphNode[0]
          nextLink = new GraphLink(mark, source, target);
        } else {
          source = sameGraphNode[0]
          target = node;
          nextLink = new GraphLink(mark + "'", source, target);
        }

        this.links.push(nextLink);

        target.updateLinkDirections();
      }

      this.linkIds[nextLink.id] = nextLink;
      const positive = (nextLink.path === mark);
      this.rotationContext.setCurrentLink(nextLink, positive);

      return true;
    },

    centering: function (node: GraphNode) {
      const svg = d3.select("#cube-graph-canvas");
      const svgElem: any = svg.node();
      const transform = d3.zoomTransform(svgElem);
      const k = transform.k;
      svg.transition()
        .duration(200)
        .call(this.zoom.transform, () => {
          return d3.zoomIdentity
            .translate(-node.x * k, -node.y * k)
            .translate(svgElem.clientWidth / 2, svgElem.clientHeight / 2)
            .scale(k);
        })
    },

    selectRoot: function () {
      const rootNode = this.nodes.filter(node => node.distance === 0)[0];
      this.$store.dispatch('selectNode', rootNode);
    },

    deleteNode: function(node: GraphNode):boolean {
      if (node.isRoot || !!this.rotationContext.currentLink) {
        return false;
      }

      let removedLinks = node.links.concat();
      node.remove();
      const removedNodes = this.nodes.filter(node => node.distance === -1);
      removedLinks = removedLinks.concat(
        Array.prototype.concat.apply([], removedNodes.map(
          node => node.links.filter(link => link.source === node))));
      removedLinks = removedLinks.concat()

      removedLinks.forEach(link => {
        delete this.linkIds[link.id];
      });

      this.links = this.links.filter(link => removedLinks.indexOf(link) === -1);
      this.nodes = this.nodes.filter(node => removedNodes.indexOf(node) === -1);
      return true;
    },

    mainLoop: function () {
      this.$store.state.bus.$emit('actionInformation');

      const next = this.rotationContext.next();
      if (next == null) {
        return;
      }

      if (!!next.node) {
        this.$store.dispatch('selectNode', next.node);

        if (!!next.path) {
          if (this.rotate(next.node, next.path)) {
            this.update();
          }
        }
      }
    },

    openNew: function() {
      const rootNode = new GraphNode();
      rootNode.isRoot = true;
      this.nodes = [];
      this.links = [];
      this.linkIds = {};
      this.rotationContext = new RotationContext();
      this.nodes.push(rootNode);
      this.update();

      this.selectRoot();
      const selectedNode: GraphNode = this.$store.state.selectedNode;
      this.centering(selectedNode);
    },

    loadData(data: any): void {
      const newNodes: GraphNode[] = [];
      const newLinks: GraphLink[] = [];
      const newLinkIds = {};
      const oldRootNode = data.nodes.filter(node => node.isRoot)[0];
      const oldIdToNewNode = {};
      const newRootNode = new GraphNode(data.rootStatus);
      newRootNode.isRoot = true;
      oldIdToNewNode[oldRootNode.id] = newRootNode;
      newNodes.push(newRootNode);
      
      const oldIdToNode = (() => {
        const oldIdToNode = {};
        data.nodes.forEach(node => {
          oldIdToNode[node.id] = node;
        });
        return oldIdToNode;
      })();

      let oldNodeIdStack = [oldRootNode.id];

      while (oldNodeIdStack.length > 0) {
        const wrkOldNodeStack = oldNodeIdStack.concat();
        oldNodeIdStack = [];
        wrkOldNodeStack.forEach(oldNodeId => {
          const oldNode = oldIdToNode[oldNodeId];
          const nextOldLinks = data.links.filter(oldLink => oldLink.source === oldNodeId);

          nextOldLinks.forEach(oldLink => {
            const newSourceNode = oldIdToNewNode[oldLink.source];
            let newTargetNode = oldIdToNewNode[oldLink.target];
            if (!newTargetNode) {
              const oldTargetNode = oldIdToNode[oldLink.target];
              oldNodeIdStack.push(oldLink.target);
              newTargetNode = newSourceNode.copy();
              newTargetNode.rotate(oldLink.path);
              newTargetNode.x = oldTargetNode.x;
              newTargetNode.y = oldTargetNode.y;
              newTargetNode.fx = oldTargetNode.fx;
              newTargetNode.fy = oldTargetNode.fy;
              oldIdToNewNode[oldLink.target] = newTargetNode;
              newNodes.push(newTargetNode);
            }

            const newLink = new GraphLink(oldLink.path, newSourceNode, newTargetNode);
            newLinks.push(newLink);
            newLinkIds[newLink.id] = newLink;
          });
        })
      }

      this.nodes = newNodes;
      this.links = newLinks;
      this.linkIds = newLinkIds;
      this.rotationContext = new RotationContext();
      
      this.update();

      this.selectRoot();
      const selectedNode: GraphNode = this.$store.state.selectedNode;
      this.centering(selectedNode);
    },

    save(outData: any): void {
      outData.rootStatus = this.nodes.filter(node => node.isRoot)[0].status;
      outData.nodes = this.nodes.map(node => {
        return {
          id: node.id,
          isRoot: node.isRoot,
          x: node.x,
          y: node.y,
          fx: node.fx,
          fy: node.fy,
        };
      });
      outData.links = this.links.map(link => {
        return {
          source: link.source.id,
          target: link.target.id,
          path: link.path,
        };
      });
    }
  },

  watch: {
    nodes: function () {
      this.$store.dispatch("nodeNum", this.nodes.length);
    },

    links: function () {
      this.$store.dispatch("linkNum", this.links.length);
    },

    "rotationContext.currentLink": function() {
        this.$store.dispatch("selectActiveLink", this.rotationContext.currentLink);
    }
  },
} as ComponentOptions<MainCanvas>
