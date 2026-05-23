import { useMemo } from 'react';
import { Network } from '../nn/Network';

interface Props {
  network: Network;
  inputs?: number[];
  width?: number;
  height?: number;
}

export default function NetworkGraph({ network, inputs = [0.5, 0.5], width = 400, height = 280 }: Props) {
  const { architecture } = network;

  // Run forward pass to get current activations for the nodes
  const { activations } = useMemo(() => {
    try {
      return network.forward(inputs);
    } catch (e) {
      // Fallback in case inputs length doesn't match
      const fallbackInputs = new Array(architecture[0]).fill(0.5);
      return network.forward(fallbackInputs);
    }
  }, [network, inputs, architecture]);

  const nodePositions: { x: number; y: number; layerIdx: number; nodeIdx: number; activation: number }[][] = [];

  const paddingX = 40;
  const paddingY = 20;
  const graphWidth = width;
  const graphHeight = height;

  architecture.forEach((layerSize, layerIdx) => {
    const layerPositions = [];
    const actualWidth = graphWidth - paddingX * 2;
    // Prevent division by zero if architecture has only 1 layer (should not happen)
    const x = architecture.length > 1 
      ? paddingX + (layerIdx * (actualWidth / (architecture.length - 1)))
      : graphWidth / 2;
    
    const ySpacing = (graphHeight - paddingY * 2) / (layerSize + 1);

    for (let i = 0; i < layerSize; i++) {
      const y = paddingY + (i + 1) * ySpacing;
      layerPositions.push({
        x,
        y,
        layerIdx,
        nodeIdx: i,
        activation: activations[layerIdx]?.[i] ?? 0,
      });
    }
    nodePositions.push(layerPositions);
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      gap: '8px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '12px',
      boxSizing: 'border-box',
      marginTop: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 4px', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          Network Weights & Activations (Input: {inputs.map(v => v.toFixed(2)).join(', ')})
        </span>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
          Blue = pos weight, Purple = neg weight | Brightness = activation
        </span>
      </div>

      <div style={{ 
        position: 'relative', 
        width: `${graphWidth}px`, 
        height: `${graphHeight}px`, 
        background: 'rgba(0,0,0,0.15)', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Draw connections */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {network.layers.map((layer, lIdx) => {
            const currentLayerIdx = lIdx + 1;
            const prevLayerIdx = lIdx;
            
            return layer.neurons.map((neuron, nIdx) => {
              const targetNode = nodePositions[currentLayerIdx]?.[nIdx];
              if (!targetNode) return null;
              
              return neuron.weights.map((weight, wIdx) => {
                const sourceNode = nodePositions[prevLayerIdx]?.[wIdx];
                if (!sourceNode) return null;

                const color = weight > 0 ? "var(--accent-primary)" : "var(--accent-secondary)";
                // Scale opacity and width based on weight magnitude
                const opacity = Math.min(0.8, Math.abs(weight) * 0.35 + 0.1);
                const strokeWidth = 1 + Math.abs(weight) * 1.5;

                return (
                  <line 
                    key={`line-${lIdx}-${nIdx}-${wIdx}`}
                    x1={sourceNode.x} y1={sourceNode.y}
                    x2={targetNode.x} y2={targetNode.y}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />
                );
              });
            });
          })}
        </svg>

        {/* Draw Nodes */}
        {nodePositions.map((layer, lIdx) => (
          layer.map((node) => {
            const isInput = lIdx === 0;
            const isOutput = lIdx === architecture.length - 1;
            const baseColor = isInput ? '0, 240, 255' : (isOutput ? '189, 0, 255' : '255, 255, 255');
            
            // Adjust size depending on layer sizes to fit 8 nodes comfortably in 280px height
            const maxLayerSize = Math.max(...architecture);
            const nodeSize = maxLayerSize > 6 ? 18 : 24;
            const fontSize = maxLayerSize > 6 ? '7px' : '9px';

            return (
              <div 
                key={`node-${node.layerIdx}-${node.nodeIdx}`}
                style={{
                  position: 'absolute', 
                  left: `${node.x}px`, 
                  top: `${node.y}px`, 
                  transform: 'translate(-50%, -50%)',
                  width: `${nodeSize}px`, 
                  height: `${nodeSize}px`, 
                  borderRadius: '50%',
                  background: `rgba(${baseColor}, ${Math.max(0.1, node.activation)})`,
                  border: `1px solid rgba(${baseColor}, 0.8)`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: fontSize, 
                  fontWeight: 'bold', 
                  color: node.activation > 0.5 ? '#000' : '#fff',
                  boxShadow: `0 0 ${node.activation * 8}px rgba(${baseColor}, ${node.activation})`,
                  zIndex: 10
                }}
                title={`Activation: ${node.activation.toFixed(4)}`}
              >
                {node.activation.toFixed(1)}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
