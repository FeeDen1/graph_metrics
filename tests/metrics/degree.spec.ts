import { Graph } from '../../src/graph';
import { degreeCentrality } from '../../src/metrics/degree';
import { inDegreeCentrality, outDegreeCentrality } from '../../src/metrics/degree';

describe('Degree Centrality', () => {
    it('should return correct degrees for a simple graph', () => {
        const graph = new Graph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'C');

        const centrality = degreeCentrality(graph);
        expect(centrality.get('A')).toBe(2);
        expect(centrality.get('B')).toBe(2);
        expect(centrality.get('C')).toBe(2);
    });
});

describe('Degree Centrality для ориентированных графов', () => {
    let graph: Graph;

    beforeEach(() => {
        graph = new Graph(true);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'A');
        graph.addEdge('D', 'C');
    });

    it('Корректно вычисляет out-degree centrality', () => {
        const outCentrality = outDegreeCentrality(graph);
        expect(outCentrality.get('A')).toBe(2);
        expect(outCentrality.get('B')).toBe(1);
        expect(outCentrality.get('C')).toBe(1);
        expect(outCentrality.get('D')).toBe(1);
    });

    it('Корректно вычисляет in-degree centrality', () => {
        const inCentrality = inDegreeCentrality(graph);
        expect(inCentrality.get('A')).toBe(1);
        expect(inCentrality.get('B')).toBe(1);
        expect(inCentrality.get('C')).toBe(3);
        expect(inCentrality.get('D')).toBe(0);
    });
});