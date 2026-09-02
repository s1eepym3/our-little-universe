"use client";

import dynamic from "next/dynamic";

const FloatingParticles = dynamic(
  () => import("./FloatingParticles"),
  { ssr: false }
);

export default FloatingParticles;
