import Vue, { ComponentOptions } from 'vue'

interface MenuPanel extends Vue {
  selectedIndex: number;
  groups: Array<any>;

  blur(): void
  selectGroup(index: number): void;
}

export default {
  data: function () {
    return {
      selectedIndex: -1,
      groups: [
        {
          active: false,
          title: "File",
          items: [{
            command: "cmdNew",
            title: "new",
            description: "Open new field.",
            value: null,
          }, {
            command: "cmdLoad",
            title: "load",
            description: "Load file.",
            value: null,
          }, {
            command: "cmdSave",
            title: "save",
            description: "Save file.",
            value: null,
          }]
        },
        {
          active: false,
          title: "Edit",
          items: [{
            command: "cmdReset",
            title: "reset",
            description: "Reset field to initial state.",
            value: null,
          }]
        },
        {
          active: false,
          title: "Config",
          items: [{
            command: "cmdToggleKeepsSelectedCenter",
            title: "keep center",
            description: "selected node is always center or not.",
            value: null,
          }]
        },
      ]
    };
  },

  mounted: function() {
    this.groups[2].items[0].value=this.$store.state.config.keepsSelectedCenter;
  },

  template: `
    <div tabindex="-1"
      @click="onClick"
      @blur="onBlur"
    >
      <menu-group class="menu-group horizontal" v-for="(group, index) in groups" key="index"
        :active="group.active"
        :index="index"
        :title="group.title"
        :items="group.items"
        @selectGroup="onSelectGroup"
        @mouseOver="onMouseOver"
      />
    </div>`,

  methods: {
    onSelectGroup(index: number): void {
      this.selectGroup(index);
    },

    onMouseOver(index: number): void {
      if (this.selectedIndex !== -1) {
        this.selectGroup(index);
      }
    },

    onBlur(): void {
      this.blur();
    },

    onClick(e): void {
      if (e.target.id === 'menu-panel') {
        this.blur();        
      }
    },

    blur(): void {
      this.selectGroup(-1);
    },
    
    selectGroup(index: number): void {
      if (this.selectedIndex !== -1) {
        this.groups[this.selectedIndex].active = false;
      }
      if (index !== -1) {
        this.groups[index].active = true;
      }

      this.selectedIndex = index;
    }
  },

  watch: {
    '$store.state.config': {
      handler: function (val, oldVal) {
        this.groups[2].items[0].value=this.$store.state.config.keepsSelectedCenter;
      },
      deep: true
    }
  }
} as ComponentOptions<MenuPanel>