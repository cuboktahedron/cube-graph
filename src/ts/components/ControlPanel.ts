import Vue, { ComponentOptions } from 'vue'
import CubeUtils from '../models/CubeUtils'
import GraphNode from '../models/GraphNode'

interface ControllPanel extends Vue {
  paths: string,
  resetData: any,

  load(): void,
  openNew(): void,
  save(): void,
  setRootNode(node: GraphNode): void,
  reset(): void,
  toggleKeepsSelectedCenter(): void,
}

export default {
  data: function () {
    const root = new GraphNode();
    root.root();

    return {
      paths: "",
      resetData: {
        links: [],
        nodes: [ root ],
      }        
    };
  },

  template: `
    <div>
      <input id="txt-paths"
        type="text"
        placeholder="input paths here. (e.g. L'UL'U'L'U'L'ULUL2)"
        @keydown.stop="onKeyDown"
        v-model="paths" />
      <input id="file-load" type="file" @change="onLoadFileChange" />
      <a id="file-save" target="_blank" />
    </div>`,

  created: function() {
    this.$store.state.bus.$on('cmdLoad', this.load);
    this.$store.state.bus.$on('cmdNew', this.openNew);
    this.$store.state.bus.$on('cmdSave', this.save);
    this.$store.state.bus.$on('cmdReset', this.reset);
    this.$store.state.bus.$on('cmdToggleKeepsSelectedCenter', this.toggleKeepsSelectedCenter)
    this.$store.state.bus.$on('setRootNode', this.setRootNode);

    window.addEventListener('beforeunload', function(e: BeforeUnloadEvent) {
      const dialogText = 'Are you sure you want to leave?';
      e.returnValue = dialogText;
      return dialogText;
    });
  },

  methods: {
    onKeyDown: function (event: KeyboardEvent) {
      if (event.which == 13) { // Enter
        const pathsArr: string[] = CubeUtils.pathsToArray(this.paths);
        this.$store.state.bus.$emit('rotatePaths', pathsArr);
        this.paths = "";
      }
    },

    onLoadFileChange: function(event) {
      const files: FileList = event.target.files;
      if (files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          this.$store.state.bus.$emit('loadCanvas', data);
          this.$store.state.bus.$emit('loadCube', data);
          this.resetData = data;
        } catch (ex) {
          alert('This is not valid file.');
        }
      };
      reader.readAsText(files[0]);
      event.target.value = '';
    },

    load: function() {
      document.getElementById('file-load').click();
    },

    openNew: function() {
      const root = new GraphNode();
      root.root();
  
      const newData = {
        links: [],
        nodes: [ root ],
      };

      this.resetData = newData;
      this.reset();
    },

    save: function() {
      const outData = {};
      this.$store.state.bus.$emit('saveCanvas', outData);
      this.$store.state.bus.$emit('saveCube', outData);
      const text = JSON.stringify(outData);

      const blob = new Blob([text]);
      const name = `CubeGraph_${new Date().getTime()}.dat`;
      
      var url = window.URL.createObjectURL(blob);
      const anchor = (document.getElementById('file-save') as HTMLAnchorElement);
      anchor.href = url;
      anchor.download=name;
      document.getElementById('file-save').click();
    },

    setRootNode: function(node: GraphNode): void {
      this.$store.dispatch('selectNode', node);
      Vue.nextTick(() => {
        this.$store.state.bus.$emit('rebaseCube');
        this.$store.state.bus.$emit('setRootNodeCanvas', node);
      });
    },

    reset: function() {
      this.$store.state.bus.$emit('loadCanvas', this.resetData);
      this.$store.state.bus.$emit('loadCube', this.resetData);
    },

    toggleKeepsSelectedCenter: function() {
      this.$store.state.config.keepsSelectedCenter = !this.$store.state.config.keepsSelectedCenter;
    }
  }
} as ComponentOptions<ControllPanel>