import { useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    type Node,
    type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle } from 'lucide-react';
import type { AiSectionWithContent } from './api';

interface MindMapViewProps {
    section: AiSectionWithContent;
    onMarkUnderstood?: () => void;
}

// Node colors for mind map - hierarchical levels
const LEVEL_COLORS = [
    { bg: '#EF4444', text: '#fff', border: '#DC2626' }, // Level 0 - Red (root)
    { bg: '#14B8A6', text: '#fff', border: '#0D9488' }, // Level 1 - Teal
    { bg: '#06B6D4', text: '#fff', border: '#0891B2' }, // Level 2 - Cyan
    { bg: '#3B82F6', text: '#fff', border: '#2563EB' }, // Level 3 - Blue
];

// Custom node for mind map
const MindMapNode = ({ data }: { data: any }) => {
    const level = data.level || 0;
    const colors = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];

    return (
        <div
            className="px-4 py-2 rounded-lg shadow-md cursor-pointer transition-all hover:scale-105"
            style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: 2,
                borderStyle: 'solid',
                minWidth: level === 0 ? 180 : 120,
                maxWidth: 200,
            }}
        >
            {/* Handles for connections */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />

            <div className="text-center relative z-10">
                <div
                    className="text-sm font-medium leading-tight"
                    style={{ color: colors.text }}
                >
                    {data.label}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
        </div>
    );
};

const nodeTypes = {
    mindmap: MindMapNode,
};

// Parse mind map data from section (can be enhanced with AI-generated data)
function generateMindMapFromSection(section: AiSectionWithContent): { nodes: Node[], edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const centerX = 400;
    const centerY = 250;

    // Generate Tree Layout (Top-Down)
    const LEVEL_HEIGHT = 150;
    const NODE_WIDTH = 220; // Approximate width including gap

    // 1. Root Node
    nodes.push({
        id: 'root',
        type: 'mindmap',
        position: { x: centerX, y: centerY },
        data: { label: section.title, level: 0 },
    });

    // If we have mind map data from the database, use it
    if (section.mindMaps && section.mindMaps.length > 0) {
        try {
            const mindMapData = JSON.parse(section.mindMaps[0].data);
            if (mindMapData.nodes && mindMapData.edges) {
                return { nodes: mindMapData.nodes, edges: mindMapData.edges };
            }
        } catch (e) {
            // Fall back to generated
        }
    }

    // 2. Level 1 Nodes (Article Pages)
    const pages = section.articlePages || [];
    if (pages.length > 0) {
        const totalWidth = pages.length * NODE_WIDTH;
        const startX = centerX - (totalWidth / 2) + (NODE_WIDTH / 2);

        pages.forEach((page, i) => {
            const pageId = `page-${page.id}`;
            const px = startX + (i * NODE_WIDTH);
            const py = centerY + LEVEL_HEIGHT;

            nodes.push({
                id: pageId,
                type: 'mindmap',
                position: { x: px, y: py },
                data: { label: page.pageTitle, level: 1 },
            });

            edges.push({
                id: `e-root-${pageId}`,
                source: 'root',
                target: pageId,
                type: 'smoothstep',
                style: { stroke: LEVEL_COLORS[1].bg, strokeWidth: 2 },
                animated: true,
            });

            // 3. Level 2 Nodes (Flashcards distributed under pages)
            const flashcards = section.flashcards || [];
            // Simple distribution: Assign flashcards to pages round-robin or chunks
            // For visual balance, let's just picking a few cards per page
            const relatedCards = flashcards.filter((_, idx) => idx % pages.length === i).slice(0, 3);

            if (relatedCards.length > 0) {
                const subWidth = relatedCards.length * (NODE_WIDTH * 0.8);
                const subStartX = px - (subWidth / 2) + ((NODE_WIDTH * 0.8) / 2);

                relatedCards.forEach((card, ci) => {
                    const cardId = `card-${card.id}`;
                    const cx = subStartX + (ci * (NODE_WIDTH * 0.8));
                    const cy = py + LEVEL_HEIGHT;

                    nodes.push({
                        id: cardId,
                        type: 'mindmap',
                        position: { x: cx, y: cy },
                        data: {
                            label: card.front.slice(0, 40) + (card.front.length > 40 ? '...' : ''),
                            level: 2
                        },
                    });

                    edges.push({
                        id: `e-${pageId}-${cardId}`,
                        source: pageId,
                        target: cardId,
                        type: 'smoothstep',
                        style: { stroke: LEVEL_COLORS[2].bg, strokeWidth: 2 },
                    });
                });
            }
        });
    }

    // If no content, add placeholder nodes in Tree Layout
    if (nodes.length === 1) {
        const placeholders = [
            { label: 'Read Articles', color: LEVEL_COLORS[1] },
            { label: 'Review Flashcards', color: LEVEL_COLORS[1] },
            { label: 'Take Quiz', color: LEVEL_COLORS[1] },
        ];

        const totalWidth = placeholders.length * NODE_WIDTH;
        const startX = centerX - (totalWidth / 2) + (NODE_WIDTH / 2);

        placeholders.forEach((p, i) => {
            const px = startX + (i * NODE_WIDTH);
            const py = centerY + LEVEL_HEIGHT;
            const pId = `placeholder-${i}`;

            nodes.push({
                id: pId,
                type: 'mindmap',
                position: { x: px, y: py },
                data: { label: p.label, level: 1 },
            });

            edges.push({
                id: `e-root-${pId}`,
                source: 'root',
                target: pId,
                type: 'smoothstep',
                style: { stroke: p.color.bg, strokeWidth: 2, strokeDasharray: '5,5' },
                animated: true,
            });
        });
    }

    return { nodes, edges };
}

export function MindMapView({ section, onMarkUnderstood }: MindMapViewProps) {
    const [isUnderstood, setIsUnderstood] = useState(false);

    const { initialNodes, initialEdges } = useMemo(() => {
        const { nodes, edges } = generateMindMapFromSection(section);
        return { initialNodes: nodes, initialEdges: edges };
    }, [section]);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    const handleUnderstood = useCallback(() => {
        setIsUnderstood(true);
        onMarkUnderstood?.();
    }, [onMarkUnderstood]);

    return (
        <div className="w-full h-[calc(100vh-200px)] bg-[#F9F6EE] relative rounded-xl border border-[#E4D7B4] overflow-hidden">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-medium text-[#335441] border border-[#E4D7B4]">
                    Interactive Mind Map
                </div>
            </div>

            {/* Graph */}
            <div className="w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.5}
                    maxZoom={2}
                    className="bg-[#F9F6EE]"
                >
                    <Background color="#E4D7B4" gap={20} size={1} />
                    <Controls
                        className="bg-white rounded-lg shadow-lg border border-[#E4D7B4]"
                        showInteractive={false}
                    />
                </ReactFlow>
            </div>

            {/* I Understand This button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                <button
                    onClick={handleUnderstood}
                    disabled={isUnderstood}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg transition-all ${isUnderstood
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-gradient-to-r from-[#335441] to-[#46704A] text-white hover:shadow-xl hover:scale-105'
                        }`}
                >
                    <CheckCircle className="w-5 h-5" />
                    {isUnderstood ? 'Great job!' : 'I Understand This!'}
                </button>
            </div>
        </div>
    );
}

export default MindMapView;
