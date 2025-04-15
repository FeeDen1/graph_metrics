export type NodeId = string | number;

export interface Edge {
    source: NodeId;
    target: NodeId;
    weight?: number; // Вес ребра, по умолчанию 1, если не указан
}

export class Graph {
    public nodes: Set<NodeId>;
    public adjList: Map<NodeId, Array<{ neighbor: NodeId; weight: number }>>;
    public directed: boolean;

    constructor(directed: boolean = false) {
        this.nodes = new Set();
        this.adjList = new Map();
        this.directed = directed;
    }

    // Добавление нового узла (если ещё не существует)
    addNode(node: NodeId): void {
        if (!this.nodes.has(node)) {
            this.nodes.add(node);
            this.adjList.set(node, []);
        }
    }

    // Добавление ребра между узлами, с опциональным весом
    addEdge(source: NodeId, target: NodeId, weight: number = 1): void {
        this.addNode(source);
        this.addNode(target);
        this.adjList.get(source)?.push({ neighbor: target, weight });
        if (!this.directed) {
            this.adjList.get(target)?.push({ neighbor: source, weight });
        }
    }
}