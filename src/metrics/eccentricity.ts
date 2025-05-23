// src/metrics/eccentricity.ts

import { Graph, NodeId } from '../graph';


function connectedComponents(graph: Graph): NodeId[][] {
    const visited = new Set<NodeId>();
    const comps: NodeId[][] = [];
    const nodes = Array.from(graph.nodes);

    for (const start of nodes) {
        if (visited.has(start)) continue;
        const comp: NodeId[] = [];
        const stack = [start];
        visited.add(start);
        while (stack.length) {
            const v = stack.pop()!;
            comp.push(v);
            // Для неориентированного: adjList уже содержит оба направления
            for (const { neighbor: w } of graph.adjList.get(v) || []) {
                if (!visited.has(w)) {
                    visited.add(w);
                    stack.push(w);
                }
            }
        }
        comps.push(comp);
    }
    return comps;
}

export function eccentricity(graph: Graph): Map<NodeId, number> {
    const ecc = new Map<NodeId, number>();
    const nodes = Array.from(graph.nodes);

    const comps = connectedComponents(graph);
    let mainComp = comps[0];
    for (const c of comps) {
        if (c.length > mainComp.length) mainComp = c;
    }
    const mainSet = new Set(mainComp);

    for (const s of nodes) {
        if (!mainSet.has(s)) {
            ecc.set(s, Infinity);
            continue;
        }
        const dist = new Map<NodeId, number>();
        for (const v of nodes) dist.set(v, Infinity);
        dist.set(s, 0);
        const q: NodeId[] = [s];
        while (q.length) {
            const v = q.shift()!;
            const dv = dist.get(v)!;
            for (const { neighbor: w } of graph.adjList.get(v) || []) {
                if (dist.get(w)! === Infinity) {
                    dist.set(w, dv + 1);
                    q.push(w);
                }
            }
        }
        let e = 0;
        for (const u of mainComp) {
            e = Math.max(e, dist.get(u)!);
        }
        ecc.set(s, e);
    }

    return ecc;
}

export function radius(graph: Graph): number {
    const eccMap = eccentricity(graph);
    let r = Infinity;
    for (const e of eccMap.values()) {
        if (e === Infinity) return Infinity;
        r = Math.min(r, e);
    }
    return r;
}

export function diameter(graph: Graph): number {
    const eccMap = eccentricity(graph);
    for (const e of eccMap.values()) {
        if (e === Infinity) return Infinity;
    }
    // все конечны
    return Math.max(...eccMap.values());
}
