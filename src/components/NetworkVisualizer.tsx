import { useState, useMemo, useEffect } from 'react';
import { Network } from '../nn/Network';
import { meanSquaredError } from '../nn/Loss';

interface Props {
  step: number;
  onLossChange?: (loss: number) => void;
}

export default function NetworkVisualizer({ step, onLossChange }: Props) {
  const architecture = [2, 4, 4, 1];
  
  const network = useMemo(() => new Network(architecture), []);
  const [inputs, setInputs] = useState<number[]>([0.8, 0.2]);
  
  // New: Target for step 4
  const [target, setTarget] = useState<number>(1.0);

  const { activations } = network.forward(inputs);
  
  // Output is the activation of the last node in the last layer
  const outputLayer = activations[activations.length - 1];
  const output = outputLayer[0];
  
  const loss = meanSquaredError([output], [target]);

  // Report loss to parent whenever it changes
  useEffect(() => {
    if (onLossChange) {
      onLossChange(loss);
    }
  }, [loss, onLossChange]);

  const layerWidth = 800; 
  const layerHeight = 400; 

  const nodePositions: { x: number; y: number; layerIdx: number; nodeIdx: number; activation: number }[][] = [];
  
  architecture.forEach((layerSize, layerIdx) => {
    const layerPositions = [];
    const paddingX = 40;
    // Shrink width slightly if step >= 4 to make room for target node
    const effectiveWidth = step >= 4 ? layerWidth - 120 : layerWidth;
    const actualWidth = effectiveWidth - paddingX * 2;
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
      <h2 style={{ color: step >= 4 ? '#ff4444' : 'var(--accent-primary)', marginBottom: '-8px', transition: 'color 0.3s ease' }}>
        {step === 3 ? "Forward Propagation" : "The Loss Function (Error)"}
      </h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px', minHeight: '40px' }}>
        {step === 3 
          ? "Adjust the inputs below. The network performs thousands of calculations to feed the signal forward."
          : "Now we introduce a Target. The Loss function measures how far the Network's Output is from the Target using Mean Squared Error."}
      </p>

      {/* Input Controls */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '8px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '24px', background: 'rgba(0,0,0,0.2)', padding: '12px 24px', borderRadius: '12px' }}>
          {inputs.map((val, idx) => (
            <div key={`input-ctrl-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>Input {idx + 1}</span>
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
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{val.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {step >= 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,0,0,0.1)', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.3)' }}>
            <span style={{ fontSize: '12px', color: '#ff4444' }}>Target (Desired Output)</span>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={target} 
              onChange={(e) => setTarget(parseFloat(e.target.value))}
              style={{ accentColor: '#ff4444' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff4444' }}>{target.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Network Graph */}
      <div style={{ position: 'relative', width: `${layerWidth}px`, height: `${layerHeight}px`, background: 'rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Draw connections */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {network.layers.map((layer, lIdx) => {
            const currentLayerIdx = lIdx + 1;
            const prevLayerIdx = lIdx;
            
            return layer.neurons.map((neuron, nIdx) => {
              const targetNode = nodePositions[currentLayerIdx][nIdx];
              
              return neuron.weights.map((weight, wIdx) => {
                const sourceNode = nodePositions[prevLayerIdx][wIdx];
                const color = weight > 0 ? "var(--accent-primary)" : "var(--accent-secondary)";
                const opacity = Math.min(1, Math.abs(weight) * 0.5 + 0.1);
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
          
          {/* Step 4: Draw line from output to target for comparison */}
          {step >= 4 && (
             <line 
               x1={nodePositions[architecture.length - 1][0].x + 18} 
               y1={nodePositions[architecture.length - 1][0].y}
               x2={layerWidth - 60} 
               y2={layerHeight / 2}
               stroke="#ff4444"
               strokeWidth="2"
               strokeDasharray="4 4"
               opacity="0.8"
             />
          )}
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
                  position: 'absolute', left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `rgba(${baseColor}, ${Math.max(0.1, node.activation)})`,
                  border: `2px solid rgba(${baseColor}, 0.8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 'bold', color: node.activation > 0.5 ? '#000' : '#fff',
                  boxShadow: `0 0 ${node.activation * 15}px rgba(${baseColor}, ${node.activation})`,
                  zIndex: 10
                }}
              >
                {node.activation.toFixed(2)}
              </div>
            );
          })
        ))}

        {/* Step 4: Target Node and Loss Text */}
        {step >= 4 && (
          <>
            <div style={{
              position: 'absolute', left: `${layerWidth - 60}px`, top: `${layerHeight / 2}px`, transform: 'translate(-50%, -50%)',
              width: '44px', height: '44px', borderRadius: '8px',
              background: `rgba(255, 68, 68, ${target})`,
              border: `2px solid rgba(255, 68, 68, 1)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 ${target * 20}px rgba(255, 68, 68, 0.6)`,
              zIndex: 10
            }}>
              <span style={{ fontSize: '8px', color: '#fff', opacity: 0.8 }}>TRGT</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{target.toFixed(2)}</span>
            </div>
            
            <div style={{
              position: 'absolute', left: `${layerWidth - 120}px`, top: `${layerHeight / 2 - 40}px`,
              background: 'rgba(255,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ff4444',
              color: '#ff4444', fontSize: '12px', fontWeight: 'bold'
            }}>
              Loss: {loss.toFixed(4)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
