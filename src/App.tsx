import { useState } from 'react';
import './App.css';
import PerceptronVisualizer from './components/PerceptronVisualizer';
import NetworkVisualizer from './components/NetworkVisualizer';

function App() {
  const [learningRate, setLearningRate] = useState(0.01);
  const [epochs, setEpochs] = useState(0);
  const [currentStep, setCurrentStep] = useState(3);

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="logo-container">
          <div className="logo-icon">N</div>
          <h1 className="logo-text">TinyNet Studio</h1>
        </div>
        <div className="header-controls">
           <button 
             className="btn-primary" 
             style={{ 
               background: currentStep === 2 ? 'linear-gradient(135deg, var(--accent-primary), #0077ff)' : 'rgba(255,255,255,0.05)', 
               color: currentStep === 2 ? '#000' : '#fff',
               border: '1px solid rgba(255,255,255,0.1)' 
             }}
             onClick={() => setCurrentStep(2)}
           >Step 2: Neuron</button>
           <button 
             className="btn-primary" 
             style={{ 
               background: currentStep === 3 ? 'linear-gradient(135deg, var(--accent-primary), #0077ff)' : 'rgba(255,255,255,0.05)', 
               color: currentStep === 3 ? '#000' : '#fff',
               border: '1px solid rgba(255,255,255,0.1)' 
             }}
             onClick={() => setCurrentStep(3)}
           >Step 3: Network</button>
        </div>
      </header>

      <main className="main-content">
        {/* Left Sidebar: Controls & Network Architecture */}
        <aside className="sidebar glass-panel">
          <h2 className="panel-title">Network Architecture</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>Input Layer:</strong> 2 Neurons</p>
            <p><strong>Hidden Layers:</strong> [4, 4]</p>
            <p><strong>Output Layer:</strong> 1 Neuron</p>
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
                  type="range" 
                  min="0.001" 
                  max="0.1" 
                  step="0.001" 
                  value={learningRate} 
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Main Visualization Canvas */}
        <section className="canvas-container glass-panel">
          {currentStep === 2 && <PerceptronVisualizer />}
          {currentStep === 3 && <NetworkVisualizer />}
        </section>

        {/* Right Sidebar: Inspector & Loss Data */}
        <aside className="inspector-panel glass-panel">
          <h2 className="panel-title">Inspector</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <p style={{ marginBottom: '16px' }}>Select a neuron or connection to view its properties.</p>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <p><strong>Activation:</strong> --</p>
              <p><strong>Bias:</strong> --</p>
              <p><strong>Gradient:</strong> --</p>
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
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Loss</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>0.00</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
