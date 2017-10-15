import Vue, { ComponentOptions } from 'vue'
import CubeUtils from '../models/CubeUtils'

interface ControllPanel extends Vue {
  paths: string,
}

export default {
  data: function () {
    return {
      paths: ""
    };
  },

  template: `
    <div>
      <input id="txt-paths" 
        type="text"
        placeholder="input paths here. (e.g. L'UL'U'L'U'L'ULUL2)"
        @keydown.stop="onKeyDown"
        v-model="paths" />
    </div>`,

  methods: {
    onKeyDown: function (event: KeyboardEvent) {
      if (event.which == 13) { // Enter
        const pathsArr: string[] = CubeUtils.pathsToArray(this.paths);
        this.$store.state.bus.$emit('rotatePaths', pathsArr);
        this.paths = "";
      }
    }
  }
} as ComponentOptions<ControllPanel>