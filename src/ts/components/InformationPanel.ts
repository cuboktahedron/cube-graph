import Vue, { ComponentOptions } from 'vue'
import * as d3 from 'd3';

interface InformationPanel extends Vue {
}

export default {
  template: `
    <div>
      <p>Node: {{$store.state.nodeNum}} Link: {{$store.state.linkNum}}
      <p>{{coordinates}}</p>
      <p>zoom: {{zoom}}</p>
      <p v-if="$store.state.selectedNode" v-html="selectedNodeInfo"></p>
      <template v-if="$store.state.selectedNode">
        <p>toRoot</p>
        <div class="input-with-btn">
          <input id="txt-path-to-root" type="text" class="txt-paths" readonly="readonly" v-model="pathToRoot">
          <button @click="copyPathToRoot" title="copy"><icon name="text" width="16"></icon></button>
        </div>
      </template>
      <template v-if="$store.state.selectedNode">
        <p>fromRoot</p>
        <div class="input-with-btn">
          <input id="txt-path-from-root" type="text" class="txt-paths" readonly="readonly" v-model="pathFromRoot">
          <button @click="copyPathFromRoot" title="copy"><icon name="text" width="16"></icon></button>
        </div>
      </template>
    </div>`,

  methods: {
    copyPathToRoot: function() {
      const txt = document.getElementById('txt-path-to-root') as HTMLInputElement;
      txt.select();
      document.execCommand("copy");
      txt.blur();
    },

    copyPathFromRoot: function() {
      const txt = document.getElementById('txt-path-from-root') as HTMLInputElement;
      txt.select();
      document.execCommand("copy");
      txt.blur();
    }
  },

  computed: {
    coordinates: function () {
      const coord = this.$store.state.coordinates;
      return `x: ${coord.x} y: ${coord.y}`
    },

    zoom: function() {
      const transform = this.$store.state.transform;
      return Math.round(transform.scale * 100) + '%';
    },

    pathToRoot: function () {
      const pathsToRoot: string[] = this.$store.state.selectedNode.pathsToRoot();
      return pathsToRoot[0];
    },

    pathFromRoot: function () {
      const pathsFromRoot: string[] = this.$store.state.selectedNode.pathsFromRoot();
      return pathsFromRoot[0];
    },

    selectedNodeInfo: function () {
      const node = this.$store.state.selectedNode;
      const info: string[] = [];
      info.push(`id: ${node.id}`);
      info.push(`distance: ${node.distance}`);
      info.push(`x: ${Math.round(node.x)}`);
      info.push(`y: ${Math.round(node.y)}`);

      return info.join('<br>');
    }
  }
} as ComponentOptions<InformationPanel>