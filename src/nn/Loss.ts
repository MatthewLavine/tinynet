export function meanSquaredError(predictions: number[], targets: number[]): number {
  if (predictions.length !== targets.length) {
    throw new Error("Predictions and targets must be the same length.");
  }
  let sum = 0;
  for (let i = 0; i < predictions.length; i++) {
    const diff = predictions[i] - targets[i];
    sum += diff * diff;
  }
  return sum / predictions.length;
}
