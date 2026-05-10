// The activation function (Sigmoid) squashes any number into a range between 0 and 1.
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Derivative of the sigmoid function, needed for backpropagation
export function sigmoidDerivative(output: number): number {
  return output * (1 - output);
}

export class Perceptron {
  weights: number[];
  bias: number;

  // Track gradients for learning
  weightGradients: number[];
  biasGradient: number;

  // Track state for the backward pass
  lastInputs: number[] = [];
  lastOutput: number = 0;
  lastErrorSignal: number = 0; // dLoss / dSum

  constructor(numInputs: number) {
    // Initialize weights and bias randomly between -1 and 1
    this.weights = Array.from({ length: numInputs }, () => Math.random() * 2 - 1);
    this.bias = Math.random() * 2 - 1;
    this.weightGradients = new Array(numInputs).fill(0);
    this.biasGradient = 0;
  }

  // The forward pass: Calculate the output based on inputs
  forward(inputs: number[]): { sum: number; output: number } {
    if (inputs.length !== this.weights.length) {
      throw new Error("Number of inputs must match the number of weights.");
    }
    
    this.lastInputs = [...inputs];
    
    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    sum += this.bias;

    this.lastOutput = sigmoid(sum);
    return { sum, output: this.lastOutput };
  }

  // The backward pass: Calculate gradients based on the error signal
  backward(errorSignal: number) {
    this.lastErrorSignal = errorSignal;
    
    // Accumulate gradients
    this.biasGradient += errorSignal;
    for (let i = 0; i < this.weights.length; i++) {
      this.weightGradients[i] += errorSignal * this.lastInputs[i];
    }
  }

  // Step 6: Gradient Descent - Update weights to minimize error
  updateWeights(learningRate: number) {
    this.bias -= learningRate * this.biasGradient;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] -= learningRate * this.weightGradients[i];
    }
  }

  // Clear gradients after weights are updated
  resetGradients() {
    this.biasGradient = 0;
    this.weightGradients.fill(0);
  }
}
