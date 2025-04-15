
import { Graph, NodeId } from '../graph';

export function degreeCentrality(graph: Graph): Map<NodeId, number> {
    const centrality = new Map<NodeId, number>();
    for (const node of graph.nodes) {
        const degree = graph.adjList.get(node)?.length ?? 0;
        centrality.set(node, degree);
    }
    return centrality;
}


export function outDegreeCentrality(graph: Graph): Map<NodeId, number> {
    const outDegree = new Map<NodeId, number>();
    for (const node of graph.nodes) {
        outDegree.set(node, (graph.adjList.get(node) || []).length);
    }
    return outDegree;
}

export function inDegreeCentrality(graph: Graph): Map<NodeId, number> {
    const inDegree = new Map<NodeId, number>();
    for (const node of graph.nodes) {
        inDegree.set(node, 0);
    }
    for (const [node, neighbors] of graph.adjList.entries()) {
        for (const { neighbor } of neighbors) {
            inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
        }
    }

    return inDegree;
}