import { useState, useEffect } from 'react';
import './App.css';
import PerceptronVisualizer from './components/PerceptronVisualizer';
import NetworkVisualizer from './components/NetworkVisualizer';
import DatasetVisualizer from './components/DatasetVisualizer';
import CapacityVisualizer from './components/CapacityVisualizer';

function App() {
  const [learningRate, setLearningRate] = useState(0.05);
  const [epochs, setEpochs] = useState(0);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#step-(\d)$/);
    if (match) {
      const step = parseInt(match[1], 10);
      if (step >= 1 && step <= 7) return step;
    }
    return 1;
  });
  const [currentLoss, setCurrentLoss] = useState(0);
  const [dynamicArch, setDynamicArch] = useState<number[]>([2, 8, 8, 1]);
  const [targetMse, setTargetMse] = useState(0.01);

  // Sync hash change to step state (supports back/forward browser navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#step-(\d)$/);
      if (match) {
        const step = parseInt(match[1], 10);
        if (step >= 1 && step <= 7) {
          setCurrentStep(step);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync step state to URL hash
  useEffect(() => {
    if (window.location.hash !== `#step-${currentStep}`) {
      window.location.hash = `#step-${currentStep}`;
    }
  }, [currentStep]);

  const getButtonStyle = (step: number, colors: [string, string]) => ({
    background: currentStep === step ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` : 'rgba(255,255,255,0.05)',
    color: currentStep === step ? '#000' : '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 'bold' as const
  });

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="logo-container">
          <div className="logo-icon">N</div>
          <h1 className="logo-text">TinyNet Studio</h1>
        </div>
        <div className="header-controls">
           <button style={getButtonStyle(1, ['var(--accent-primary)', '#0077ff'])} onClick={() => setCurrentStep(1)}>Step 1: Neuron</button>
           <button style={getButtonStyle(2, ['var(--accent-primary)', '#0077ff'])} onClick={() => setCurrentStep(2)}>Step 2: Network</button>
           <button style={getButtonStyle(3, ['#ff4444', '#ff0077'])} onClick={() => setCurrentStep(3)}>Step 3: Loss</button>
           <button style={getButtonStyle(4, ['#facc15', '#ff8c00'])} onClick={() => setCurrentStep(4)}>Step 4: Backprop</button>
           <button style={getButtonStyle(5, ['var(--accent-primary)', 'var(--accent-secondary)'])} onClick={() => setCurrentStep(5)}>Step 5: Learn</button>
           <button style={getButtonStyle(6, ['#00ffaa', '#00aaee'])} onClick={() => setCurrentStep(6)}>Step 6: Problem</button>
           <button style={getButtonStyle(7, ['#ff00ff', '#aa00ff'])} onClick={() => setCurrentStep(7)}>Step 7: Capacity</button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar glass-panel">
          <h2 className="panel-title">Network Architecture</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            {currentStep < 6 ? (
              <>
                <p><strong>Input Layer:</strong> 2 Neurons</p>
                <p><strong>Hidden Layers:</strong> [4, 4]</p>
                <p><strong>Output Layer:</strong> 1 Neuron</p>
              </>
            ) : currentStep === 6 ? (
              <>
                <p><strong>Input Layer:</strong> 2 (X, Y coords)</p>
                <p><strong>Hidden Layers:</strong> [8, 8]</p>
                <p><strong>Output Layer:</strong> 1 (Probability)</p>
              </>
            ) : (
              <>
                <p><strong>Input Layer:</strong> 2 (X, Y coords)</p>
                <p><strong>Hidden Layers:</strong> {dynamicArch.length > 2 ? `[${dynamicArch.slice(1, -1).join(', ')}]` : "None"}</p>
                <p><strong>Output Layer:</strong> 1 (Probability)</p>
              </>
            )}
          </div>

          <div style={{ marginTop: '32px' }}>
            <h2 className="panel-title">Training Parameters</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Learning Rate</span>
                  <span>{learningRate}</span>
                </label>
                <input 
                  type="range" min="0.001" max="0.5" step="0.001" 
                  value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Target MSE</span>
                  <span>{targetMse}</span>
                </label>
                <input 
                  type="range" min="0.0001" max="0.1" step="0.0001" 
                  value={targetMse} onChange={(e) => setTargetMse(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </div>
        </aside>

        <section className="canvas-container glass-panel">
          {currentStep === 1 && <PerceptronVisualizer />}
          {currentStep >= 2 && currentStep <= 5 && <NetworkVisualizer step={currentStep} learningRate={learningRate} targetMse={targetMse} onLossChange={setCurrentLoss} onEpochChange={setEpochs} />}
          {currentStep === 6 && <DatasetVisualizer learningRate={learningRate} targetMse={targetMse} onLossChange={setCurrentLoss} onEpochChange={setEpochs} />}
          {currentStep === 7 && <CapacityVisualizer learningRate={learningRate} targetMse={targetMse} onLossChange={setCurrentLoss} onEpochChange={setEpochs} onArchChange={setDynamicArch} />}
        </section>

        <aside className="inspector-panel glass-panel">
          <h2 className="panel-title">Inspector</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <p style={{ marginBottom: '16px' }}>View real-time network states here.</p>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              {currentStep === 7 ? (
                <p>Watch how a network with no hidden layers gets permanently stuck trying to separate a circle with a single straight line!</p>
              ) : currentStep === 6 ? (
                <p>In Step 6, the network tries to completely separate the Cyan dots from the Purple dots by bending the space between them.</p>
              ) : (
                <p>Observe the Network adjust its weights to minimize the Error (Loss) in Step 5.</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <h2 className="panel-title">Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Epochs</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{epochs}</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Loss (MSE)</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: currentStep >= 3 ? '#ff4444' : 'var(--accent-secondary)' }}>
                  {currentStep >= 3 ? currentLoss.toFixed(4) : "0.0000"}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
