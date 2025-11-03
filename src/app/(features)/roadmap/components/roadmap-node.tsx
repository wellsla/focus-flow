import React from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { RoadmapNodeStatus } from "@/lib/types";
import { RawNodeDatum } from "react-d3-tree";

const statusColors: Record<RoadmapNodeStatus, string> = {
  todo: "#808080", // Gray for 'To Do'
  in_progress: "#FBBF24", // Amber-400 for 'In Progress' (Yellow)
  done: "hsl(var(--primary))", // Primary color for 'Done'
  skipped: "#D1D5DB", // Gray-300 for 'Skipped' (Light Gray)
  parallel: "#EF4444", // Red-500 for 'Parallel'
};

interface RoadmapNodeProps {
  nodeDatum: RawNodeDatum;
  onNodeClick: (node: RawNodeDatum) => void;
  onAdd: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RoadmapNodeComponent = ({
  nodeDatum,
  onNodeClick,
  onAdd,
  onEdit,
  onDelete,
}: RoadmapNodeProps) => (
  <g>
    <circle
      r={12}
      fill={statusColors[nodeDatum.attributes?.status as RoadmapNodeStatus]}
      onClick={() => onNodeClick(nodeDatum)}
      className="cursor-pointer hover:opacity-80"
    />
    <text
      fill="black"
      strokeWidth="0"
      x="0"
      y="-20"
      textAnchor="middle"
      onClick={() => onNodeClick(nodeDatum)}
      className="cursor-pointer"
    >
      {nodeDatum.name}
    </text>
    <g
      transform="translate(20, 0)"
      onClick={() => onAdd(nodeDatum.attributes?.id as string)}
      className="cursor-pointer"
    >
      <rect width="24" height="24" rx="4" fill="transparent" />
      <PlusCircle className="text-green-500 h-4 w-4" />
    </g>
    <g
      transform="translate(50, 0)"
      onClick={() => onEdit(nodeDatum.attributes?.id as string)}
      className="cursor-pointer"
    >
      <rect width="24" height="24" rx="4" fill="transparent" />
      <Edit className="text-blue-500 h-4 w-4" />
    </g>
    <g
      transform="translate(80, 0)"
      onClick={() => onDelete(nodeDatum.attributes?.id as string)}
      className="cursor-pointer"
    >
      <rect width="24" height="24" rx="4" fill="transparent" />
      <Trash2 className="text-red-500 h-4 w-4" />
    </g>
  </g>
);
