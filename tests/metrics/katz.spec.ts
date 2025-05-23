// tests/metrics/katz.spec.ts

import { Graph } from '../../src/graph';
import { katzCentrality } from '../../src/metrics/katz';

describe('Katz Centrality – нетривиальные случаи', () => {
    it('цепочка A→B→C→D при α=0.5, β=1', () => {
        // A→B→C→D
        const g = new Graph(true);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','D');

        const katz = katzCentrality(g, { alpha: 0.5, beta: 1, maxIterations: 50, tol: 1e-9 });

        // ручной расчёт:
        // x(A)=1
        // x(B)=1 + 0.5*1     = 1.5
        // x(C)=1 + 0.5*1.5   = 1.75
        // x(D)=1 + 0.5*1.75  = 1.875
        expect(katz.get('A')).toBeCloseTo(1.00000, 5);
        expect(katz.get('B')).toBeCloseTo(1.50000, 5);
        expect(katz.get('C')).toBeCloseTo(1.75000, 5);
        expect(katz.get('D')).toBeCloseTo(1.87500, 5);
    });

    it('ориентированная звезда: A→B, A→C, A→D при α=0.8, β=1', () => {
        const g = new Graph(true);
        g.addEdge('A','B');
        g.addEdge('A','C');
        g.addEdge('A','D');

        const katz = katzCentrality(g, { alpha: 0.8, beta: 1, maxIterations: 100, tol: 1e-9 });

        // B,C,D: по одному входящему из A → x = 1 + 0.8*x(A)
        // A: без входящих → x(A)=1
        // Итого: x(A)=1, x(B)=x(C)=x(D)=1.8
        expect(katz.get('A')).toBeCloseTo(1.0, 6);
        expect(katz.get('B')).toBeCloseTo(1.8, 6);
        expect(katz.get('C')).toBeCloseTo(1.8, 6);
        expect(katz.get('D')).toBeCloseTo(1.8, 6);
    });

    it('ориентированный цикл A→B→C→A при α=0.5, β=1 даёт равные значения', () => {
        const g = new Graph(true);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','A');

        const katz = katzCentrality(g, { alpha: 0.5, beta: 1, maxIterations: 200, tol: 1e-9 });

        // В симметричном цикле все x одинаковы
        const xA = katz.get('A')!;
        const xB = katz.get('B')!;
        const xC = katz.get('C')!;
        expect(xA).toBeCloseTo(xB, 6);
        expect(xB).toBeCloseTo(xC, 6);
        // Более того, x ≈ β/(1-α) = 1/(1-0.5) = 2
        expect(xA).toBeCloseTo(2.0, 4);
    });

    it('сложный ориентированный граф с ветвлением и циклами', () => {
        // Граф:
        //   A→B→C→D
        //     ↘  ↗
        //      E
        //     ↗  ↘
        //   H←G←F
        const g = new Graph(true);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','D');
        g.addEdge('B','E');
        g.addEdge('E','D');
        g.addEdge('C','E');
        g.addEdge('F','G');
        g.addEdge('G','H');
        g.addEdge('H','E');
        // две точки пересекаются в E→D и C→D

        const katz = katzCentrality(g, { alpha: 0.3, beta: 1, maxIterations: 200, tol: 1e-9 });

        // 1) E имеет много входящих от B, C, H → должно быть наибольшим
        const xE = katz.get('E')!;
        for (const v of ['A','B','C','D','F','G','H']) {
            expect(xE).toBeGreaterThan(katz.get(v)!);
        }

        // 2) A и F — без входящих → x=1
        expect(katz.get('A')).toBeCloseTo(1, 6);
        expect(katz.get('F')).toBeCloseTo(1, 6);

        // 3) Пересечения B, C, G идут по возрастанию ветвящимся путём:
        //   B(от A): ~1.3, C(от B+E): >B, G(от F): ~1.3
        expect(katz.get('C')).toBeGreaterThan(katz.get('B')!);
        expect(katz.get('G')).toBeCloseTo(1.0 + 0.3 * katz.get('F')!, 3);
    });
});
