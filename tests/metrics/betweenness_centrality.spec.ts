// tests/metrics/betweenness.spec.ts

import { Graph } from '../../src/graph';
import { betweennessCentrality } from '../../src/metrics/betweenness_centrality';

describe('Betweenness Centrality (Brandes Algorithm)', () => {
    it('should calculate betweenness for a line graph A-B-C', () => {
        // Линейный граф: A -- B -- C (неориентированный)
        const graph = new Graph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');

        const bc = betweennessCentrality(graph);

        // Ожидаем:
        // - Узел B находится на кратчайшем пути между A и C, его центральность должна быть равна 1.
        // - Узлы A и C не лежат на кратчайших путях между другими, их центральность должна быть 0.
        expect(bc.get('A')).toBeCloseTo(0);
        expect(bc.get('B')).toBeCloseTo(1);
        expect(bc.get('C')).toBeCloseTo(0);
    });

    it('should calculate betweenness for a star graph', () => {
        // Звездообразный граф: центр A, листья B, C, D (неориентированный)
        const graph = new Graph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('A', 'D');

        const bc = betweennessCentrality(graph);

        /*
          Во звезде:
          - Все кратчайшие пути между парами листовых узлов проходят через центр A.
          - Количество пар листовых узлов: C(3,2) = 3.
          - Поэтому центральность A должна равняться 3, а у листовых узлов – 0.
        */
        expect(bc.get('A')).toBeCloseTo(3);
        expect(bc.get('B')).toBeCloseTo(0);
        expect(bc.get('C')).toBeCloseTo(0);
        expect(bc.get('D')).toBeCloseTo(0);
    });
});

describe('Betweenness Centrality – Точный тест для 6-узлового графа', () => {
    it('должен возвращать точные значения для заданного графа', () => {
        const graph = new Graph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'C');
        graph.addEdge('B', 'D');
        graph.addEdge('C', 'D');
        graph.addEdge('D', 'E');
        graph.addEdge('D', 'F');

        const bc = betweennessCentrality(graph);
        expect(bc.get('A')).toBeCloseTo(0, 5);
        expect(bc.get('B')).toBeCloseTo(1.5, 5);
        expect(bc.get('C')).toBeCloseTo(1.5, 5);
        expect(bc.get('D')).toBeCloseTo(7, 5);
        expect(bc.get('E')).toBeCloseTo(0, 5);
        expect(bc.get('F')).toBeCloseTo(0, 5);
    });
});