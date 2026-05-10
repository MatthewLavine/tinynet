import { useState } from 'react';
import { sigmoid } from '../nn/Perceptron';

// Helper to calculate line endpoints so they stop at the edges of the circles
function getEdgeLine(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x1, y1, x2, y2 };
  const nx = dx / dist;
  const ny = dy / dist;
  return {
    x1: x1 + nx * r1,
    y1: y1 + ny * r1,
    x2: x2 - nx * r2,
    y2: y2 - ny * r2,
  };
}

export default function PerceptronVisualizer() {
  const [inputs, setInputs] = useState<[number, number]>([0.5, 0.8]);
  const [weights, setWeights] = useState<[number, number]>([0.5, -0.5]);
  const [bias, setBias] = useState<number>(0.2);

  const sum = (inputs[0] * weights[0]) + (inputs[1] * weights[1]) + bias;
  const output = sigmoid(sum);

  // Exact coordinates for elements
  const input1Center = { x: 120, y: 80 };
  const input2Center = { x: 120, y: 220 };
  const neuronCenter = { x: 300, y: 150 };
  const outputCenter = { x: 480, y: 150 };

  const inputRadius = 25; // 50px width/height -> 25px radius
  const neuronRadius = 50; // 100px width/height -> 50px radius
  const outputRadius = 30; // 60px square -> roughly 30px boundary

  const line1 = getEdgeLine(input1Center.x, input1Center.y, neuronCenter.x, neuronCenter.y, inputRadius, neuronRadius);
  const line2 = getEdgeLine(input2Center.x, input2Center.y, neuronCenter.x, neuronCenter.y, inputRadius, neuronRadius);
  const line3 = getEdgeLine(neuronCenter.x, neuronCenter.y, outputCenter.x, outputCenter.y, neuronRadius, outputRadius + 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '32px' }}>
      <h2 style={{ color: 'var(--accent-primary)', marginBottom: '-16px' }}>The Single Neuron (Perceptron)</h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '500px' }}>
        Adjust the inputs, weights, and bias below. Watch how the numbers combine, pass through the activation function, and produce the final output.
      </p>

      {/* Network Graph Visualization */}
      <div style={{ position: 'relative', width: '600px', height: '300px' }}>
        
        {/* Connections (SVG) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          {/* Line 1 */}
          <line x1={line1.x1} y1={line1.y1} x2={line1.x2} y2={line1.y2} stroke={weights[0] > 0 ? "var(--accent-primary)" : "var(--accent-secondary)"} strokeWidth={Math.max(1, Math.abs(weights[0]) * 5)} opacity="0.6" />
          {/* Line 2 */}
          <line x1={line2.x1} y1={line2.y1} x2={line2.x2} y2={line2.y2} stroke={weights[1] > 0 ? "var(--accent-primary)" : "var(--accent-secondary)"} strokeWidth={Math.max(1, Math.abs(weights[1]) * 5)} opacity="0.6" />
          {/* Output Line */}
          <line x1={line3.x1} y1={line3.y1} x2={line3.x2} y2={line3.y2} stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
        </svg>

        {/* Inputs */}
        <div style={{ position: 'absolute', left: `${input1Center.x - 120}px`, top: `${input1Center.y - 25}px`, display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Input 1</span>
            <input type="number" value={inputs[0].toFixed(2)} step="0.1" onChange={(e) => setInputs([parseFloat(e.target.value) || 0, inputs[1]])} style={{ width: '56px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', padding: '4px', borderRadius: '4px', textAlign: 'center' }} />
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `rgba(0, 240, 255, ${Math.abs(inputs[0])})`, border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px rgba(0, 240, 255, ${Math.abs(inputs[0]) * 0.5})` }}>
            {inputs[0].toFixed(2)}
          </div>
        </div>

        <div style={{ position: 'absolute', left: `${input2Center.x - 120}px`, top: `${input2Center.y - 25}px`, display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Input 2</span>
            <input type="number" value={inputs[1].toFixed(2)} step="0.1" onChange={(e) => setInputs([inputs[0], parseFloat(e.target.value) || 0])} style={{ width: '56px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', padding: '4px', borderRadius: '4px', textAlign: 'center' }} />
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `rgba(0, 240, 255, ${Math.abs(inputs[1])})`, border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px rgba(0, 240, 255, ${Math.abs(inputs[1]) * 0.5})` }}>
            {inputs[1].toFixed(2)}
          </div>
        </div>

        {/* Weights Controls */}
        <div style={{ position: 'absolute', left: `${(input1Center.x + neuronCenter.x) / 2 - 40}px`, top: `${(input1Center.y + neuronCenter.y) / 2 - 30}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '8px' }}>
           <span style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>Weight 1</span>
           <input type="range" min="-2" max="2" step="0.01" value={weights[0]} onChange={(e) => setWeights([parseFloat(e.target.value), weights[1]])} style={{ width: '60px', accentColor: 'var(--accent-primary)' }} />
           <span style={{ fontSize: '12px' }}>{weights[0].toFixed(2)}</span>
        </div>

        <div style={{ position: 'absolute', left: `${(input2Center.x + neuronCenter.x) / 2 - 40}px`, top: `${(input2Center.y + neuronCenter.y) / 2 - 30}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '8px' }}>
           <span style={{ fontSize: '10px', color: 'var(--accent-secondary)' }}>Weight 2</span>
           <input type="range" min="-2" max="2" step="0.01" value={weights[1]} onChange={(e) => setWeights([weights[0], parseFloat(e.target.value)])} style={{ width: '60px', accentColor: 'var(--accent-secondary)' }} />
           <span style={{ fontSize: '12px' }}>{weights[1].toFixed(2)}</span>
        </div>

        {/* The Neuron */}
        <div style={{ position: 'absolute', left: `${neuronCenter.x - 50}px`, top: `${neuronCenter.y - 50}px`, width: '100px', height: '100px', borderRadius: '50%', background: 'var(--glass-bg)', border: '2px solid white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px rgba(255, 255, 255, ${output * 0.5})`, zIndex: 2 }}>
             <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>&Sigma; (Sum)</span>
             <span style={{ fontWeight: 'bold' }}>{sum.toFixed(2)}</span>
             <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />
             <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>&fnof; (Sigmoid)</span>
             <span style={{ fontWeight: 'bold', color: '#fff' }}>{output.toFixed(2)}</span>
        </div>
        
        {/* Bias Control */}
        <div style={{ position: 'absolute', left: `${neuronCenter.x - 30}px`, top: `${neuronCenter.y + 60}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '8px', zIndex: 2 }}>
          <span style={{ fontSize: '10px', color: '#ffb800' }}>Bias</span>
          <input type="range" min="-2" max="2" step="0.01" value={bias} onChange={(e) => setBias(parseFloat(e.target.value))} style={{ width: '60px', accentColor: '#ffb800' }} />
          <span style={{ fontSize: '12px' }}>{bias.toFixed(2)}</span>
        </div>

        {/* Output */}
        <div style={{ position: 'absolute', left: `${outputCenter.x - 30}px`, top: `${outputCenter.y - 45}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Output</span>
           <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: `rgba(189, 0, 255, ${output})`, border: '2px solid var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', boxShadow: `0 0 15px rgba(189, 0, 255, ${output * 0.6})` }}>
              {output.toFixed(2)}
           </div>
        </div>

      </div>
    </div>
  );
}
