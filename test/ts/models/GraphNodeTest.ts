import { expect } from 'chai';
import GraphNode from '../../../src/ts/models/GraphNode';
import GraphLink from '../../../src/ts/models/GraphLink';

describe('GraphNode', function () {
  var initGraph = function (data) {
    const nodes = {};
    let links = {};
    nodes[1] = new GraphNode();
    nodes[1].isRoot = true;
    nodes[1].name = 1;
    data.links.forEach((link) => {
      if (!!nodes[link.target]) {
        const source: GraphNode = nodes[link.source];
        const target: GraphNode = nodes[link.target];
        const gLink = new GraphLink(link.path, source, target);

        links[link.source + '-' + link.target] = gLink;
      } else {
        const source: GraphNode = nodes[link.source];
        const target: GraphNode = nodes[link.source].copy();
        target.name = link.target;
        const gLink = new GraphLink(link.path, source, target);

        nodes[link.target] = target;
        links[link.source + '-' + link.target] = gLink;
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
          { path: "U", source: 1, target: 2  },
          { path: "U", source: 2, target: 3  },
          { path: "B", source: 3, target: 4  },
          { path: "B", source: 4, target: 5  },
          { path: "U", source: 5, target: 6  },
          { path: "U'", source: 5, target: 8 },
          { path: "U", source: 6, target: 7  },
          { path: "U'", source: 8, target: 7 },
          { path: "B", source: 7, target: 9  },
        ]
      });
      const nodes = graphDataHaveLoop.nodes;

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

  describe('#remove', function () {
    it(`reconstruct paths`, function () {
      // +---+  U  +---+  U  +---+  D  +---+  U  +---+ 
      // | 1 | --> | 2 | --> | 3 | --> | 4 | <-- | 5 | 
      // +---+     +---+     +---+     +---+     +---+ 
      //   |                                       ^
      //   |         D'      +---+       U         |
      //   +---------------> | 6 |-----------------+
      //                     +---+                  
      const graphData = initGraph({
        links: [
          { path: "U" , source: 1, target: 2 },
          { path: "D'", source: 1, target: 6 },
          { path: "U" , source: 2, target: 3 },
          { path: "D" , source: 3, target: 4 },
          { path: "U" , source: 6, target: 5 },
          { path: "U" , source: 5, target: 4 },
        ]
      });
      const nodes = graphData.nodes;
      let links = graphData.links;

      (nodes[2] as GraphNode).remove();
      expect(nodes[1].distance).to.equal(0);
      expect(nodes[6].distance).to.equal(1);
      expect(nodes[5].distance).to.equal(2);
      expect(nodes[4].distance).to.equal(3);
      expect(nodes[3].distance).to.equal(4);
      expect(nodes[2].distance).to.equal(-1);
    });

    it(`cuts the node and subordinates`, function () {
      // +---+  U  +---+  U  +---+  D  +---+  U  +---+ 
      // | 1 | --> | 2 | --> | 3 | --> | 4 | --> | 5 | 
      // +---+     +---+     +---+     +---+     +---+ 
      const graphData = initGraph({
        links: [
          { path: "U" , source: 1, target: 2 },
          { path: "U" , source: 2, target: 3 },
          { path: "D" , source: 3, target: 4 },
          { path: "U" , source: 4, target: 5 },
        ]
      });
      const nodes = graphData.nodes;
      let links = graphData.links;

      (nodes[3] as GraphNode).remove();
      expect(nodes[1].distance).to.equal(0);
      expect(nodes[2].distance).to.equal(1);
      expect(nodes[3].distance).to.equal(-1);
      expect(nodes[4].distance).to.equal(-1);
      expect(nodes[5].distance).to.equal(-1);
    });
  });
});
