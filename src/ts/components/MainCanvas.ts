import Vue, { ComponentOptions } from 'vue'
import * as d3 from 'd3';
import { GraphNodeElement } from './GraphNodeElement'
import { GraphLinkElement } from './GraphLinkElement'

import CubeUtils from '../models/CubeUtils'
import GraphNode from '../models/GraphNode'
import GraphLink from '../models/GraphLink'
import RotationContext from '../models/RotationContext'

export interface MainCanvas extends Vue {
  isDropping: boolean,
  height: number,
  width: number,
  nodes: GraphNode[],
  links: GraphLink[],
  linkIds: {},
  rotationContext: RotationContext,
  nodeMenu: {
    targetNode: GraphNode,
    top: number,
    left: number,
  },
  zoom: any,

  centering(node: GraphNode): void,
  dragstarted(d: any): void,
  dragged(d: any): void,
  dragended(d: any): void,
  deleteNode(node: GraphNode):boolean,
  onKeyDown(event: KeyboardEvent): void,
  onDrop(event: DragEvent): void,
  onDragLeave(event: DragEvent): void,
  onDragOver(event: DragEvent): void,
  loadData(data: any);
  rotatePaths(paths: string): void,
  rotate(node: GraphNode, mark: string): boolean,
  forwardNode(selectedNode: GraphNode, selectedLink: GraphLink),
  backwardNode(selectedNode: GraphNode, selectedLink: GraphLink),
  selectLeftLink(selectedNode: GraphNode, selectedLink: GraphLink),
  selectRightLink(selectedNode: GraphNode, selectedLink: GraphLink),
  selectRoot(),
  showNodeContextMenu(node: GraphNode, x: number, y: number): void,
  closeNodeContextMenu(): void,
  mainLoop(): void,
  openNew(): void,
  save(outData: any): void
  setRootNode(node: GraphNode): void,
  update(): void,
  onZoom(): void,
}

