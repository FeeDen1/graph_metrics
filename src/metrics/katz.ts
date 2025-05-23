// src/metrics/katz.ts

import { Graph, NodeId } from '../graph';

export interface KatzOptions {
    alpha?: number;        // коэффициент затухания (по умолчанию 0.1)
    beta?: number;         // базовый вклад (по умолчанию 1.0)
    maxIterations?: number;// максимальное число итераций (по умолчанию 100)
    tol?: number;          // порог сходимости (по умолчанию 1e-6)
}

/**
 * Вычисляет Katz centrality для ориентированного или неориентированного графа.
 *
 * Формула итерационного обновления:
 *   x_{k+1}(v) = β + α · ∑_{u → v} x_k(u)
 *
 * @param graph – экземпляр Graph
 * @param options – параметры α, β, maxIterations, tol
 * @returns Map<NodeId, number> – Katz centrality для каждой вершины
 */
export function katzCentrality(
    graph: Graph,
    options: KatzOptions = {}
): Map<NodeId, number> {
    const alpha = options.alpha ?? 0.1;
    const beta  = options.beta  ?? 1.0;
    const maxIter = options.maxIterations ?? 100;
    const tol     = options.tol ?? 1e-6;

    // 1) Соберём список входящих соседей
    const incoming = new Map<NodeId, NodeId[]>();
    for (const v of graph.nodes) incoming.set(v, []);
    for (const u of graph.nodes) {
        for (const { neighbor: v } of graph.adjList.get(u) || []) {
            incoming.get(v)!.push(u);
        }
    }

    // 2) Инициализация x⁽⁰⁾ = β для всех
    const x = new Map<NodeId, number>();
    const xNew = new Map<NodeId, number>();
    for (const v of graph.nodes) {
        x.set(v, beta);
        xNew.set(v, beta);
    }

    // 3) Итерационный процесс
    for (let iter = 0; iter < maxIter; iter++) {
        let diff = 0;
        for (const v of graph.nodes) {
            // β + α · sum_{u→v} x(u)
            let sumIn = 0;
            for (const u of incoming.get(v)!) {
                sumIn += x.get(u)!;
            }
            const xv = beta + alpha * sumIn;
            xNew.set(v, xv);
            diff = Math.max(diff, Math.abs(xv - x.get(v)!));
        }

        // обновляем и проверяем сходимость
        for (const v of graph.nodes) {
            x.set(v, xNew.get(v)!);
        }
        if (diff < tol) break;
    }

    return x;
}
