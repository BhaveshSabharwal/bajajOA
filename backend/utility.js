/*Utility logic for main logic*/

class Utility {
  constructor(validEdges) {
    this.validEdges = validEdges || [];
    this.graphs = new Map();
  }

  buildGraphs() {
    const edges = {};
    const children = new Set();

    for (const edge of this.validEdges) {
      const [parent, child] = edge.split("->");
      children.add(child);

      if (!edges[parent]) {
        edges[parent] = [];
      }
      if (!edges[parent].includes(child)) {
        edges[parent].push(child);
      }
    }

    const allNodes = new Set();
    for (const edge of this.validEdges) {
      const [parent, child] = edge.split("->");
      allNodes.add(parent);
      allNodes.add(child);
    }

    const visited = new Set();
    const roots = [];

    for (const node of allNodes) {
      if (!visited.has(node) && !children.has(node)) {
        roots.push(node);
        this.markComponent(node, edges, visited);
      }
    }

    for (const node of allNodes) {
      if (!visited.has(node)) {
        const cycleRoot = Array.from(this.getComponentNodes(node, edges)).sort()[0];
        if (!roots.includes(cycleRoot)) {
          roots.push(cycleRoot);
        }
        this.markComponent(node, edges, visited);
      }
    }

    for (const root of roots) {
      const componentNodes = this.getComponentNodes(root, edges);
      this.graphs.set(root, { root, edges, nodes: componentNodes });
    }
  }

  getComponentNodes(node, edges) {
    const nodes = new Set();
    const queue = [node];
    const visited = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      nodes.add(current);
      if (edges[current]) queue.push(...edges[current]);
    }
    return nodes;
  }

  markComponent(node, edges, visited) {
    if (visited.has(node)) return;
    visited.add(node);
    if (edges[node]) {
      for (const child of edges[node]) {
        this.markComponent(child, edges, visited);
      }
    }
  }

  hasCycle(root, edges, nodes) {
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (node) => {
      visited.add(node);
      recursionStack.add(node);
      if (edges[node]) {
        for (const child of edges[node]) {
          if (!visited.has(child)) {
            if (dfs(child)) return true;
          } else if (recursionStack.has(child)) return true;
        }
      }
      recursionStack.delete(node);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }
    return false;
  }

  buildTreeStructure(root, edges) {
    const tree = {};
    let maxDepth = 0;

    const buildNode = (node, depth) => {
      maxDepth = Math.max(maxDepth, depth);
      const nodeObj = {};
      if (edges[node]) {
        for (const child of edges[node]) {
          nodeObj[child] = buildNode(child, depth + 1);
        }
      }
      return nodeObj;
    };

    tree[root] = buildNode(root, 1);
    return { tree, depth: maxDepth };
  }

  processHierarchies() {
    this.buildGraphs();
    const hierarchies = [];

    for (const [root, graphData] of this.graphs) {
      const { edges, nodes } = graphData;
      const hierarchy = { root };

      if (this.hasCycle(root, edges, nodes)) {
        hierarchy.tree = {};
        hierarchy.has_cycle = true;
      } else {
        const { tree, depth } = this.buildTreeStructure(root, edges);
        hierarchy.tree = tree;
        hierarchy.depth = depth;
      }
      hierarchies.push(hierarchy);
    }
    return hierarchies;
  }

  generateSummary(hierarchies) {
    const totalTrees = hierarchies.filter((h) => !h.has_cycle).length;
    const totalCycles = hierarchies.filter((h) => h.has_cycle).length;
    let largestTreeRoot = null;
    let maxDepth = 0;

    for (const hierarchy of hierarchies) {
      if (!hierarchy.has_cycle && hierarchy.depth) {
        if (
          hierarchy.depth > maxDepth ||
          (hierarchy.depth === maxDepth && (!largestTreeRoot || hierarchy.root < largestTreeRoot))
        ) {
          maxDepth = hierarchy.depth;
          largestTreeRoot = hierarchy.root;
        }
      }
    }
    return { total_trees: totalTrees, total_cycles: totalCycles, largest_tree_root: largestTreeRoot || "" };
  }
}

module.exports = Utility;
