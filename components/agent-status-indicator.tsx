"use client";

import { PulsingBorder } from "@paper-design/shaders-react";

interface AgentStatusIndicatorProps {
  isLoading: boolean;
  style?: React.CSSProperties;
}

export function AgentStatusIndicator({ isLoading, style }: AgentStatusIndicatorProps) {
  const colors = isLoading
    ? ["#FF0000", "#FFA500", "#FFFF00", "#00FF00"]
    : ["#5800FF", "#BEECFF", "#E77EDC", "#FF4C3E"];

  const speed = isLoading ? 3 : 1.5;
  const pulse = isLoading ? 0.5 : 0.2;

  const width = style?.width || '100%';
  const height = style?.height || '100%';

  return (
    <div style={style}>
      <PulsingBorder
        colors={colors}
        colorBack="#00000000"
        speed={speed}
        roundness={1}
        thickness={0.05}
        softness={0.1}
        intensity={1}

        spotSize={0.1}
        pulse={pulse}
        smoke={0.5}
        smokeSize={2}
        scale={0.65}
        rotation={0}
        frame={9161408.251009725}
        width={width}
        height={height}
      />
    </div>
  );
}