import { Perceptron } from './Perceptron';

export class Layer {
  neurons: Perceptron[];

  constructor(numNeurons: number, numInputsPerNeuron: number) {
    this.neurons = Array.from({ length: numNeurons }, () => new Perceptron(numInputsPerNeuron));
  }

  // Calculate the outputs of all neurons in this layer
  forward(inputs: number[]): number[] {
    return this.neurons.map(neuron => neuron.forward(inputs).output);
  }
}

export class Network {
  layers: Layer[];
  architecture: number[];

  // e.g. [2, 4, 4, 1] -> 2 inputs, two hidden layers of 4, 1 output
  constructor(layerSizes: number[]) {
    this.architecture = layerSizes;
    this.layers = [];
    
    // The first element is the input layer size. 
    // Actual processing layers start from index 1.
    for (let i = 1; i < layerSizes.length; i++) {
      const numNeurons = layerSizes[i];
      const numInputsPerNeuron = layerSizes[i - 1];
      this.layers.push(new Layer(numNeurons, numInputsPerNeuron));
    }
  }

  // Feed inputs through the entire network
  forward(inputs: number[]): { activations: number[][] } {
    if (inputs.length !== this.architecture[0]) {
      throw new Error(`Expected ${this.architecture[0]} inputs but got ${inputs.length}`);
    }

    let currentActivations = [...inputs];
    // We store activations for the input layer and all subsequent layers
    const allActivations: number[][] = [currentActivations];

    for (const layer of this.layers) {
      currentActivations = layer.forward(currentActivations);
      allActivations.push(currentActivations);
    }

    return { activations: allActivations };
  }
}
