// tests/metrics/closeness.spec.ts

import { Graph } from '../../src/graph';
import { closenessCentrality } from '../../src/metrics/centrality_closeness';

describe('Closeness Centrality', () => {
    let graph: Graph;

    beforeEach(() => {

        graph = new Graph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'D');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'D');
    });

    it('should calculate closeness centrality for a simple graph', () => {
        const closeness = closenessCentrality(graph);
        const totalNodes = graph.nodes.size; // 4

        /*
          Ручной расчёт:
          Для узла A:
          - расстояние A->B = 1, A->D = 1, для A->C через B или D = 2, суммарно = 1+1+2 = 4
          Нормализованная центральность: (4-1)/4 = 3/4 = 0.75

          Для узла B:
          - B->A = 1, B->C = 1, B->D = (через A или C) = 2, сумма = 1+1+2 = 4, центральность = 0.75

          Для узла C:
          - C->B = 1, C->D = 1, C->A = 2, сумма = 1+1+2 = 4, центральность = 0.75

          Для узла D:
          - D->A = 1, D->C = 1, D->B = 2, сумма = 1+1+2 = 4, центральность = 0.75

          Таким образом, все узлы равны, т.к. граф симметричен.
        */

        expect(closeness.get('A')).toBeCloseTo(0.75);
        expect(closeness.get('B')).toBeCloseTo(0.75);
        expect(closeness.get('C')).toBeCloseTo(0.75);
        expect(closeness.get('D')).toBeCloseTo(0.75);
    });

    it('should calculate higher centrality for a more central node in an asymmetric graph', () => {
        graph = new Graph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'D');

        /*
          Ручной расчёт:
          Для узла B:
          - B->A = 1, B->C = 1, B->D = 2, сумма = 4, центральность = 3/4 = 0.75
          Для узла A:
          - A->B = 1, A->C = 2, A->D = 3, сумма = 6, центральность = 3/6 = 0.5
          Для узла C:
          - C->B = 1, C->A = 2, C->D = 1, сумма = 4, центральность = 0.75
          Для узла D:
          - D->C = 1, D->B = 2, D->A = 3, сумма = 6, центральность = 0.5

          У узлов B и C центральность выше, чем у крайних узлов A и D.
        */

        const closenessNew = closenessCentrality(graph);
        expect(closenessNew.get('B')).toBeGreaterThan(closenessNew.get('A')!);
        expect(closenessNew.get('C')).toBeGreaterThan(closenessNew.get('A')!);
        expect(closenessNew.get('B')).toBeCloseTo(0.75);
        expect(closenessNew.get('A')).toBeCloseTo(0.5);
        expect(closenessNew.get('D')).toBeCloseTo(0.5);
    });
});
