import Vue, { ComponentOptions } from 'vue'

interface SidePanel extends Vue {
}

export default {
  template: `
    <div>
      <information class="information-panel" />
      <cube-panel v-once class="cube-panel" />
    </div>`
} as ComponentOptions<SidePanel>