import Vue, { ComponentOptions } from 'vue'

interface MenuGroup extends Vue {
  active: boolean;
  index: number;
  title: string; 
  items: Array<any>;
}

export default {
  props: [ 'active', 'index', 'title', 'items', ],
  data: function () {
    return {
    };
  },

  template: `
    <div @click="onClick"
      @mouseover="onMouseOver"
    >
      {{title}}
      <context-menu :items="items"
        :active="active"
      />
    </div>`,
    
  methods: {
    onClick() {
      this.$emit('selectGroup', this.index);
    },

    onMouseOver() {
      this.$emit('mouseOver', this.index);
    },
  }
} as ComponentOptions<MenuGroup>