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
          }, {
            command: "cmdLoad",
            title: "load",
            description: "Load file.",
          }, {
            command: "cmdSave",
            title: "save",
            description: "Save file.",
          }]
        },
        {
          active: false,
          title: "Edit",
          items: [{
            command: "cmdReset",
            title: "reset",
            description: "Reset field to initial state.",
          }]
        },
      ]
    };
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
  }
} as ComponentOptions<MenuPanel>