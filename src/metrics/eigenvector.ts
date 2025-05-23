// src/metrics/eigenvector.ts

import { Graph, NodeId } from '../graph';

export interface EigenvectorOptions {
    maxIterations?: number;
    tol?: number;
}


export function eigenvectorCentrality(
    graph: Graph,
    options: EigenvectorOptions = {}
): Map<NodeId, number> {
    const maxIterations = options.maxIterations ?? 100;
    const tol = options.tol ?? 1e-6;

    const nodes = Array.from(graph.nodes);

    const incoming = new Map<NodeId, NodeId[]>();
    for (const v of nodes) incoming.set(v, []);
    for (const j of nodes) {
        const outs = graph.adjList.get(j) || [];
        for (const { neighbor: i } of outs) {
            incoming.get(i)!.push(j);
        }
        if (!graph.directed) {
            for (const { neighbor: i2 } of outs) {
                incoming.get(j)!.push(i2);
            }
        }
    }

    const centrality = new Map<NodeId, number>();
    for (const v of nodes) centrality.set(v, 1);

    const newCentrality = new Map<NodeId, number>();

    for (let iter = 0; iter < maxIterations; iter++) {
        for (const v of nodes) {
            let sum = 0;
            for (const j of incoming.get(v)!) {
                sum += centrality.get(j)!;
            }
            newCentrality.set(v, sum);
        }

        let norm = 0;
        for (const v of nodes) {
            const x = newCentrality.get(v)!;
            norm += x * x;
        }
        norm = Math.sqrt(norm) || 1;

        for (const v of nodes) {
            newCentrality.set(v, newCentrality.get(v)! / norm);
        }

        let diff = 0;
        for (const v of nodes) {
            const δ = Math.abs(newCentrality.get(v)! - centrality.get(v)!);
            if (δ > diff) diff = δ;
            centrality.set(v, newCentrality.get(v)!);
        }
        if (diff < tol) break;
    }

    return centrality;
}
