// tests/metrics/edgeBetweenness.spec.ts

import { Graph } from '../../src/graph';
import { edgeBetweennessCentrality } from '../../src/metrics/edgeBetweenness';

describe('Edge Betweenness Centrality – два кольца, соединённые мостом', () => {
    it('симметричные рёбра в каждом треугольнике и мост C–D максимален', () => {
        const g = new Graph(false);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','A');
        // треугольник D–E–F
        g.addEdge('D','E');
        g.addEdge('E','F');
        g.addEdge('F','D');
        // мост между C и D
        g.addEdge('C','D');

        const ebc = edgeBetweennessCentrality(g);

        const maxEdge = Array.from(ebc.entries())
            .reduce(([me, mv], [e, v]) => v > mv ? [e,v] : [me,mv], ['', -Infinity])[0];
        expect(maxEdge).toBe('C->D');

        const bc = ebc.get('B->C')!;
        const ca = ebc.get('C->A')!;
        expect(bc).toBeCloseTo(ca, 6);
        expect(ebc.get('A->B')!).toBeLessThan(bc);

        const de = ebc.get('D->E')!;
        const fd = ebc.get('F->D')!;
        expect(de).toBeCloseTo(fd, 6);
        expect(ebc.get('E->F')!).toBeLessThan(de);
    });


    it('звезда с ответвлениями', () => {
        // Звезда: центр X, листья A,B,C; к каждому листу добавим по ответвлению
        // X-A-A1, X-B-B1, X-C-C1
        const g = new Graph(false);
        ['A','B','C'].forEach(l=>{
            g.addEdge('X', l);
            g.addEdge(l, l+'1');
        });

        const ebc = edgeBetweennessCentrality(g);

        const star = ['X->A','X->B','X->C'];
        const vals = star.map(e=>ebc.get(e)!);
        vals.forEach(v=> expect(v).toBeCloseTo(vals[0],5));

        const leaves = ['A->A1','B->B1','C->C1'];
        const vals2 = leaves.map(e=>ebc.get(e)!);
        vals2.forEach(v=> expect(v).toBeCloseTo(vals2[0],5));

        // Значения на X->Ai выше, чем Ai->Ai1
        for(let i=0;i<3;i++){
            expect(vals[i]).toBeGreaterThan(vals2[i]);
        }
    });

    it('большой тест с точными значениями на 10×11+диагонали', () => {
        const rows = 10, cols = 11;
        const g = new Graph(false);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const u = `${i}${j}`;
                if (j + 1 < cols) g.addEdge(u, `${i}${j + 1}`);
                if (i + 1 < rows) g.addEdge(u, `${i + 1}${j}`);
            }
        }
        g.addEdge('00', '22');

        const ebc = edgeBetweennessCentrality(g);

        expect(ebc.get('44->45')).toBeCloseTo(413.34609515871136, 4);
        expect(ebc.get('45->44')).toBeCloseTo(413.34609515871136, 4);

        expect(ebc.get('45->46')).toBeCloseTo(412.1389565542815, 4);
        expect(ebc.get('46->45')).toBeCloseTo(412.1389565542815, 4);

        expect(ebc.get('00->22')).toBeCloseTo(233.0, 6);
        expect(ebc.get('22->00')).toBeCloseTo(233.0, 6);

        expect(ebc.get('00->01')).toBeCloseTo(87.04683850721003, 4);
        expect(ebc.get('01->00')).toBeCloseTo(87.04683850721003, 4);
    });

});
