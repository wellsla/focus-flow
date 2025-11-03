"use client";
import { useState } from "react";
import Tree, {
  CustomNodeElementProps,
  RawNodeDatum,
  PathFunctionOption,
} from "react-d3-tree";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import useLocalStorage from "@/hooks/use-local-storage";
import { RoadmapNode, RoadmapNodeStatus, Task, TaskStatus } from "@/lib/types";
import { roadmap as initialRoadmap } from "@/lib/data";
import { RoadmapNodeForm } from "./roadmap-node-form";
import { RoadmapNodeComponent } from "./roadmap-node";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { tasks as initialTasks } from "@/lib/data";

const findNode = (node: RoadmapNode, id: string): RoadmapNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

const addNode = (
  root: RoadmapNode,
  parentId: string,
  newNode: RoadmapNode
): RoadmapNode => {
  if (root.id === parentId) {
    return { ...root, children: [...root.children, newNode] };
  }
  return {
    ...root,
    children: root.children.map((child) => addNode(child, parentId, newNode)),
  };
};

const updateNode = (
  root: RoadmapNode,
  updatedNode: RoadmapNode
): RoadmapNode => {
  if (root.id === updatedNode.id) {
    return { ...root, name: updatedNode.name, status: updatedNode.status };
  }
  return {
    ...root,
    children: root.children.map((child) => updateNode(child, updatedNode)),
  };
};

const deleteNode = (root: RoadmapNode, id: string): RoadmapNode => {
  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== id)
      .map((child) => deleteNode(child, id)),
  };
};

const roadmapStatusToTaskStatus: Record<RoadmapNodeStatus, TaskStatus> = {
  todo: "todo",
  in_progress: "in-progress",
  done: "done",
  skipped: "skipped",
  parallel: "in-progress",
};

function findAndReplaceNode(
  root: RoadmapNode,
  updatedNode: RoadmapNode
): RoadmapNode {
  if (root.id === updatedNode.id) {
    return updatedNode;
  }
  return {
    ...root,
    children: root.children.map((child) =>
      findAndReplaceNode(child, updatedNode)
    ),
  };
}

function findNodeByTaskTitle(
  root: RoadmapNode,
  taskTitle: string
): RoadmapNode | null {
  const nodeName = taskTitle.replace("Study: ", "");
  function find(node: RoadmapNode): RoadmapNode | null {
    if (node.name === nodeName) return node;
    for (const child of node.children) {
      const found = find(child);
      if (found) return found;
    }
    return null;
  }
  return find(root);
}

// Defining the path function outside the component to prevent re-creation on each render.
const getPathFunc = (): PathFunctionOption => {
  return "diagonal";
};

export default function Roadmap() {
  const [roadmapData, setRoadmapData, loading] = useLocalStorage<RoadmapNode>(
    "roadmap",
    initialRoadmap
  );
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<{
    parentId: string;
    node: RoadmapNode | null;
  } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  function handleNodeClick(node: RawNodeDatum) {
    const nodeName = node.name;
    const taskTitle = `Study: ${nodeName}`;
    const existingTask = tasks.find((t) => t.title === taskTitle);

    if (existingTask) {
      router.push(`/routine?taskId=${existingTask.id}`);
    } else {
      const encodedTitle = encodeURIComponent(taskTitle);
      router.push(`/routine?prefillTask=${encodedTitle}&isRoadmapTask=true`);
    }
  }

  function handleAdd(parentId: string) {
    setEditingNode({ parentId, node: null });
    setIsFormOpen(true);
  }

  function handleEdit(nodeId: string) {
    const nodeToEdit = findNode(roadmapData, nodeId);
    if (nodeToEdit) {
      setEditingNode({ parentId: "", node: nodeToEdit });
      setIsFormOpen(true);
    }
  }

  function handleDelete(nodeId: string) {
    if (nodeId === "root") {
      toast({ title: "Cannot delete root node", variant: "destructive" });
      return;
    }
    setRoadmapData((prevData) => deleteNode(prevData, nodeId));
    toast({
      title: "Node Deleted",
      description: "The roadmap node has been removed.",
    });
  }

  function handleFormSubmit(values: {
    name: string;
    status: RoadmapNodeStatus;
  }) {
    if (editingNode?.node) {
      // Editing existing node
      const oldNode = editingNode.node;
      const updated: RoadmapNode = { ...editingNode.node, ...values };
      setRoadmapData((prevData) => updateNode(prevData, updated));

      // Sync with tasks
      const oldTaskTitle = `Study: ${oldNode.name}`;
      const newTaskTitle = `Study: ${updated.name}`;
      const taskStatus = roadmapStatusToTaskStatus[updated.status];

      setTasks((prevTasks) => {
        const taskIndex = prevTasks.findIndex((t) => t.title === oldTaskTitle);
        if (taskIndex > -1) {
          const newTasks = [...prevTasks];
          newTasks[taskIndex] = {
            ...newTasks[taskIndex],
            title: newTaskTitle,
            status: taskStatus,
          };
          return newTasks;
        }
        return prevTasks;
      });

      toast({
        title: "Node Updated",
        description: "Roadmap node has been successfully updated.",
      });
    } else if (editingNode) {
      // Adding new node
      const newNode: RoadmapNode = {
        id: new Date().toISOString(),
        name: values.name,
        status: values.status,
        children: [],
      };
      setRoadmapData((prevData) =>
        addNode(prevData, editingNode.parentId, newNode)
      );
      toast({
        title: "Node Added",
        description: "New roadmap node has been successfully added.",
      });
    }
  }

  function convertToD3(node: RoadmapNode): RawNodeDatum {
    return {
      name: node.name,
      attributes: {
        id: node.id,
        status: node.status,
      },
      children: node.children.map(convertToD3),
    };
  }
  const d3Data = convertToD3(roadmapData);

  const renderCustomNodeElement = (rd3tProps: CustomNodeElementProps) => {
    return (
      <RoadmapNodeComponent
        nodeDatum={rd3tProps.nodeDatum}
        onNodeClick={handleNodeClick}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  const nodeSize = { x: 200, y: 300 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <Skeleton className="w-full h-[70vh]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Your Learning Roadmap
          </h1>
          <p className="text-muted-foreground">
            Visualize your study plan, track progress, and create tasks.
          </p>
        </div>
        <Button onClick={() => handleAdd(roadmapData.id)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Main Branch
        </Button>
      </div>

      <Card className="w-full h-[70vh] bg-card">
        <Tree
          data={d3Data}
          orientation="horizontal"
          pathFunc={getPathFunc()}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          translate={{ x: 100, y: 300 }}
          nodeSize={nodeSize}
          renderCustomNodeElement={renderCustomNodeElement}
        />
      </Card>

      <FormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        title={editingNode?.node ? "Edit Node" : "Add New Node"}
        description={
          editingNode?.node
            ? "Update the details of your roadmap node."
            : "Add a new node to your learning path."
        }
        triggerButton={null}
        onCloseAutoFocus={() => setEditingNode(null)}
      >
        <RoadmapNodeForm
          node={editingNode?.node ?? undefined}
          onSubmit={handleFormSubmit}
        />
      </FormDialog>
    </div>
  );
}
