import Vue, { ComponentOptions } from 'vue'
import GraphNode from '../models/GraphNode'

interface NodeMenu extends Vue {
  targetNode: GraphNode,
  selectedIndex: number;
  items: Array<any>,
  blur(): void
}

export default {
  props: [ 'targetNode' ],
  data: function () {
    return {
      items: [{
        command: "cmdSetRootNode",
        title: "set root",
        description: "Set root node to this node.",
        value: null,
      }]
    };
  },

  created: function() {
    this.$store.state.bus.$on('cmdSetRootNode', () => {
      this.$store.state.bus.$emit('setRootNode', this.targetNode);
    });
  },

  template: `
    <div tabindex="-1" @blur="onBlur">
      <context-menu :items="items" :active="true" />
    </div>`,

  methods: {
    onBlur(): void {
      this.$emit('closeMenu');
    },
  },
} as ComponentOptions<NodeMenu>