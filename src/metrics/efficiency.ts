// src/metrics/efficiency.ts

import { Graph, NodeId } from '../graph';
import {bfs, bfsRestricted} from "../graph/pathFindingBFS";

/**
 * Глобальная эффективность:
 *   E_glob = (1 / (n * (n - 1))) * Σ_{i≠j} 1 / d(i,j),
 * где d(i,j) — длина кратчайшего пути, полученная BFS.
 */
export function globalEfficiency(graph: Graph): number {
    const nodes = Array.from(graph.nodes);
    const n = nodes.length;
    if (n < 2) return 0;

    let sum = 0;
    // Для каждой i строим BFS
    for (const i of nodes) {
        const dist = bfs(graph, i);
        for (const j of nodes) {
            if (j === i) continue;
            const d = dist.get(j)!;
            if (d > 0 && d < Infinity) sum += 1 / d;
        }
    }

    return sum / (n * (n - 1));
}


/**
 * Локальная эффективность:
 *   E_loc(v) = (1/(k*(k-1))) * Σ_{u≠w in N(v)} 1 / d_N(u,w),
 * где N(v) — соседи v, а d_N — кратчайший путь в индуцированном подграфе на N(v),
 * который мы считаем через bfsRestricted.
 * Если |N(v)| < 2, возвращаем 0.
 */
export function localEfficiency(graph: Graph): Map<NodeId, number> {
    const E = new Map<NodeId, number>();
    const allNodes = Array.from(graph.nodes);

    for (const v of allNodes) {
        const neigh = (graph.adjList.get(v) || []).map(e => e.neighbor);
        const k = neigh.length;
        if (k < 2) {
            E.set(v, 0);
            continue;
        }

        const neighSet = new Set<NodeId>(neigh);


        let sum = 0;
        for (const u of neigh) {
            const distU = bfsRestricted(graph, u, neighSet);
            for (const w of neigh) {
                if (w === u) continue;
                const d = distU.get(w)!;
                if (d > 0 && d < Infinity) sum += 1 / d;
            }
        }

        E.set(v, sum / (k * (k - 1)));
    }

    return E;
}
