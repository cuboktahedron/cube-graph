import { expect } from 'chai';
import GraphNode from '../../../src/ts/models/GraphNode';
import GraphLink from '../../../src/ts/models/GraphLink';

describe('GraphLink', function () {
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

  describe('#orderByCCW', function () {
    it(`sort by counter clock wise from base link`, function () {
      //           +---+ 
      //           | 5 | 
      //           +---+ 
      //             ^
      //             | B
      //             |
      // +---+  F  +---+  U  +---+ 
      // | 4 | <-- | 1 | --> | 2 | 
      // +---+     +---+     +---+ 
      //             | 
      //             | R
      //             v
      //           +---+ 
      //           | 3 |
      //           +---+
      const graphData = initGraph({
        links: [
          { path: "U", source: 1, target: 2 },
          { path: "R", source: 1, target: 3 },
          { path: "F", source: 1, target: 4 },
          { path: "B", source: 1, target: 5 },
        ]
      });
      const nodes = graphData.nodes;
      nodes[1].x =  0; nodes[1].y =  0;
      nodes[2].x =  1; nodes[2].y =  0;
      nodes[3].x =  0; nodes[3].y =  1;
      nodes[4].x = -1; nodes[4].y =  0;
      nodes[5].x =  0; nodes[5].y = -1;
      let links: GraphLink[] = graphData.links;
      const sLinks: GraphLink[] =
         nodes[1].links.concat().sort(GraphLink.orderByCCW(nodes[1], links[0]));
    expect(sLinks[0].id).to.equal(links[3].id);
    expect(sLinks[1].id).to.equal(links[2].id);
    expect(sLinks[2].id).to.equal(links[1].id);
    expect(sLinks[3].id).to.equal(links[0].id);
  });
  });
});
