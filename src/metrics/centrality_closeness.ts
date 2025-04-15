
import { Graph, NodeId } from '../graph';
import { bfs } from '../graph/pathFindingBFS';


export function closenessCentrality(graph: Graph): Map<NodeId, number> {
    const centrality = new Map<NodeId, number>();
    const totalNodes = graph.nodes.size;

    for (const node of graph.nodes) {
        const distances = bfs(graph, node);
        let sum = 0;
        for (const [target, dist] of distances.entries()) {
            if (target !== node) {
                sum += dist;
            }
        }
        const closeness = sum > 0 ? (totalNodes - 1) / sum : 0;
        centrality.set(node, closeness);
    }

    return centrality;
}
