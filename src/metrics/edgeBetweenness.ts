// src/metrics/edgeBetweenness.ts

import { Graph, NodeId } from '../graph';


export function edgeBetweennessCentrality(graph: Graph): Map<string, number> {
    const nodes = Array.from(graph.nodes);
    const ebc = new Map<string, number>();

    for (const u of nodes) {
        for (const { neighbor: v } of graph.adjList.get(u) || []) {
            const key = `${u}->${v}`;
            ebc.set(key, 0);
        }
    }

    for (const s of nodes) {
        const dist = new Map<NodeId, number>();
        const sigma = new Map<NodeId, number>();
        const P = new Map<NodeId, NodeId[]>();
        const S: NodeId[] = [];

        for (const v of nodes) {
            dist.set(v, -1);
            sigma.set(v, 0);
            P.set(v, []);
        }
        dist.set(s, 0);
        sigma.set(s, 1);

        const queue: NodeId[] = [s];
        while (queue.length) {
            const v = queue.shift()!;
            S.push(v);
            for (const { neighbor: w } of graph.adjList.get(v) || []) {
                if (dist.get(w)! < 0) {
                    dist.set(w, dist.get(v)! + 1);
                    queue.push(w);
                }
                if (dist.get(w)! === dist.get(v)! + 1) {
                    sigma.set(w, sigma.get(w)! + sigma.get(v)!);
                    P.get(w)!.push(v);
                }
            }
        }

        const deltaV = new Map<NodeId, number>();
        for (const v of nodes) deltaV.set(v, 0);


        while (S.length) {
            const w = S.pop()!;
            for (const v of P.get(w)!) {
                const c = (sigma.get(v)! / sigma.get(w)!) * (1 + deltaV.get(w)!);

                const keyVW = `${v}->${w}`;
                ebc.set(keyVW, ebc.get(keyVW)! + c);

                if (!graph.directed) {
                    const keyWV = `${w}->${v}`;
                    ebc.set(keyWV, ebc.get(keyWV)! + c);
                }

                deltaV.set(v, deltaV.get(v)! + c);
            }
        }
    }

    if (!graph.directed) {
        for (const key of ebc.keys()) {
            ebc.set(key, ebc.get(key)! / 2);
        }
    }

    return ebc;
}
