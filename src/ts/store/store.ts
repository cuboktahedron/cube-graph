import Vue from 'vue'
import Vuex from 'vuex'

import GraphNode from '../models/GraphNode';
import GraphLink from '../models/GraphLink';
import * as d3 from 'd3';
import { ScaleOrdinal } from 'd3';

Vue.use(Vuex)

interface Coordinates { x: number, y: number }
interface State {
  activeLink: GraphLink,
  bus: Vue,
  colors: ScaleOrdinal<string, string>,
  coordinates: Coordinates,
  debug: boolean,
  nodeNum: number,
  linkNum: number,
  selectedLink: GraphLink,
  selectedNode: GraphNode,
  simulation: d3.Simulation<{}, undefined>,
  transform: {
    translate: {
      x: number,
      y: number,
    },
    scale: number,
  }
}

const state: State = {
  activeLink: null,
  bus: new Vue(),
  colors: d3.scaleOrdinal(d3.schemeCategory20),
  coordinates: { x: 0, y: 0 },
  debug: true,
  nodeNum: 0,
  linkNum: 0,
  selectedLink: null,
  selectedNode: null,
  simulation: null,
  transform: {
    translate: {
      x: 0,
      y: 0,
    },
    scale: 1
  }
}

const mutations = {
  linkNum(state: State, num: number) {
    state.linkNum = num;
  },

  nodeNum(state: State, num: number) {
    state.nodeNum = num;
  },

  setCoordinates(state: State, payload: Coordinates) {
    state.coordinates = {
      x: payload.x,
      y: payload.y
    };
  },

  selectActiveLink(state: State, activeLink: GraphLink) {
    if (state.activeLink != null) {
      state.activeLink.isActive = false;
    }

    console.log(activeLink);

    state.activeLink = activeLink;
  },

  selectLink(state: State, selectedLink: GraphLink) {
    if (state.selectedLink != null) {
      state.selectedLink.blur();
    }

    if (state.debug) {
      if (selectedLink == null) {
      } else {
        selectedLink.focus();
      }
    }
    state.selectedLink = selectedLink;
  },

  selectNode(state: State, selectedNode: GraphNode) {
    if (state.selectedNode != null) {
      state.selectedNode.blur();
    }

    if (state.debug) {
      if (selectedNode == null) {
      } else {
        selectedNode.focus();
      }
    }
    state.selectedNode = selectedNode;
  },

  setSimulation(state: State, simulation: d3.Simulation<{}, undefined>) {
    state.simulation = simulation;
  },

  setTransform(state: State, transform) {
    state.transform = transform;
  }
}

const actions = {
  linkNum: ({ commit }, num: number) => commit('linkNum', num),
  nodeNum: ({ commit }, num: number) => commit('nodeNum', num),
  selectActiveLink: ({ commit }, activeLink: GraphLink) => commit('selectActiveLink', activeLink),
  selectLink: ({ commit }, selectedLink: GraphLink) => commit('selectLink', selectedLink),
  selectNode: ({ commit, state }, selectedNode: GraphNode) => {
    let prevNode = state.selectedNode;
    commit('selectNode', selectedNode)
    if (selectedNode == null || selectedNode.links.length === 0) {
      commit('selectLink', null);
      return;
    }
    
    let prevLink = state.selectedLink;
    if (prevNode == null || prevLink == null || prevLink.source === prevNode) {
      let link = selectedNode.links.concat().sort(GraphLink.orderBySource(selectedNode))[0];
      commit('selectLink', link);
    } else {
      let link = selectedNode.links.concat().sort(GraphLink.orderByTarget(selectedNode))[0];
      commit('selectLink', link);
    }
   },
  setCoordinates: ({ commit }, payload: Coordinates) => {
    commit('setCoordinates', payload);
  },

  setSimulation: ({ commit }, simulation: d3.Simulation<{}, undefined>) => {
    commit('setSimulation', simulation);
  },

  setTransform: ({ commit }, transform) => {
    commit('setTransform', transform);
  },
}

const getters = {
  colors(state: State) {
    return state.colors;
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
