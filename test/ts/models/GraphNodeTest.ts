import { expect } from 'chai';
import GraphNode from '../../../src/ts/models/GraphNode';
import GraphLink from '../../../src/ts/models/GraphLink';

describe('GraphNode', function () {
  var initGraph = function (data) {
    const nodes = {};
    nodes[1] = new GraphNode();

    let links: GraphLink[] = [];
    data.links.forEach((link) => {
      if (!!nodes[link.target]) {
        const source: GraphNode = nodes[link.source];
        const target: GraphNode = nodes[link.target];
        const gLink = new GraphLink(link.path, source, target);

        links.push(gLink);
      } else {
        const source: GraphNode = nodes[link.source];
        const target: GraphNode = nodes[link.source].copy();
        const gLink = new GraphLink(link.path, source, target);

        nodes[link.target] = target;
        links.push(gLink);
      }
    });

    return {
      nodes: nodes,
      links: links,
    };
  }

  describe('#updateLinkDirections', function () {
    it(`recalculate distances`, function () {
      // +---+  U  +---+  U  +---+  B  +---+  B  +---+  U  +---+  U  +---+  B  +---+  
      // | 1 | --> | 2 | --> | 3 | --> | 4 | --> | 5 | --> | 6 | --> | 7 | --> | 9 |  
      // +---+     +---+     +---+     +---+     +---+     +---+     +---+     +---+  
      //                                           |                   ^
      //                                           |  U'   +---+  U'   |
      //                                           +-----> | 8 |-------+
      //                                                   +---+
      const graphDataHaveLoop = initGraph({
        links: [
          { path: "U", source: 1, target: 2 },
          { path: "U", source: 2, target: 3 },
          { path: "B", source: 3, target: 4 },
          { path: "B", source: 4, target: 5 },
          { path: "U", source: 5, target: 6 },
          { path: "U'", source: 5, target: 8 },
          { path: "U", source: 6, target: 7 },
          { path: "U'", source: 8, target: 7 },
          { path: "B", source: 7, target: 9 },
        ]
      });
      const nodes = graphDataHaveLoop.nodes;
      let links: GraphLink[] = graphDataHaveLoop.links;

      const link1_9 = new GraphLink("B'", nodes[1], nodes[9]);
      nodes[9].updateLinkDirections();

      expect(nodes[1].distance).to.equal(0);
      expect(nodes[2].distance).to.equal(1);
      expect(nodes[3].distance).to.equal(2);
      expect(nodes[4].distance).to.equal(3);
      expect(nodes[5].distance).to.equal(4);
      expect(nodes[6].distance).to.equal(3);
      expect(nodes[7].distance).to.equal(2);
      expect(nodes[8].distance).to.equal(3);
      expect(nodes[9].distance).to.equal(1);
    });
  });
});
