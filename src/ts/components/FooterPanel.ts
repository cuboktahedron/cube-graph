import Vue, { ComponentOptions } from 'vue'

interface FooterPanel extends Vue {
}

export default {
  data: function () {
    return {};
  },

  template: `
    <div>Cube Graph v0.1</div>`,

} as ComponentOptions<FooterPanel>