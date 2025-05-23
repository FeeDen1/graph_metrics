// tests/metrics/eigenvector.spec.ts

import { Graph } from '../../src/graph';
import { eigenvectorCentrality } from '../../src/metrics/eigenvector';

describe('Eigenvector Centrality – сложные случаи', () => {
    it('Path graph из 4 узлов: A–B–C–D', () => {
        // Построим неориентированный путь A–B–C–D
        const g = new Graph(false);
        g.addEdge('A', 'B');
        g.addEdge('B', 'C');
        g.addEdge('C', 'D');

        const c = eigenvectorCentrality(g, { maxIterations: 500, tol: 1e-10 });

        // Ожидаем: B и C (центральные узлы пути) имеют одинаковый и наибольший рейтинг,
        // A и D — одинаково меньший.
        expect(c.get('B')).toBeCloseTo(c.get('C')!, 6);
        expect(c.get('A')).toBeCloseTo(c.get('D')!, 6);
        expect(c.get('B')).toBeGreaterThan(c.get('A')!);

        // Проверим, что сумма квадратов = 1 (L2-норма вектора = 1)
        const norm2 = ['A','B','C','D']
            .map(v => c.get(v)!)
            .reduce((s, x) => s + x*x, 0);
        expect(norm2).toBeCloseTo(1, 6);
    });

    it('Две треугольные компоненты, соединённые мостом', () => {
        // Граф: два треугольника A-B-C-A и C-D-E-C
        //            A
        //           / \
        //          B---C---D
        //               \ /
        //                E
        const g = new Graph(false);
        g.addEdge('A','B'); g.addEdge('B','C'); g.addEdge('C','A');
        g.addEdge('C','D'); g.addEdge('D','E'); g.addEdge('E','C');

        const c = eigenvectorCentrality(g, { maxIterations: 500, tol: 1e-12 });

        // Узел C — «мост» между двумя плотными кластерами, должен иметь наивысший рейтинг.
        const cC = c.get('C')!;
        expect(cC).toBeGreaterThan(c.get('A')!);
        expect(cC).toBeGreaterThan(c.get('B')!);
        expect(cC).toBeGreaterThan(c.get('D')!);
        expect(cC).toBeGreaterThan(c.get('E')!);

        // Узлы A и B в первом треугольнике имеют одинаковый рейтинг,
        // как и D и E во втором.
        expect(c.get('A')).toBeCloseTo(c.get('B')!, 6);
        expect(c.get('D')).toBeCloseTo(c.get('E')!, 6);

        // L2-норма должна быть 1
        const sumSq = ['A','B','C','D','E']
            .map(v => c.get(v)!)
            .reduce((s, x) => s + x*x, 0);
        expect(sumSq).toBeCloseTo(1, 6);
    });
});
