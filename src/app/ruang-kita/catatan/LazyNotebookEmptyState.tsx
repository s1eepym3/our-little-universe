"use client";

import dynamic from "next/dynamic";

const AnimatedNotebookEmptyState = dynamic(
  () => import("./AnimatedNotebookEmptyState"),
  { ssr: false }
);

export default AnimatedNotebookEmptyState;
