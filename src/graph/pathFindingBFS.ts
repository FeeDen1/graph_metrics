
import { Graph, NodeId } from './index';

export interface BFSSearchResult {
    dist: Map<NodeId, number>;
    sigma: Map<NodeId, number>;
    predecessors: Map<NodeId, NodeId[]>;

}

export function bfs(graph: Graph, start: NodeId): Map<NodeId, number> {
    const distances = new Map<NodeId, number>();
    const queue: NodeId[] = [];

    queue.push(start);
    distances.set(start, 0);

    while (queue.length) {
        const current = queue.shift()!;
        const currentDistance = distances.get(current)!;
        const neighbors = graph.adjList.get(current) || [];
        for (const { neighbor } of neighbors) {
            if (!distances.has(neighbor)) {
                distances.set(neighbor, currentDistance + 1);
                queue.push(neighbor);
            }
        }
    }

    return distances;
}

export function extendedBFS(graph: Graph, start: NodeId): BFSSearchResult {
    const dist = new Map<NodeId, number>();
    const sigma = new Map<NodeId, number>();
    const predecessors = new Map<NodeId, NodeId[]>();

    for (const v of graph.nodes) {
        dist.set(v, -1);
        sigma.set(v, 0);
        predecessors.set(v, []);
    }

    dist.set(start, 0);
    sigma.set(start, 1);

    const queue: NodeId[] = [start];

    // Массив S для хранения порядка посещения узлов (потом будем обрабатывать его в обратном порядке)
    const visit_order: NodeId[] = [];

    while (queue.length > 0) {
        const v = queue.shift()!;
        visit_order.push(v);
        const neighbors = graph.adjList.get(v) || [];
        for (const { neighbor: w } of neighbors) {
            // Если узел w ещё не посещён, обновляем расстояние и добавляем в очередь
            if (dist.get(w) === -1) {
                dist.set(w, dist.get(v)! + 1);
                queue.push(w);
            }
            // Если найден один из кратчайших путей до w, обновляем sigma и сохраняем v как предшественника
            if (dist.get(w) === dist.get(v)! + 1) {
                sigma.set(w, sigma.get(w)! + sigma.get(v)!);
                predecessors.get(w)!.push(v);
            }
        }
    }
    return { dist, sigma, predecessors };
}