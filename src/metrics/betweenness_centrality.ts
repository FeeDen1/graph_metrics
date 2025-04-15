import {Graph, NodeId} from "../graph";
import {extendedBFS} from "../graph/pathFindingBFS";

export function betweennessCentrality(graph: Graph): Map<NodeId, number> {
    const BC = new Map<NodeId, number>();
    for (const v of graph.nodes) {
        BC.set(v, 0);
    }

    for (const s of graph.nodes) {
        const { dist, sigma, predecessors } = extendedBFS(graph, s);
        const delta = new Map<NodeId, number>();
        for (const v of graph.nodes) {
            delta.set(v, 0);
        }

        const nodesSorted = Array.from(graph.nodes)
            .filter((v) => dist.get(v)! >= 0)
            .sort((a, b) => dist.get(b)! - dist.get(a)!);

        for (const w of nodesSorted) {
            for (const v of predecessors.get(w)!) {
                delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
            }
            if (w !== s) {
                BC.set(w, BC.get(w)! + delta.get(w)!);
            }
        }
    }

    if (!graph.directed) {
        for (const v of graph.nodes) {
            BC.set(v, BC.get(v)! / 2);
        }
    }
    return BC;
}