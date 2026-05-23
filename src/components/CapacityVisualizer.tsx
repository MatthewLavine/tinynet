import { useState, useMemo, useEffect, useRef } from 'react';
import { Network } from '../nn/Network';
import { generateCircleData, generateXORData, type DataPoint } from '../nn/Dataset';
import { meanSquaredError } from '../nn/Loss';
import NetworkGraph from './NetworkGraph';

interface Props {
  learningRate: number;
  targetMse: number;
  onLossChange?: (loss: number) => void;
  onEpochChange?: (epoch: number) => void;
  onArchChange?: (arch: number[]) => void;
}

const archOptions = [
  { label: 'Linear [2, 1]', value: [2, 1], desc: "No hidden layers. Can only draw a single straight line." },
  { label: 'Small [2, 4, 1]', value: [2, 4, 1], desc: "One hidden layer. Can combine 4 lines to draw polygons." },
  { label: 'Deep [2, 8, 8, 1]', value: [2, 8, 8, 1], desc: "Two hidden layers. Can draw complex, organic curves." }
];

export default function CapacityVisualizer({ learningRate, targetMse, onLossChange, onEpochChange, onArchChange }: Props) {
  const [datasetType, setDatasetType] = useState<'circle' | 'xor'>('circle');
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState(0);
  const [hoverInputs, setHoverInputs] = useState<number[]>([0.5, 0.5]);

  const [archIdx, setArchIdx] = useState(0);

  const architecture = archOptions[archIdx].value;

  // Re-initialize network when architecture changes
  const network = useMemo(() => new Network(architecture), [architecture, datasetType]); 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setDataset(datasetType === 'circle' ? generateCircleData(300) : generateXORData(300));
    setEpochs(0);
    setIsTraining(false);
    if (onLossChange) onLossChange(0);
  }, [datasetType]);

  // Reset training when architecture changes
  useEffect(() => {
    setEpochs(0);
    setIsTraining(false);
    if (onLossChange) onLossChange(0);
  }, [architecture]);

  useEffect(() => {
    if (onArchChange) onArchChange(architecture);
  }, [architecture, onArchChange]);

  useEffect(() => {
    if (onEpochChange) onEpochChange(epochs);
  }, [epochs, onEpochChange]);

  const drawBoundary = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const resolution = 25;
    const cellWidth = canvas.width / resolution;
    const cellHeight = canvas.height / resolution;

    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        const inputX = (x + 0.5) / resolution;
        const inputY = (y + 0.5) / resolution;
        
        const { activations } = network.forward([inputX, inputY]);
        const output = activations[activations.length - 1][0];

        const r = Math.round(189 + (0 - 189) * output);
        const g = Math.round(0 + (240 - 0) * output);
        const b = 255;
        const a = Math.max(0.2, Math.abs(output - 0.5) * 2); 

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth + 1, cellHeight + 1);
      }
    }

    for (const point of dataset) {
      const px = point.inputs[0] * canvas.width;
      const py = point.inputs[1] * canvas.height;
      
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = point.target === 1 ? '#00f0ff' : '#bd00ff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawBoundary();
  }, [dataset, network]);

  const trainLoop = () => {
    const epochsPerFrame = 5;
    let currentLoss = 0;

    for (let e = 0; e < epochsPerFrame; e++) {
      let totalLoss = 0;
      for (let i = 0; i < dataset.length; i++) {
        const point = dataset[i];
        const { activations } = network.forward(point.inputs);
        const output = activations[activations.length - 1][0];
        
        totalLoss += meanSquaredError([output], [point.target]);
        
        network.resetGradients();
        network.backward([point.target]);
        network.updateWeights(learningRate);
      }
      currentLoss = totalLoss / dataset.length;
    }

    if (onLossChange) onLossChange(currentLoss);
    setEpochs(prev => prev + epochsPerFrame);
    
    drawBoundary();

    if (currentLoss < targetMse) {
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
  }, [isTraining, dataset, learningRate, network]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', padding: '16px' }}>
      <h2 style={{ color: '#ff00ff', marginBottom: '-8px' }}>
        Step 7: Network Capacity
      </h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px' }}>
        Try training the network with different architectures! Notice how the <strong>[2, 1]</strong> network completely fails on complex datasets because it lacks hidden layers.
      </p>

      {/* Architecture Selection */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
        {archOptions.map((opt, idx) => (
          <button 
            key={opt.label}
            className="btn-primary" 
            style={{ 
              padding: '8px 16px', 
              background: archIdx === idx ? '#ff00ff' : 'rgba(255,255,255,0.1)', 
              color: archIdx === idx ? '#000' : '#fff' 
            }}
            onClick={() => setArchIdx(idx)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p style={{ color: '#ff00ff', fontSize: '13px', marginTop: '-8px', marginBottom: '8px' }}>
        {archOptions[archIdx].desc}
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <button 
          className="btn-primary" 
          style={{ padding: '8px 16px', background: datasetType === 'circle' ? '#00f0ff' : 'rgba(255,255,255,0.1)', color: datasetType === 'circle' ? '#000' : '#fff' }}
          onClick={() => setDatasetType('circle')}
        >
          Circle Dataset
        </button>
        <button 
          className="btn-primary" 
          style={{ padding: '8px 16px', background: datasetType === 'xor' ? '#00f0ff' : 'rgba(255,255,255,0.1)', color: datasetType === 'xor' ? '#000' : '#fff' }}
          onClick={() => setDatasetType('xor')}
        >
          XOR Dataset
        </button>
        
        <div style={{ width: '2px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

        <button 
          className="btn-primary" 
          style={{ padding: '12px 24px', background: isTraining ? 'rgba(255,68,68,0.2)' : 'linear-gradient(135deg, #ff00ff, #aa00ff)', color: isTraining ? '#ff4444' : '#fff', fontWeight: 'bold', border: isTraining ? '1px solid #ff4444' : 'none' }}
          onClick={() => setIsTraining(!isTraining)}
        >
          {isTraining ? 'Pause Training' : 'Start Training'}
        </button>
      </div>

      <div style={{ 
        position: 'relative', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.1)',
        width: '400px',
        height: '400px'
      }}>
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          style={{ background: '#000', display: 'block', cursor: 'crosshair' }}
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            setHoverInputs([x, y]);
          }}
          onMouseLeave={() => {
            setHoverInputs([0.5, 0.5]);
          }}
        />
      </div>
      <NetworkGraph network={network} inputs={hoverInputs} />
    </div>
  );
}
