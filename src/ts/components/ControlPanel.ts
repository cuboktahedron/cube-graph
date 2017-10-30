import Vue, { ComponentOptions } from 'vue'
import CubeUtils from '../models/CubeUtils'

interface ControllPanel extends Vue {
  paths: string,

  load(): void,
  save(): void,
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
      <input id="file-load" type="file" @change="onLoadFileChange" />
      <a id="file-save" target="_blank" />
    </div>`,

  created: function() {
    this.$store.state.bus.$on('cmdLoad', this.load);
    this.$store.state.bus.$on('cmdSave', this.save);
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
          this.$store.state.bus.$emit('loadData', data);
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

    save: function() {
      const outData = {};
      this.$store.state.bus.$emit('saveCanvas', outData);
      const text = JSON.stringify(outData);

      const blob = new Blob([text]);
      const name = `CubeGraph_${new Date().getTime()}.dat`;
      
      var url = window.URL.createObjectURL(blob);
      const anchor = (document.getElementById('file-save') as HTMLAnchorElement);
      anchor.href = url;
      anchor.download=name;
      document.getElementById('file-save').click();
    },
  }
} as ComponentOptions<ControllPanel>