import Vue, { ComponentOptions } from 'vue'

interface MenuItem extends Vue {
  command: string,
  description: string, 
  title: string, 
}

export default {
  props: ['command', 'title', 'description' ],
  data: function () {
    return {
    };
  },

  template: `
    <div>
      <div class="menu-item"
        :title="description"
        @click="onClick"
      >{{title}}</div>
    </div>`,

  methods: {
    onClick() {
      this.$store.state.bus.$emit(this.command);
    },
  }
} as ComponentOptions<MenuItem>