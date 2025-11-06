"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Roadmap = dynamic(
  () => import("./roadmap").then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[70vh]" />,
  }
);
export default function RoadmapLoader() {
  return <Roadmap />;
}
