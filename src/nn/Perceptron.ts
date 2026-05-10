// The activation function (Sigmoid) squashes any number into a range between 0 and 1.
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export class Perceptron {
  weights: number[];
  bias: number;

  constructor(numInputs: number) {
    // Initialize weights and bias randomly between -1 and 1
    this.weights = Array.from({ length: numInputs }, () => Math.random() * 2 - 1);
    this.bias = Math.random() * 2 - 1;
  }

  // The forward pass: Calculate the output based on inputs
  forward(inputs: number[]): { sum: number; output: number } {
    if (inputs.length !== this.weights.length) {
      throw new Error("Number of inputs must match the number of weights.");
    }

    // 1. Multiply each input by its corresponding weight and sum them up
    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }

    // 2. Add the bias
    sum += this.bias;

    // 3. Pass through the activation function
    const output = sigmoid(sum);

    return { sum, output };
  }
}
