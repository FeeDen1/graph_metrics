// tests/metrics/eccentricity.spec.ts

import { Graph } from '../../src/graph';
import { eccentricity, radius, diameter } from '../../src/metrics/eccentricity';

describe('Eccentricity / Radius / Diameter', () => {
    it('цепочка из 5 узлов: эксцентриситеты [4,3,2,3,4], radius=2, diameter=4', () => {
        // 0–1–2–3–4
        const g = new Graph(false);
        for (let i = 0; i < 4; i++) g.addEdge(`${i}`, `${i+1}`);

        const ecc = eccentricity(g);
        expect(ecc.get('0')).toBe(4);
        expect(ecc.get('1')).toBe(3);
        expect(ecc.get('2')).toBe(2);
        expect(ecc.get('3')).toBe(3);
        expect(ecc.get('4')).toBe(4);

        expect(radius(g)).toBe(2);
        expect(diameter(g)).toBe(4);
    });

    it('звезда: центр 0 с листьями 1..n: ecc(0)=1, ecc(leaf)=2, radius=1, diameter=2', () => {
        const n = 6;
        const g = new Graph(false);
        for (let i = 1; i <= n; i++) g.addEdge('0', `${i}`);

        const ecc = eccentricity(g);
        expect(ecc.get('0')).toBe(1);
        for (let i = 1; i <= n; i++) {
            expect(ecc.get(`${i}`)).toBe(2);
        }
        expect(radius(g)).toBe(1);
        expect(diameter(g)).toBe(2);
    });

    it('ориентированный цикл: все эксцентриситеты равны n-1, radius=diameter=n-1', () => {
        const n = 5;
        const g = new Graph(true);
        for (let i = 0; i < n; i++) {
            g.addEdge(`${i}`, `${(i+1)%n}`);
        }

        const ecc = eccentricity(g);
        for (let i = 0; i < n; i++) {
            expect(ecc.get(`${i}`)).toBe(n-1);
        }
        expect(radius(g)).toBe(n-1);
        expect(diameter(g)).toBe(n-1);
    });

    it('несвязный граф даёт бесконечность для недостижимых', () => {
        const g = new Graph(false);
        g.addEdge('A','B');
        g.addEdge('C','D');
        const ecc = eccentricity(g);
        // внутри компоненты A–B: ecc=1
        expect(ecc.get('A')).toBe(1);
        expect(ecc.get('B')).toBe(1);
        // для C,D к A,B недостижимы => ecc = Infinity
        expect(ecc.get('C')).toBe(Infinity);
        expect(ecc.get('D')).toBe(Infinity);
        // radius = Infinity, diameter = Infinity
        expect(radius(g)).toBe(Infinity);
        expect(diameter(g)).toBe(Infinity);
    });
});
