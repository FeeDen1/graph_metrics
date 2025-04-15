import { Graph } from '../../src/graph';
import { pageRank } from '../../src/metrics/pagerank';

describe('PageRank - точные тесты', () => {
    it('для симметричного цикла (A->B, B->C, C->A) значения должны быть примерно 1/3', () => {
        const graph = new Graph(true);
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'A');
        const pr = pageRank(graph, { d: 0.85, maxIterations: 100, tol: 1e-8 });
        expect(pr.get('A')).toBeCloseTo(1 / 3, 5);
        expect(pr.get('B')).toBeCloseTo(1 / 3, 5);
        expect(pr.get('C')).toBeCloseTo(1 / 3, 5);

        const sum = Array.from(pr.values()).reduce((acc:number, val:number) => acc + val, 0);
        expect(sum).toBeCloseTo(1, 5);
    });

    it('для звёздообразного графа (A->B, A->C, A->D) проверить свойства распределения', () => {
        const graph = new Graph(true);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('A', 'D');

        const pr = pageRank(graph, { d: 0.85, maxIterations: 100, tol: 1e-8 });

        expect(pr.get('A')).toBeLessThan(pr.get('B')!);
        expect(pr.get('A')).toBeLessThan(pr.get('C')!);
        expect(pr.get('A')).toBeLessThan(pr.get('D')!);

        const sum = Array.from(pr.values()).reduce((acc, val) => acc + val, 0);
        expect(sum).toBeCloseTo(1, 5);
    });
});