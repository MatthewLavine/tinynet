import { useState } from 'react';
import { sigmoid } from '../nn/Perceptron';

export default function PerceptronVisualizer() {
  // We'll hardcode 2 inputs for easy visualization
  const [inputs, setInputs] = useState<[number, number]>([0.5, 0.8]);
  
  // We hold the weights and bias in state so we can manipulate them interactively.
  const [weights, setWeights] = useState<[number, number]>([0.5, -0.5]);
  const [bias, setBias] = useState<number>(0.2);

  // Compute the forward pass reactively
  const sum = (inputs[0] * weights[0]) + (inputs[1] * weights[1]) + bias;
  const output = sigmoid(sum);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '32px' }}>
      <h2 style={{ color: 'var(--accent-primary)', marginBottom: '-16px' }}>The Single Neuron (Perceptron)</h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '500px' }}>
        Adjust the inputs, weights, and bias below. Watch how the numbers combine, pass through the activation function, and produce the final output.
      </p>

      {/* Network Graph Visualization */}
      <div style={{ position: 'relative', width: '600px', height: '300px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', zIndex: 2 }}>
          {inputs.map((val, idx) => (
            <div key={`input-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Input {idx + 1}</span>
                <input 
                  type="number" 
                  value={val.toFixed(2)} 
                  step="0.1"
                  onChange={(e) => {
                    const newInputs = [...inputs] as [number, number];
                    newInputs[idx] = parseFloat(e.target.value) || 0;
                    setInputs(newInputs);
                  }}
                  style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', padding: '4px', borderRadius: '4px', textAlign: 'center' }}
                />
              </div>
              <div style={{
                width: '50px', height: '50px', borderRadius: '50%', 
                background: `rgba(0, 240, 255, ${Math.abs(val)})`,
                border: '2px solid var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 10px rgba(0, 240, 255, ${Math.abs(val) * 0.5})`
              }}>
                {val.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Weights & Connections (SVG) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          <line x1="120" y1="75" x2="400" y2="150" stroke={weights[0] > 0 ? "var(--accent-primary)" : "var(--accent-secondary)"} strokeWidth={Math.max(1, Math.abs(weights[0]) * 5)} opacity="0.6" />
          <line x1="120" y1="225" x2="400" y2="150" stroke={weights[1] > 0 ? "var(--accent-primary)" : "var(--accent-secondary)"} strokeWidth={Math.max(1, Math.abs(weights[1]) * 5)} opacity="0.6" />
        </svg>

        {/* Weights Controls (Absolute Positioned over SVG lines) */}
        <div style={{ position: 'absolute', left: '200px', top: '70px', display: 'flex', flexDirection: 'column', zIndex: 2 }}>
           <span style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>Weight 1</span>
           <input type="range" min="-2" max="2" step="0.01" value={weights[0]} onChange={(e) => setWeights([parseFloat(e.target.value), weights[1]])} style={{ width: '80px', accentColor: 'var(--accent-primary)' }} />
           <span style={{ fontSize: '12px', textAlign: 'center' }}>{weights[0].toFixed(2)}</span>
        </div>
        <div style={{ position: 'absolute', left: '200px', top: '190px', display: 'flex', flexDirection: 'column', zIndex: 2 }}>
           <span style={{ fontSize: '10px', color: 'var(--accent-secondary)' }}>Weight 2</span>
           <input type="range" min="-2" max="2" step="0.01" value={weights[1]} onChange={(e) => setWeights([weights[0], parseFloat(e.target.value)])} style={{ width: '80px', accentColor: 'var(--accent-secondary)' }} />
           <span style={{ fontSize: '12px', textAlign: 'center' }}>{weights[1].toFixed(2)}</span>
        </div>

        {/* The Neuron */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'var(--glass-bg)',
            border: '2px solid white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px rgba(255, 255, 255, ${output * 0.5})`
          }}>
             <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>&Sigma; (Sum)</span>
             <span style={{ fontWeight: 'bold' }}>{sum.toFixed(2)}</span>
             <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />
             <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>&fnof; (Sigmoid)</span>
             <span style={{ fontWeight: 'bold', color: '#fff' }}>{output.toFixed(2)}</span>
          </div>
          
          {/* Bias Control */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#ffb800' }}>Bias</span>
            <input type="range" min="-2" max="2" step="0.01" value={bias} onChange={(e) => setBias(parseFloat(e.target.value))} style={{ width: '80px', accentColor: '#ffb800' }} />
            <span style={{ fontSize: '12px' }}>{bias.toFixed(2)}</span>
          </div>
        </div>

        {/* Output */}
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '40px' }}>
           <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Output</span>
           <div style={{
             width: '60px', height: '60px', borderRadius: '12px',
             background: `rgba(189, 0, 255, ${output})`,
             border: '2px solid var(--accent-secondary)',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             fontSize: '18px', fontWeight: 'bold',
             boxShadow: `0 0 15px rgba(189, 0, 255, ${output * 0.6})`
           }}>
              {output.toFixed(2)}
           </div>
        </div>

      </div>
    </div>
  );
}
