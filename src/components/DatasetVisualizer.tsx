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
}

export default function DatasetVisualizer({ learningRate, targetMse, onLossChange, onEpochChange }: Props) {
  const [datasetType, setDatasetType] = useState<'circle' | 'xor'>('circle');
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState(0);
  const [hoverInputs, setHoverInputs] = useState<number[]>([0.5, 0.5]);

  // We need a deeper/wider network for complex boundaries
  const network = useMemo(() => new Network([2, 8, 8, 1]), [datasetType]); 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setDataset(datasetType === 'circle' ? generateCircleData(300) : generateXORData(300));
    setEpochs(0);
    setIsTraining(false);
    if (onLossChange) onLossChange(0);
  }, [datasetType]);

  useEffect(() => {
    if (onEpochChange) onEpochChange(epochs);
  }, [epochs, onEpochChange]);

  const drawBoundary = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const resolution = 25; // 25x25 grid
    const cellWidth = canvas.width / resolution;
    const cellHeight = canvas.height / resolution;

    // Draw the network's current "brain" (decision boundary)
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        const inputX = (x + 0.5) / resolution;
        const inputY = (y + 0.5) / resolution;
        
        const { activations } = network.forward([inputX, inputY]);
        const output = activations[activations.length - 1][0];

        // Color mix based on output. 1 -> Cyan, 0 -> Purple
        const r = Math.round(189 + (0 - 189) * output);
        const g = Math.round(0 + (240 - 0) * output);
        const b = 255;
        // Make the boundary (output ~0.5) somewhat transparent so it looks cool
        const a = Math.max(0.2, Math.abs(output - 0.5) * 2); 

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth + 1, cellHeight + 1); // +1 to prevent gaps
      }
    }

    // Draw the actual dataset points
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

  // Draw once on mount or when data changes
  useEffect(() => {
    drawBoundary();
  }, [dataset]);

  const trainLoop = () => {
    // Train for several epochs per frame so we can see progress quickly
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

    // Early stopping: If the network solves the problem (Loss gets very low), stop training!
    if (currentLoss < targetMse) {
      setIsTraining(false);
      return; // Break the loop
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
      <h2 style={{ color: '#00ffaa', marginBottom: '-8px' }}>
        Solving a Real Problem (Decision Boundary)
      </h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '600px' }}>
        We are now training a [2, 8, 8, 1] network. The dots are the training dataset. 
        The background colors represent the network's prediction for every single coordinate.
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
          style={{ padding: '12px 24px', background: isTraining ? 'rgba(255,68,68,0.2)' : 'linear-gradient(135deg, #00ffaa, #00aaee)', color: isTraining ? '#ff4444' : '#000', fontWeight: 'bold', border: isTraining ? '1px solid #ff4444' : 'none' }}
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
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)',
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
