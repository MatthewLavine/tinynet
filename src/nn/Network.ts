import { Perceptron, sigmoidDerivative } from './Perceptron';

export class Layer {
  neurons: Perceptron[];

  constructor(numNeurons: number, numInputsPerNeuron: number) {
    this.neurons = Array.from({ length: numNeurons }, () => new Perceptron(numInputsPerNeuron));
  }

  forward(inputs: number[]): number[] {
    return this.neurons.map(neuron => neuron.forward(inputs).output);
  }

  // Step 4: Backprop for the Output Layer
  backwardOutputLayer(targets: number[]) {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      const error = neuron.lastOutput - targets[i];
      const errorSignal = error * sigmoidDerivative(neuron.lastOutput);
      neuron.backward(errorSignal);
    }
  }

  // Step 4: Backprop for Hidden Layers
  backwardHiddenLayer(nextLayer: Layer) {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      let sumError = 0;
      for (const nextNeuron of nextLayer.neurons) {
        sumError += nextNeuron.weights[i] * nextNeuron.lastErrorSignal;
      }
      const errorSignal = sumError * sigmoidDerivative(neuron.lastOutput);
      neuron.backward(errorSignal);
    }
  }

  // Step 5: Apply gradients
  updateWeights(learningRate: number) {
    for (const neuron of this.neurons) {
      neuron.updateWeights(learningRate);
    }
  }
}

export class Network {
  layers: Layer[];
  architecture: number[];

  constructor(layerSizes: number[]) {
    this.architecture = layerSizes;
    this.layers = [];
    
    for (let i = 1; i < layerSizes.length; i++) {
      const numNeurons = layerSizes[i];
      const numInputsPerNeuron = layerSizes[i - 1];
      this.layers.push(new Layer(numNeurons, numInputsPerNeuron));
    }
  }

  forward(inputs: number[]): { activations: number[][] } {
    if (inputs.length !== this.architecture[0]) {
      throw new Error(`Expected ${this.architecture[0]} inputs but got ${inputs.length}`);
    }

    let currentActivations = [...inputs];
    const allActivations: number[][] = [currentActivations];

    for (const layer of this.layers) {
      currentActivations = layer.forward(currentActivations);
      allActivations.push(currentActivations);
    }

    return { activations: allActivations };
  }

  backward(targets: number[]) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (i === this.layers.length - 1) {
        layer.backwardOutputLayer(targets);
      } else {
        const nextLayer = this.layers[i + 1];
        layer.backwardHiddenLayer(nextLayer);
      }
    }
  }
  
  // Step 5: Update all weights using learning rate
  updateWeights(learningRate: number) {
    for (const layer of this.layers) {
      layer.updateWeights(learningRate);
    }
  }

  resetGradients() {
    for (const layer of this.layers) {
      for (const neuron of layer.neurons) {
        neuron.resetGradients();
      }
    }
  }
}
