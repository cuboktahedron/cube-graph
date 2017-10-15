declare function require(x: string): any;

var html = {
  index: require('./html/index.html')
};

var scss = {
  index: require('./scss/style.scss')
};

import Vue from 'vue'
import * as icon from 'vue-icon'
import MainPanel from './ts/components/MainPanel'
import MainCanvas from './ts/components/MainCanvas'
import SidePanel from './ts/components/SidePanel'
import GraphNodeElement from './ts/components/GraphNodeElement'
import GraphLinkElement from './ts/components/GraphLinkElement'
import InformationPanel from './ts/components/InformationPanel'
import CubePanel from './ts/components/CubePanel'
import CubeView from './ts/components/CubeView'
import ControlPanel from './ts/components/ControlPanel'
import FooterPanel from './ts/components/FooterPanel'

Vue.component('canvas-panel', MainPanel);
Vue.component('main-canvas', MainCanvas);
Vue.component('side-panel', SidePanel);
Vue.component('g-node', GraphNodeElement);
Vue.component('g-link', GraphLinkElement);
Vue.component('information', InformationPanel);
Vue.component('cube-panel', CubePanel);
Vue.component('control-panel', ControlPanel);
Vue.component('footer-panel', FooterPanel);
Vue.component('cube', CubeView);
Vue.component('icon', icon);

import store from './ts/store/store'

var app = new Vue({
  el: '#app',
  store,
  template: `
    <div id="app">
      <canvas-panel id="main-panel"></canvas-panel>
      <side-panel id="side-panel"></side-panel>
      <footer-panel id="footer-panel"></footer-panel>
    </div>`
});

