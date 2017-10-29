import Vue, { ComponentOptions } from 'vue'

interface ContextMenu extends Vue {
  active: boolean,
  items: Array<any>, // TODO: define type that is common type of MenuGroup and MenuItem.
}

export default {
  props: [ 'active', 'items' ],
  data: function () {
    return {
    };
  },

  template: `
    <div class="context-menu" v-show="active">
      <menu-item class="menu-item" v-for="(item, index) in items" key="index"
        :command="item.command"
        :description="item.description"
        :title="item.title" />
    </div>`,

  methods: {
  }
} as ComponentOptions<ContextMenu>