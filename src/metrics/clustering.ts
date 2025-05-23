// src/metrics/clustering.ts

import { Graph, NodeId } from '../graph';

/**
 * Вычисляет локальный коэффициент кластеризации C(v) для каждого узла v графа.
 * Для неориентированного графа:
 *   C(v) = 2 * number_of_edges_between_neighbors(v) / (deg(v) * (deg(v) - 1))
 * Если степень < 2, считается 0.
 *
 * @param graph — экземпляр Graph
 * @returns Map<NodeId, number> — локальный коэффициент для каждой вершины
 */
export function clusteringCoefficient(graph: Graph): Map<NodeId, number> {
    const C = new Map<NodeId, number>();

    // вспомогательная проверка ребра u–v (для неориентированного графа оба направления)
    const hasEdge = (u: NodeId, v: NodeId) => {
        const outs = graph.adjList.get(u) || [];
        return outs.some(e => e.neighbor === v);
    };

    for (const v of graph.nodes) {
        // собрать уникальных соседей
        const neigh = (graph.adjList.get(v) || []).map(e => e.neighbor);
        const k = neigh.length;
        if (k < 2) {
            C.set(v, 0);
            continue;
        }
        // посчитать, сколько рёбер среди всех пар соседей
        let edgesBetween = 0;
        for (let i = 0; i < k; i++) {
            for (let j = i + 1; j < k; j++) {
                const u = neigh[i], w = neigh[j];
                if (hasEdge(u, w) || (!graph.directed && hasEdge(w, u))) {
                    edgesBetween++;
                }
            }
        }
        const possible = (k * (k - 1)) / 2;
        C.set(v, (2 * edgesBetween) / (k * (k - 1)));
    }

    return C;
}

/**
 * Вычисляет средний (глобальный) коэффициент кластеризации,
 * как среднее по всем локальным C(v).
 *
 * @param graph — экземпляр Graph
 * @returns число от 0 до 1
 */
export function averageClustering(graph: Graph): number {
    const C = clusteringCoefficient(graph);
    const sum = Array.from(C.values()).reduce((s, x) => s + x, 0);
    return C.size > 0 ? sum / C.size : 0;
}
