import { useState } from 'react';
import './App.css';
import PerceptronVisualizer from './components/PerceptronVisualizer';
import NetworkVisualizer from './components/NetworkVisualizer';
import DatasetVisualizer from './components/DatasetVisualizer';

function App() {
  const [learningRate, setLearningRate] = useState(0.05);
  const [epochs, setEpochs] = useState(0);
  const [currentStep, setCurrentStep] = useState(7); // Default to latest step
  const [currentLoss, setCurrentLoss] = useState(0);

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
           <button style={getButtonStyle(2, ['var(--accent-primary)', '#0077ff'])} onClick={() => setCurrentStep(2)}>Step 2: Neuron</button>
           <button style={getButtonStyle(3, ['var(--accent-primary)', '#0077ff'])} onClick={() => setCurrentStep(3)}>Step 3: Network</button>
           <button style={getButtonStyle(4, ['#ff4444', '#ff0077'])} onClick={() => setCurrentStep(4)}>Step 4: Loss</button>
           <button style={getButtonStyle(5, ['#facc15', '#ff8c00'])} onClick={() => setCurrentStep(5)}>Step 5: Backprop</button>
           <button style={getButtonStyle(6, ['var(--accent-primary)', 'var(--accent-secondary)'])} onClick={() => setCurrentStep(6)}>Step 6: Learn</button>
           <button style={getButtonStyle(7, ['#00ffaa', '#00aaee'])} onClick={() => setCurrentStep(7)}>Step 7: Problem</button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar glass-panel">
          <h2 className="panel-title">Network Architecture</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            {currentStep < 7 ? (
              <>
                <p><strong>Input Layer:</strong> 2 Neurons</p>
                <p><strong>Hidden Layers:</strong> [4, 4]</p>
                <p><strong>Output Layer:</strong> 1 Neuron</p>
              </>
            ) : (
              <>
                <p><strong>Input Layer:</strong> 2 (X, Y coords)</p>
                <p><strong>Hidden Layers:</strong> [8, 8]</p>
                <p><strong>Output Layer:</strong> 1 (Probability)</p>
              </>
            )}
          </div>

          <div style={{ marginTop: '32px' }}>
            <h2 className="panel-title">Training Parameters</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
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
            </div>
          </div>
        </aside>

        <section className="canvas-container glass-panel">
          {currentStep === 2 && <PerceptronVisualizer />}
          {currentStep >= 3 && currentStep <= 6 && <NetworkVisualizer step={currentStep} learningRate={learningRate} onLossChange={setCurrentLoss} onEpochChange={setEpochs} />}
          {currentStep === 7 && <DatasetVisualizer learningRate={learningRate} onLossChange={setCurrentLoss} onEpochChange={setEpochs} />}
        </section>

        <aside className="inspector-panel glass-panel">
          <h2 className="panel-title">Inspector</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <p style={{ marginBottom: '16px' }}>View real-time network states here.</p>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <p>In Step 7, the network tries to completely separate the Cyan dots from the Purple dots by bending the space between them.</p>
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
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: currentStep >= 4 ? '#ff4444' : 'var(--accent-secondary)' }}>
                  {currentStep >= 4 ? currentLoss.toFixed(4) : "0.0000"}
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
