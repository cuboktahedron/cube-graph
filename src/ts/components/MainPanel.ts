import Vue, { ComponentOptions } from 'vue'

interface MainPanel extends Vue {
  height: number,
  width: number,
}

export default {
  template: `
    <div>
      <main-canvas :width="800" :height="800" />
      <control-panel id="control-panel" />
    </div>`,

} as ComponentOptions<MainPanel>