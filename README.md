# TinyNet: Visual Neural Network Playground

TinyNet is an interactive, educational web application that lets you visualize and experiment with a neural network built entirely from scratch. No external machine learning libraries (like TensorFlow or PyTorch) are used. The core math, forward propagation, and backpropagation algorithms are implemented in plain TypeScript.

## Features

- **From-Scratch Implementation:** See how the math works under the hood. The core neural network engine (`src/nn`) is written in Vanilla TypeScript.
- **Real-Time Visualization:** Watch the network learn in real-time. Nodes light up based on activation levels, and error graphs update dynamically.
- **Interactive Training:** Control the learning rate, step through individual training iterations, or train continuously over multiple epochs.
- **Decision Boundaries:** Train the network on classic 2D datasets (like XOR or circular data) and watch the decision boundary evolve as the network learns to categorize points.

## Tech Stack

- **Core Logic:** Vanilla TypeScript
- **Frontend:** React + Vite
- **Styling:** Vanilla CSS with modern aesthetics (glassmorphism, dark mode)

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the local server URL provided in the terminal (usually `http://localhost:5173`).

## Implementation Journey

The development of TinyNet follows a step-by-step approach to understanding neural networks:

1.  **The Single Neuron (Perceptron):** Understanding inputs, weights, bias, and activation functions.
2.  **Forward Propagation:** Connecting neurons into layers and computing outputs.
3.  **Loss Function:** Measuring the network's error (e.g., Mean Squared Error).
4.  **Backpropagation:** Computing gradients using the chain rule to understand how to adjust weights.
5.  **Gradient Descent:** Updating weights to minimize the loss.
6.  **Real-world Problems:** Applying the network to 2D datasets and visualizing decision boundaries.

For a more detailed breakdown of the development plan, check out [`PLAN.md`](./PLAN.md).
