// tests/metrics/clustering.spec.ts

import { Graph } from '../../src/graph';
import { clusteringCoefficient, averageClustering } from '../../src/metrics/clustering';

describe('Clustering Coefficient – локальный и средний', () => {
    it('треугольник A–B–C: у всех C(v)=1, average=1', () => {
        const g = new Graph(false);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','A');

        const C = clusteringCoefficient(g);
        expect(C.get('A')).toBeCloseTo(1, 6);
        expect(C.get('B')).toBeCloseTo(1, 6);
        expect(C.get('C')).toBeCloseTo(1, 6);

        const avg = averageClustering(g);
        expect(avg).toBeCloseTo(1, 6);
    });

    it('цепочка A–B–C: C(A)=C(B)=C(C)=0, average=0', () => {
        const g = new Graph(false);
        g.addEdge('A','B');
        g.addEdge('B','C');

        const C = clusteringCoefficient(g);
        expect(C.get('A')).toBeCloseTo(0, 6);
        expect(C.get('B')).toBeCloseTo(0, 6);
        expect(C.get('C')).toBeCloseTo(0, 6);

        expect(averageClustering(g)).toBeCloseTo(0, 6);
    });

    it('квадрат A–B–C–D–A без диагоналей: все C(v)=0, average=0', () => {
        const g = new Graph(false);
        ['A','B','C','D'].forEach((u,i,a) => {
            const v = a[(i+1)%4];
            g.addEdge(u, v);
        });

        const C = clusteringCoefficient(g);
        ['A','B','C','D'].forEach(v => {
            expect(C.get(v)).toBeCloseTo(0, 6);
        });
        expect(averageClustering(g)).toBeCloseTo(0, 6);
    });

    it('сложный граф с несколькими кластерами и «хвостами»', () => {
        // Граф:
        //   Треугольник A–B–C
        //   «Веер» из C к D и E
        //   Кластер F–G–H (треугольник) + хвост I от H
        const g = new Graph(false);
        // треугольник A–B–C
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','A');
        // веер из C
        g.addEdge('C','D');
        g.addEdge('C','E');
        // кластер F–G–H
        g.addEdge('F','G');
        g.addEdge('G','H');
        g.addEdge('H','F');
        // хвост от H
        g.addEdge('H','I');

        const Cmap = clusteringCoefficient(g);

        // 1) Треугольник A, B, C
        expect(Cmap.get('A')).toBeCloseTo(1, 6);
        expect(Cmap.get('B')).toBeCloseTo(1, 6);
        // У C: deg=4, между соседями только ребро A–B ⇒ C(C)=2*1/(4*3)=1/6
        expect(Cmap.get('C')).toBeCloseTo(1/6, 6);

        // 2) D, E (веер): deg<2 ⇒ C=0
        expect(Cmap.get('D')).toBeCloseTo(0, 6);
        expect(Cmap.get('E')).toBeCloseTo(0, 6);

        // 3) Кластер F–G–H и хвост I:
        // F: deg=2 (G,H), ребро G–H есть ⇒ C(F)=2*1/(2*1)=1
        expect(Cmap.get('F')).toBeCloseTo(1, 6);
        // G: deg=2 (F,H), ребро F–H есть ⇒ C(G)=1
        expect(Cmap.get('G')).toBeCloseTo(1, 6);
        // H: deg=3 (F,G,I), между ними только F–G ⇒ edgesBetween=1, possible=3 ⇒ C(H)=2*1/(3*2)=1/3
        expect(Cmap.get('H')).toBeCloseTo(1/3, 6);
        // I: deg=1 ⇒ C(I)=0
        expect(Cmap.get('I')).toBeCloseTo(0, 6);

        // 4) Средний коэффициент:
        // Сумма локальных: 1 + 1 + 1/6 + 0 + 0 + 1 + 1 + 1/3 + 0 = 4.5
        // average = 4.5 / 9 = 0.5
        const avg = averageClustering(g);
        expect(avg).toBeCloseTo(0.5, 6);
    });
});
