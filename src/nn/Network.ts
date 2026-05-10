import { Perceptron, sigmoidDerivative } from './Perceptron';

export class Layer {
  neurons: Perceptron[];

  constructor(numNeurons: number, numInputsPerNeuron: number) {
    this.neurons = Array.from({ length: numNeurons }, () => new Perceptron(numInputsPerNeuron));
  }

  forward(inputs: number[]): number[] {
    return this.neurons.map(neuron => neuron.forward(inputs).output);
  }

  // Step 5: Backprop for the Output Layer
  backwardOutputLayer(targets: number[]) {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      // How far off were we?
      const error = neuron.lastOutput - targets[i];
      // The error signal (delta) is the error multiplied by the derivative of the activation function
      const errorSignal = error * sigmoidDerivative(neuron.lastOutput);
      neuron.backward(errorSignal);
    }
  }

  // Step 5: Backprop for Hidden Layers
  backwardHiddenLayer(nextLayer: Layer) {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      let sumError = 0;
      
      // The error for this hidden neuron is the sum of the errors it caused in the NEXT layer
      for (const nextNeuron of nextLayer.neurons) {
        // nextNeuron.weights[i] is the weight connecting THIS neuron to the nextNeuron
        sumError += nextNeuron.weights[i] * nextNeuron.lastErrorSignal;
      }
      
      const errorSignal = sumError * sigmoidDerivative(neuron.lastOutput);
      neuron.backward(errorSignal);
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

  // Step 5: The Backpropagation Algorithm
  backward(targets: number[]) {
    // Start from the output layer and walk backwards to the first hidden layer
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (i === this.layers.length - 1) {
        // Output layer calculates error directly against targets
        layer.backwardOutputLayer(targets);
      } else {
        // Hidden layers calculate error based on the layer ahead of them
        const nextLayer = this.layers[i + 1];
        layer.backwardHiddenLayer(nextLayer);
      }
    }
  }
  
  // Prepare for next training step
  resetGradients() {
    for (const layer of this.layers) {
      for (const neuron of layer.neurons) {
        neuron.resetGradients();
      }
    }
  }
}
