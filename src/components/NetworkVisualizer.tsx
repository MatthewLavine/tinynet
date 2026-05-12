import { useState, useMemo, useEffect, useRef } from 'react';
import { Network } from '../nn/Network';
import { meanSquaredError } from '../nn/Loss';

interface Props {
  step: number;
  learningRate: number;
  onLossChange?: (loss: number) => void;
  onEpochChange?: (epoch: number) => void;
}

export default function NetworkVisualizer({ step, learningRate, onLossChange, onEpochChange }: Props) {
  const architecture = [2, 4, 4, 1];
  const network = useMemo(() => new Network(architecture), []);
  
  const [inputs, setInputs] = useState<number[]>([0.8, 0.2]);
  const [target, setTarget] = useState<number>(1.0);
  
  const [showGradients, setShowGradients] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [, setForceRender] = useState(0);

  // Run Forward Pass
  const { activations } = network.forward(inputs);
  const output = activations[activations.length - 1][0];
  const loss = meanSquaredError([output], [target]);

  useEffect(() => {
    if (onLossChange) onLossChange(loss);
  }, [loss, onLossChange]);

  useEffect(() => {
    if (onEpochChange) onEpochChange(epoch);
  }, [epoch, onEpochChange]);

  useEffect(() => {
    setShowGradients(false);
  }, [inputs, target]);

  const handleBackprop = () => {
    network.resetGradients();
    network.backward([target]);
    setShowGradients(true);
    setForceRender(prev => prev + 1);
  };

  const handleStep = () => {
    // A full learning step: Forward (done), Backward, Update
    network.resetGradients();
    network.backward([target]);
    network.updateWeights(learningRate);
    
    setShowGradients(false);
    setEpoch(e => e + 1);
  };

  // Auto training loop
  const requestRef = useRef<number>(0);
  
  const trainLoop = () => {
    // Execute multiple steps per frame to speed it up visually
    let currentLoss = 0;
    for (let i = 0; i < 5; i++) {
      const { activations } = network.forward(inputs);
      const output = activations[activations.length - 1][0];
      currentLoss = meanSquaredError([output], [target]);

      network.resetGradients();
      network.backward([target]);
      network.updateWeights(learningRate);
    }
    setEpoch(e => e + 5);

    // Early stopping for Step 5: Stop when it hits a very low error
    if (currentLoss < 0.001) {
      setIsTraining(false);
      return;
    }

    requestRef.current = requestAnimationFrame(trainLoop);
  };

  useEffect(() => {
    if (isTraining) {
      requestRef.current = requestAnimationFrame(trainLoop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTraining, inputs, target, learningRate, network]);

  const layerWidth = 800; 
  const layerHeight = 400; 

  const nodePositions: { x: number; y: number; layerIdx: number; nodeIdx: number; activation: number; errorSignal: number }[][] = [];
  
  architecture.forEach((layerSize, layerIdx) => {
    const layerPositions = [];
    const paddingX = 40;
    const effectiveWidth = step >= 3 ? layerWidth - 120 : layerWidth;
    const actualWidth = effectiveWidth - paddingX * 2;
    const x = paddingX + (layerIdx * (actualWidth / (architecture.length - 1)));
    
    const ySpacing = layerHeight / (layerSize + 1);
    
    for (let i = 0; i < layerSize; i++) {
      const y = (i + 1) * ySpacing;
      let errSig = 0;
      if (layerIdx > 0 && showGradients) {
        errSig = network.layers[layerIdx - 1].neurons[i].lastErrorSignal;
      }

      layerPositions.push({
        x, y, layerIdx, nodeIdx: i,
        activation: activations[layerIdx][i],
        errorSignal: errSig
      });
    }
    nodePositions.push(layerPositions);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '24px', padding: '16px' }}>
      <h2 style={{ color: step >= 5 ? '#00f0ff' : (step >= 4 ? '#facc15' : (step >= 3 ? '#ff4444' : 'var(--accent-primary)')), marginBottom: '-8px', transition: 'color 0.3s ease' }}>
        {step === 2 && "Forward Propagation"}
        {step === 3 && "The Loss Function (Error)"}
        {step === 4 && "Backpropagation (Gradients)"}
        {step >= 5 && "Gradient Descent (Learning)"}
      </h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px', minHeight: '40px' }}>
        {step === 2 && "Adjust the inputs below. The network performs calculations to feed the signal forward."}
        {step === 3 && "The Target is introduced. The Loss function measures how wrong the Network is."}
        {step === 4 && "Click Backpropagate to push the Error backward through the network to see which connections need to be changed."}
        {step >= 5 && "Now we use those gradients to Update the Weights! Click 'Train' to loop the Forward->Backward->Update process and watch it learn."}
      </p>

      {/* Input Controls & Actions */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '8px', alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
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

        {step >= 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,0,0,0.1)', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.3)' }}>
            <span style={{ fontSize: '12px', color: '#ff4444' }}>Target</span>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={target} 
              onChange={(e) => setTarget(parseFloat(e.target.value))}
              style={{ accentColor: '#ff4444' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff4444' }}>{target.toFixed(2)}</span>
          </div>
        )}

        {step === 4 && (
          <button 
            className="btn-primary" 
            style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #facc15, #ff8c00)', color: '#000', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '12px', boxShadow: '0 0 20px rgba(250, 204, 21, 0.4)' }}
            onClick={handleBackprop}
          >
            Trigger Backpropagation
          </button>
        )}

        {step >= 5 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-primary" 
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg, var(--accent-primary), #0077ff)', color: '#000', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '12px' }}
              onClick={handleStep}
              disabled={isTraining}
            >
              Take 1 Step
            </button>
            <button 
              className="btn-primary" 
              style={{ padding: '12px 24px', background: isTraining ? 'rgba(255,68,68,0.2)' : 'linear-gradient(135deg, var(--accent-secondary), #8b00ff)', color: isTraining ? '#ff4444' : '#fff', fontSize: '14px', fontWeight: 'bold', border: isTraining ? '1px solid #ff4444' : 'none', borderRadius: '12px' }}
              onClick={() => setIsTraining(!isTraining)}
            >
              {isTraining ? 'Stop Training' : 'Train (Auto)'}
            </button>
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
                
                let strokeColor = color;
                let opacity = Math.min(1, Math.abs(weight) * 0.5 + 0.1);
                let strokeWidth = 1 + Math.abs(sourceNode.activation * weight) * 3;

                if (showGradients) {
                   const grad = neuron.weightGradients[wIdx];
                   strokeColor = grad > 0 ? '#ff8c00' : '#facc15';
                   opacity = Math.min(1, Math.abs(grad) * 10 + 0.2);
                   strokeWidth = 2 + Math.abs(grad) * 20;
                }

                return (
                  <line 
                    key={`line-${lIdx}-${nIdx}-${wIdx}`}
                    x1={sourceNode.x} y1={sourceNode.y}
                    x2={targetNode.x} y2={targetNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    style={{ transition: isTraining ? 'none' : 'all 0.3s ease' }}
                  />
                );
              });
            });
          })}
          
          {step >= 3 && (
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
            
            let nodeBorder = `2px solid rgba(${baseColor}, 0.8)`;
            if (showGradients && !isInput) {
               nodeBorder = `3px solid ${node.errorSignal > 0 ? '#ff8c00' : '#facc15'}`;
            }

            return (
              <div 
                key={`node-${node.layerIdx}-${node.nodeIdx}`}
                style={{
                  position: 'absolute', left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `rgba(${baseColor}, ${Math.max(0.1, node.activation)})`,
                  border: nodeBorder,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 'bold', color: node.activation > 0.5 ? '#000' : '#fff',
                  boxShadow: showGradients && !isInput ? `0 0 20px ${node.errorSignal > 0 ? '#ff8c00' : '#facc15'}` : `0 0 ${node.activation * 15}px rgba(${baseColor}, ${node.activation})`,
                  zIndex: 10,
                  transition: isTraining ? 'none' : 'all 0.3s ease'
                }}
              >
                {node.activation.toFixed(2)}
              </div>
            );
          })
        ))}

        {step >= 3 && (
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
              position: 'absolute', left: `${layerWidth - 110}px`, top: `${layerHeight / 2 - 60}px`, transform: 'translateX(-50%)',
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