export default {
  props: ['height', 'width'],
  data: function () {
    return {
      isDropping: false,
      nodes: [],
      links: [],
      linkIds: {},
      rotationContext: null,
      nodeMenu: {
        targetNode: null,
      },
      zoom: null,
    }
  },

  template: `
    <div id="main-canvas-panel"
      :class="{ dropover: isDropping }"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop">

      <svg id="cube-graph-canvas" class="canvas"
        @contextmenu="onContextMenu"
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
            <g-node v-for="node in nodes" key="node.id" :cube="node"
              @showContextMenu="showNodeContextMenu"
            />
          </g>
        </g>
      </svg>

      <node-menu class="node-menu" v-if="showsNodeMenu"
        :targetNode="nodeMenu.targetNode"
        :style="nodeMenuStyle"
        @closeMenu="closeNodeContextMenu" />
    </div>`,

  created: function () {
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d: any) { return d.id; }).distance(80))
      .force("charge", d3.forceManyBody());

    simulation.force("link")['links'](this.links);
    this.$store.dispatch('setSimulation', simulation);

    this.$store.state.bus.$on('loadCanvas', this.loadData);
    this.$store.state.bus.$on('rotatePaths', this.rotatePaths);
    this.$store.state.bus.$on('saveCanvas', this.save);
    this.$store.state.bus.$on('setRootNodeCanvas', this.setRootNode);
  },

  mounted: function () {
    document.body.addEventListener('keydown', this.onKeyDown);

    this.zoom = d3.zoom();
    d3.select("svg").call(this.zoom
      .scaleExtent([0.1, 5])
      .on("zoom", this.onZoom));

    setInterval(this.mainLoop, 1000 / 60);
    this.$store.state.bus.$emit('cmdNew');
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
    },

    showsNodeMenu: function() {
      return this.nodeMenu.targetNode !== null;
    },

    nodeMenuStyle: function() {
      return {
        top: this.nodeMenu.top + 'px',
        left: this.nodeMenu.left + 'px',
      };
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

    onContextMenu: function(e: Event) {
      e.preventDefault();
    },

    onKeyDown: function (event: KeyboardEvent) {
      if (event.target !== document.getElementsByTagName('body')[0]) {
        return;
      }

      let selectedNode: GraphNode = this.$store.state.selectedNode;
      if (this.$store.state.selectedNode == null) {
        if (event.which === 82) { // R
          this.selectRoot();
        }

        return;
      }

      const rotCode = event.which + ((event.ctrlKey) ? "W" : "") + ((event.shiftKey) ? "R" : "");
      if (rotCode in RotCodes) {
        let path = RotCodes[rotCode];
        if (this.rotate(selectedNode, path)) {
          this.update();
        }
        return;
      }

      const selectedLink = this.$store.state.selectedLink;
      if (event.which === 37) { // left arrow
        this.selectLeftLink(selectedNode, selectedLink);
        return;
      }

      if (event.which === 38) { // up arrow
        this.forwardNode(selectedNode, selectedLink);
        return;
      }

      if (event.which === 39) { // right arrow
        this.selectRightLink(selectedNode, selectedLink);
        return;
      }

      if (event.which === 40) { // down arrow
        this.backwardNode(selectedNode, selectedLink);
        return;
      }

      if (event.which === 72) { // H
        this.centering(selectedNode);
        return;
      }

      if (event.which === 46) { // Del
        const nextLinks = selectedNode.links.filter(link => link.target === selectedNode)
        const nextNode = !!nextLinks[0] ? nextLinks[0].source : null;
        if (this.deleteNode(selectedNode)) {
          this.$store.dispatch('selectNode', nextNode);
          this.update();
        }
        return;
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

    onDrop: function (event: DragEvent): void {
      this.isDropping = false;
      this.$store.state.bus.$emit('loadFile', event.dataTransfer.files[0]);
    },

    onDragLeave: function (event: DragEvent): void {
      this.isDropping = false;
    },

    onDragOver: function (event: DragEvent): void {
      this.isDropping = true;
      event.dataTransfer.dropEffect = 'copy';
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
      rootNode.root();
      this.nodes = [];
      this.links = [];
      this.linkIds = {};
      this.rotationContext = new RotationContext(this.$store.state.config.velocity);
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
      const newRootNode = new GraphNode();
      newRootNode.root();
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
      this.rotationContext = new RotationContext(this.$store.state.config.velocity);
      
      this.update();

      this.selectRoot();
      const selectedNode: GraphNode = this.$store.state.selectedNode;
      this.centering(selectedNode);
    },

    save(outData: any): void {
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
    },

    setRootNode(node: GraphNode): void {
      node.root();
    },

    showNodeContextMenu(node: GraphNode, x: number, y: number): void {
      this.nodeMenu = {
        targetNode: node,
        top: y,
        left: x,
      };

      Vue.nextTick(function() {
        const menu = document.getElementsByClassName("node-menu")[0] as HTMLElement;
        menu.focus();
      });
    },

    closeNodeContextMenu(): void {
      this.nodeMenu = {
        targetNode: null,
        top: 0,
        left: 0,
      };
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
    },

    "$store.state.selectedNode": function(newValue) {
      if (newValue && this.$store.state.config.keepsSelectedCenter) {
        this.centering(newValue);
      }
    },

    "$store.state.config.velocity": function(newValue) {
      this.rotationContext.velocity = newValue;
    }
  },
} as ComponentOptions<MainCanvas>

const RotCodes = (function() {
  const rotCodesGroup1 = {};
  rotCodesGroup1['66'] = 'B';
  rotCodesGroup1['68'] = 'D';
  rotCodesGroup1['70'] = 'F';
  rotCodesGroup1['76'] = 'L';
  rotCodesGroup1['82'] = 'R';
  rotCodesGroup1['85'] = 'U';

  for (const rotCode in rotCodesGroup1) {
    rotCodesGroup1[rotCode + 'W'] = rotCodesGroup1[rotCode] + 'w';
  }
  for (const rotCode in rotCodesGroup1) {
    rotCodesGroup1[rotCode + 'R'] = rotCodesGroup1[rotCode] + "'";
  }

  let rotCodesGroup2 = {};
  rotCodesGroup2['69'] = 'E';
  rotCodesGroup2['77'] = 'M';
  rotCodesGroup2['83'] = 'S';
  rotCodesGroup2['88'] = 'x';
  rotCodesGroup2['89'] = 'y';
  rotCodesGroup2['90'] = 'z';

  for (const rotCode in rotCodesGroup2) {
    rotCodesGroup2[rotCode + 'R'] = rotCodesGroup2[rotCode] + "'";
  }

  for (var attr in rotCodesGroup2) {
    rotCodesGroup1[attr] = rotCodesGroup2[attr];
  }

  return rotCodesGroup1;
})();
