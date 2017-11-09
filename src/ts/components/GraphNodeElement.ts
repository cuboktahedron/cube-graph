import Vue, { ComponentOptions } from 'vue'
import * as d3 from 'd3';
import GraphNode from '../models/GraphNode'

export interface GraphNodeElement extends Vue {
  cube: GraphNode,
  dragging: boolean,

  dragstarted(d: any): void,
  dragged(d: any): void,
  dragended(d: any): void,
}

export default {
  props: ['cube'],
  data: function () {
    return {
      dragging: false
    };
  },

  template: `
    <circle
      :id="'node-' + cube.id"
      r="15"
      :cx="cube.x"
      :cy="cube.y"
      :fill="color"
      v-bind:class="{focused : cube.focused, root: cube.isRoot}"
      @click.stop="onClick" 
      @contextmenu="onRightClick"
    />`,

  mounted: function () {
    const that = this;
    d3.select(`#node-${this.cube.id}`)
      .call(d3.drag()
        .on("start", (d, i) => that.dragstarted(that.cube))
        .on("drag", (d, i) => that.dragged(that.cube))
        .on("end", (d, i) => that.dragended(that.cube)));
  },
  

  computed: {
    color: function () {
      return this.$store.getters.colors(this.cube.distance);
    },
  },

  methods: {
    onClick(e: MouseEvent) {
     this.$store.dispatch('selectNode', this.cube);
    },

    onRightClick(e: MouseEvent) {
      this.$emit("showContextMenu", this.cube, e.x, e.y);
      e.preventDefault();
    },

    dragstarted(d): void {
      if (!d3.event.active) {
        this.$store.state.simulation.alphaTarget(0.7).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    },

    dragged(d): void {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    },

    dragended(d): void {
      if (!d3.event.active) {
        this.$store.state.simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    },
  }
} as ComponentOptions<GraphNodeElement>