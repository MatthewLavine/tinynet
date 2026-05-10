import { useState, useMemo } from 'react';
import { Network } from '../nn/Network';

export default function NetworkVisualizer() {
  const architecture = [2, 4, 4, 1];
  
  // Create a stable network instance
  const network = useMemo(() => new Network(architecture), []);
  
  // Interactive inputs
  const [inputs, setInputs] = useState<number[]>([0.8, 0.2]);

  // Run forward propagation
  const { activations } = network.forward(inputs);

  // Layout calculations
  const layerWidth = 800; // Total width for the graph
  const layerHeight = 400; // Total height for the graph
  const xOffset = layerWidth / (architecture.length - 1);

  // Calculate coordinates for all nodes to draw connections easily
  const nodePositions: { x: number; y: number; layerIdx: number; nodeIdx: number; activation: number }[][] = [];
  
  architecture.forEach((layerSize, layerIdx) => {
    const layerPositions = [];
    // Calculate X coordinate based on layer index
    // Keep some padding on left and right
    const paddingX = 40;
    const actualWidth = layerWidth - paddingX * 2;
    const x = paddingX + (layerIdx * (actualWidth / (architecture.length - 1)));
    
    const ySpacing = layerHeight / (layerSize + 1);
    
    for (let i = 0; i < layerSize; i++) {
      const y = (i + 1) * ySpacing;
      layerPositions.push({
        x,
        y,
        layerIdx,
        nodeIdx: i,
        activation: activations[layerIdx][i]
      });
    }
    nodePositions.push(layerPositions);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '24px', padding: '16px' }}>
      <h2 style={{ color: 'var(--accent-primary)', marginBottom: '-8px' }}>Forward Propagation</h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px' }}>
        Adjust the inputs below. The network instantly performs thousands of multiplications and additions to feed the signal forward to the output.
      </p>

      {/* Input Controls */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
        {inputs.map((val, idx) => (
          <div key={`input-ctrl-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Input {idx + 1}</span>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={val} 
              onChange={(e) => {
                const newInputs = [...inputs];
                newInputs[idx] = parseFloat(e.target.value);
                setInputs(newInputs);
              }}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span style={{ fontSize: '12px' }}>{val.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Network Graph */}
      <div style={{ position: 'relative', width: `${layerWidth}px`, height: `${layerHeight}px`, background: 'rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Draw connections (lines) first so they are behind nodes */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {network.layers.map((layer, lIdx) => {
            const currentLayerIdx = lIdx + 1;
            const prevLayerIdx = lIdx;
            
            return layer.neurons.map((neuron, nIdx) => {
              const targetNode = nodePositions[currentLayerIdx][nIdx];
              
              return neuron.weights.map((weight, wIdx) => {
                const sourceNode = nodePositions[prevLayerIdx][wIdx];
                
                // Color based on weight sign
                const color = weight > 0 ? "var(--accent-primary)" : "var(--accent-secondary)";
                // Opacity based on how strong the weight is
                const opacity = Math.min(1, Math.abs(weight) * 0.5 + 0.1);
                // Highlight line if signal is flowing through it (source activation * weight is large)
                const signalStrength = Math.abs(sourceNode.activation * weight);
                const strokeWidth = 1 + signalStrength * 3;

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
            
            return (
              <div 
                key={`node-${node.layerIdx}-${node.nodeIdx}`}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: `rgba(${baseColor}, ${Math.max(0.1, node.activation)})`,
                  border: `2px solid rgba(${baseColor}, 0.8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 'bold', color: node.activation > 0.5 ? '#000' : '#fff',
                  boxShadow: `0 0 ${node.activation * 15}px rgba(${baseColor}, ${node.activation})`,
                  zIndex: 10
                }}
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
