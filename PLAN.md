# Visual Neural Network Implementation Plan

This plan outlines our iterative approach to building a neural network from scratch, complete with a visual web frontend. We'll implement the math and logic directly in the browser using TypeScript, allowing you to see exactly how the network processes data and learns in real-time.

## Tech Stack
*   **Core**: Vanilla TypeScript/JavaScript for the neural network logic (no ML libraries like TensorFlow or PyTorch). This ensures we learn the underlying mechanics.
*   **Frontend**: React (via Vite) to build an interactive, dynamic, and beautiful UI.
*   **Styling**: Vanilla CSS with modern aesthetics (glassmorphism, dark mode, smooth animations) to make the learning experience engaging.

## Step-by-Step Implementation

### Step 1: Project Setup & The Architecture
*   Initialize the Vite + React + TypeScript project.
*   Set up a modern, visually stunning base CSS styling.
*   Create the basic layout for our "Neural Network Playground".

### Step 2: The Single Neuron (Perceptron)
*   **Code**: Implement a single neuron. We'll code inputs, weights, a bias, and an activation function (like Sigmoid or ReLU).
*   **UI**: Build an interactive component where you can manually adjust inputs and weights using sliders, and instantly see the neuron's output change.

### Step 3: Forward Propagation (Connecting the Network)
*   **Code**: Create `Layer` and `Network` classes. Implement the forward pass (matrix multiplication/loops) to feed data from the input layer, through hidden layers, to the output.
*   **UI**: Draw a visual graph of the network. Nodes will light up based on their activation levels, showing how data flows through the system.

### Step 4: The Loss Function (Measuring Error)
*   **Code**: Implement a loss function (e.g., Mean Squared Error). This tells the network how "wrong" its predictions are compared to the desired truth.
*   **UI**: Add a real-time error chart or indicator.

### Step 5: Backpropagation (The Hard Part!)
*   **Code**: Implement the core learning algorithm. We'll write the calculus/chain rule logic to compute gradients—figuring out how much each weight contributed to the final error.
*   **UI**: Visualize the flow of error *backwards* through the network graph, perhaps by highlighting the connections that need the most adjustment.

### Step 6: Gradient Descent (Learning)
*   **Code**: Use the computed gradients to update the weights and biases using a learning rate.
*   **UI**: Add "Step" and "Train" buttons. You'll be able to step through a single training iteration or watch the network learn continuously over many epochs.

### Step 7: Solving a Real Problem
*   **Code**: Feed a classic dataset into the network, such as the XOR problem or a simple 2D coordinate classification task.
*   **UI**: Add a 2D scatter plot visualization. As the network trains, we'll draw its "decision boundary" in real-time, watching it bend and shift to categorize the data points correctly.
