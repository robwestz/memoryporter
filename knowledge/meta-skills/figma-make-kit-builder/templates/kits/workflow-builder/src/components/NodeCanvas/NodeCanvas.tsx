import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { NodeTypeRegistry, ValidationMode } from "../types";
import { canvasStore } from "../../lib/canvasStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NodeCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  nodeTypes: NodeTypeRegistry;
  validation?: ValidationMode;
  snapToGrid?: number;
}

// ── Edge validation ───────────────────────────────────────────────────────────

function isConnectionValid(
  connection: Connection,
  nodes: Node[],
  registry: NodeTypeRegistry,
  validation: ValidationMode
): boolean {
  if (validation === "off") return true;

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);
  if (!sourceNode || !targetNode) return false;

  const sourceDef = registry[sourceNode.type ?? ""];
  const targetDef = registry[targetNode.type ?? ""];
  if (!sourceDef || !targetDef) return true; // unknown node type — allow

  const sourcePort = sourceDef.outputs.find(
    (p) => p.id === connection.sourceHandle
  );
  const targetPort = targetDef.inputs.find(
    (p) => p.id === connection.targetHandle
  );

  if (!sourcePort || !targetPort) return true; // handle IDs not matched — allow
  if (sourcePort.kind === "any" || targetPort.kind === "any") return true;
  return sourcePort.kind === targetPort.kind;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NodeCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  validation = "on-edit",
  snapToGrid = 16,
}: NodeCanvasProps) {
  const selectedNodeId = canvasStore.use((s) => s.selectedNodeId);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(applyNodeChanges(changes, nodes) as Node[]);

      // Sync selection to store
      const selChange = changes.find((c) => c.type === "select");
      if (selChange && selChange.type === "select") {
        canvasStore.setState({
          selectedNodeId: selChange.selected ? selChange.id : null,
        });
      }
    },
    [nodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(applyEdgeChanges(changes, edges) as Edge[]);
    },
    [edges, onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isConnectionValid(connection, nodes, nodeTypes, validation)) {
        return; // reject incompatible type connections
      }
      onEdgesChange(addEdge(connection, edges) as Edge[]);
    },
    [nodes, edges, nodeTypes, validation, onEdgesChange]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--color-surface-base)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        snapToGrid={snapToGrid > 0}
        snapGrid={[snapToGrid, snapToGrid]}
        fitView
        deleteKeyCode="Delete"
        style={{ background: "var(--color-surface-sunken)" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={snapToGrid}
          color="var(--color-border-subtle)"
        />
        <Controls
          style={{
            background: "var(--color-surface-raised)",
            border: `1px solid var(--color-border-subtle)`,
            borderRadius: "var(--radius-md)",
          }}
        />
        <MiniMap
          style={{
            background: "var(--color-surface-raised)",
            border: `1px solid var(--color-border-subtle)`,
          }}
          nodeColor="var(--color-accent-subtle)"
          maskColor="rgba(0,0,0,0.06)"
        />
      </ReactFlow>

      {/* Selection feedback strip */}
      {selectedNodeId && (
        <div
          style={{
            position: "absolute",
            bottom: "var(--space-8)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-surface-inverted)",
            color: "var(--color-text-inverted)",
            fontSize: "var(--text-xs)",
            padding: `var(--space-4) var(--space-8)`,
            borderRadius: "var(--radius-pill)",
            pointerEvents: "none",
            zIndex: "var(--z-tooltip)",
          }}
        >
          Node selected: {selectedNodeId}
        </div>
      )}
    </div>
  );
}
