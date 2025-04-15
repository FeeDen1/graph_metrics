import {Graph, NodeId} from "../graph";

export interface PageRankOptions {
    d?: number;
    maxIterations?: number;
    tol?: number;
}

export function pageRank(graph: Graph, options?: PageRankOptions): Map<NodeId, number> {
    const d = options?.d ?? 0.85;
    const maxIterations = options?.maxIterations ?? 100;
    const tol = options?.tol ?? 1e-6;

    const N = graph.nodes.size;
    const pr = new Map<NodeId, number>();
    const newPr = new Map<NodeId, number>();

    graph.nodes.forEach((node) => pr.set(node, 1 / N));


    const incoming = new Map<NodeId, NodeId[]>();
    graph.nodes.forEach((node) => incoming.set(node, []));

    graph.nodes.forEach((j) => {
        const outs = graph.adjList.get(j) || [];
        outs.forEach(({ neighbor: i }) => {
            incoming.get(i)!.push(j);
        });
    });

    const outDegree = new Map<NodeId, number>();
    graph.nodes.forEach((j) => {
        const outs = graph.adjList.get(j) || [];
        outDegree.set(j, outs.length);
    });


    for (let iter = 0; iter < maxIterations; iter++) {
        let danglingSum = 0;
        graph.nodes.forEach((j) => {
            if ((outDegree.get(j) ?? 0) === 0) {
                danglingSum += pr.get(j)!;
            }
        });


        graph.nodes.forEach((i) => {
            let sum = 0;
            incoming.get(i)!.forEach((j) => {
                if (outDegree.get(j)! > 0) {
                    sum += pr.get(j)! / outDegree.get(j)!;
                }
            });

            const danglingContribution = danglingSum / N;

            newPr.set(i, (1 - d) / N + d * (sum + danglingContribution));
        });

        let diff = 0;
        graph.nodes.forEach((i) => {
            diff = Math.max(diff, Math.abs(newPr.get(i)! - pr.get(i)!));
            pr.set(i, newPr.get(i)!);
        });

        if (diff < tol) {
            break;
        }
    }

    return pr;
}