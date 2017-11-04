import Vue, { ComponentOptions } from 'vue'

interface MenuItem extends Vue {
  command: string,
  description: string, 
  title: string, 
}

export default {
  props: ['command', 'title', 'description', 'value' ],
  data: function () {
    return {
    };
  },

  template: `
    <div>
      <div class="menu-item"
        :title="description"
        @click.stop="onClick"
      >{{title}}
        <icon v-if="value === true" name="check" width="16" />
      </div>
    </div>`,

  methods: {
    onClick() {
      this.$store.state.bus.$emit(this.command);

      const activeElement = document.activeElement as HTMLElement
      if (activeElement) {
        activeElement.blur();
      }
    },
  }
} as ComponentOptions<MenuItem>