// tests/metrics/efficiency.spec.ts

import { Graph } from '../../src/graph';
import { globalEfficiency, localEfficiency } from '../../src/metrics/efficiency';

describe('Global & Local Efficiency', () => {
    it('сравнение цепочки и звезды эквивалентного размера', () => {
        // 1) цепочка 4 узла: 0–1–2–3
        const chain = new Graph(false);
        ['0','1','2','3'].forEach((u,i,a) => {
            if (i<3) chain.addEdge(u, a[i+1]);
        });
        // 2) звезда: центр 0 к 1,2,3
        const star = new Graph(false);
        ['1','2','3'].forEach(l => star.addEdge('0', l));

        const Echain = globalEfficiency(chain);
        const Estar  = globalEfficiency(star);
        // В звезде средний обратный путь короче → эффективность выше
        expect(Estar).toBeGreaterThan(Echain);
    });

    it('глобальная эффективность маленькой сети совпадает с аналитической', () => {
        // треугольник A–B–C
        const g = new Graph(false);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','A');
        // Для треугольника все расстояния=1 между парами, пар 3*2=6 направленных
        // Σ 1/d = 6*1 = 6, n(n-1)=3*2=6 => E=1
        expect(globalEfficiency(g)).toBeCloseTo(1, 6);
    });

    it('локальная эффективность на графе со звездами и треугольниками', () => {
        // Узел C: треугольник A–B–C + веер C–D,E
        const g = new Graph(false);
        g.addEdge('A','B');
        g.addEdge('B','C');
        g.addEdge('C','A');
        g.addEdge('C','D');
        g.addEdge('C','E');

        const Eloc = localEfficiency(g);
        // У C deg=4, локальный подграф соседей = {A,B,D,E}
        // в нём ребро A–B, а D,E изолированы → globalEfficiency(sub)=?
        // пары в sub: 4*3=12 направленных, только A–B и B–A → 2 путей длины1
        // Σ 1/d = 2, n(n-1)=12 ⇒ Eloc(C)=2/12=1/6
        expect(Eloc.get('C')).toBeCloseTo(1/6, 6);
        // Узел D: deg=1 ⇒ Eloc(D)=0
        expect(Eloc.get('D')).toBe(0);
        // Узел A: deg=2, соседи B,C образуют ребро ⇒ подграф это просто одно ребро,
        // globalEfficiency = Σ1/d over 2*1=2 направленных =2*1/1=2 ⇒ 2/2=1
        expect(Eloc.get('A')).toBeCloseTo(1, 6);
    });
});
