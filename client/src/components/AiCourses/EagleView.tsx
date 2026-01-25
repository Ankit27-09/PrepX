import { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    type Node,
    type Edge,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { AiCourse } from './api';
import { BookOpen, Gamepad2, GraduationCap, Layers, FileText } from 'lucide-react';

interface EagleViewProps {
    course: AiCourse;
    onNodeClick: (nodeId: string, nodeType: string) => void;
}

// Node colors matching reference design
const NODE_COLORS = {
    course: { bg: '#8B5CF6', text: '#fff', border: '#7C3AED' },      // Purple Root
    section: { bg: '#3B82F6', text: '#fff', border: '#2563EB' },     // Blue Section
    article: { bg: '#10B981', text: '#fff', border: '#059669' },     // Green Article
    studyMaterial: { bg: '#F59E0B', text: '#fff', border: '#D97706' }, // Amber Study
    quiz: { bg: '#EF4444', text: '#fff', border: '#DC2626' },        // Red Quiz
};

// Custom node component with Handles
const CustomNode = ({ data }: { data: any }) => {
    const colors = NODE_COLORS[data.nodeType as keyof typeof NODE_COLORS] || NODE_COLORS.section;
    const Icon = data.icon;

    return (
        <div
            className="px-4 py-3 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border-2 flex items-center gap-2 relative group"
            style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                minWidth: data.nodeType === 'course' ? 180 : 140,
                color: 'white',
            }}
        >
            {/* Invisible Handles for connections from all sides */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
            <Handle type="target" position={Position.Left} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
            <Handle type="target" position={Position.Right} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
            <Handle type="target" position={Position.Bottom} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />

            <Handle type="source" position={Position.Top} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
            <Handle type="source" position={Position.Left} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
            <Handle type="source" position={Position.Right} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full absolute inset-0 !bg-transparent border-0" />

            {Icon && <Icon className="w-5 h-5" />}

            <div className="flex flex-col text-left">
                <div className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">
                    {data.nodeType}
                </div>
                <div className="text-sm font-bold leading-tight line-clamp-2">
                    {data.label}
                </div>
            </div>
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

export function EagleView({ course, onNodeClick }: EagleViewProps) {
    // Generate graph data from course
    const { initialNodes, initialEdges, stats } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Center position for course node
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2 - 50;
        const sectionRadius = 300;
        const contentRadius = 180; // Distance from section node

        // Course node (center)
        nodes.push({
            id: 'course',
            type: 'custom',
            position: { x: centerX, y: centerY },
            data: { label: course.title, nodeType: 'course', icon: GraduationCap },
            zIndex: 10,
        });

        const sections = course.sections || [];
        const sectionAngleStep = (2 * Math.PI) / Math.max(sections.length, 1);

        sections.forEach((section, sIndex) => {
            // Distribute sections in a circle
            const angle = sIndex * sectionAngleStep - Math.PI / 2;
            const sx = centerX + Math.cos(angle) * sectionRadius;
            const sy = centerY + Math.sin(angle) * sectionRadius;

            // Section node
            const sectionId = `section-${section.id}`;
            nodes.push({
                id: sectionId,
                type: 'custom',
                position: { x: sx, y: sy },
                data: { label: section.title, nodeType: 'section', sectionId: section.id, icon: BookOpen },
                zIndex: 5,
            });

            // Edge from course to section
            edges.push({
                id: `e-course-${sectionId}`,
                source: 'course',
                target: sectionId,
                type: 'default',
                style: { stroke: '#CBD5E1', strokeWidth: 3 },
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#CBD5E1' },
            });

            // Content nodes around each section
            const contentItems = [
                { id: `article-${section.id}`, label: 'Article', type: 'article', icon: FileText },
                { id: `study-${section.id}`, label: 'Study Material', type: 'studyMaterial', icon: Layers },
                { id: `quiz-${section.id}`, label: 'Quiz', type: 'quiz', icon: Gamepad2 },
            ];

            // Distribute content semi-circularly around the section, facing away from center
            const contentStartAngle = angle - Math.PI / 3;
            const contentAngleStep = (Math.PI / 1.5) / (contentItems.length - 1 || 1);

            contentItems.forEach((item, cIndex) => {
                const contentAngle = contentStartAngle + cIndex * contentAngleStep;
                const cx = sx + Math.cos(contentAngle) * contentRadius;
                const cy = sy + Math.sin(contentAngle) * contentRadius;

                nodes.push({
                    id: item.id,
                    type: 'custom',
                    position: { x: cx, y: cy },
                    data: {
                        label: item.label,
                        nodeType: item.type,
                        sectionId: section.id,
                        icon: item.icon
                    },
                    zIndex: 1,
                });

                // Edge from section to content
                const contentColor = NODE_COLORS[item.type as keyof typeof NODE_COLORS];
                edges.push({
                    id: `e-${sectionId}-${item.id}`,
                    source: sectionId,
                    target: item.id,
                    type: 'smoothstep',
                    style: { stroke: contentColor.bg, strokeWidth: 2, strokeDasharray: '5,5' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: contentColor.bg },
                });
            });
        });

        return {
            initialNodes: nodes,
            initialEdges: edges,
            stats: {
                sections: sections.length,
                nodes: nodes.length,
                connections: edges.length,
            },
        };
    }, [course]);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const nodeData = node.data as any;
        if (nodeData.sectionId) {
            onNodeClick(nodeData.sectionId, nodeData.nodeType);
        }
    }, [onNodeClick]);

    return (
        <div className="w-full h-full bg-[#FAFAFA] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={2}
                className="bg-[#FAFAFA]"
            >
                <Background color="#E2E8F0" gap={24} size={1} />
                <Controls
                    className="bg-white rounded-lg shadow-lg border border-slate-200"
                    showInteractive={false}
                />

                <Panel position="top-left" className="m-4">
                    <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-2xl">🦅</span>
                            Knowledge Graph
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Click any node to navigate • Scroll to zoom
                        </p>
                    </div>
                </Panel>

                <Panel position="bottom-left" className="m-4">
                    <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg border border-slate-200 flex gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{stats.sections}</div>
                            <div className="text-xs text-slate-500">Sections</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{stats.nodes}</div>
                            <div className="text-xs text-slate-500">Nodes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{stats.connections}</div>
                            <div className="text-xs text-slate-500">Connections</div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default EagleView;
