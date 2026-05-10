export type DataPoint = { inputs: [number, number]; target: number };

export function generateCircleData(numPoints: number): DataPoint[] {
  const data: DataPoint[] = [];
  for (let i = 0; i < numPoints; i++) {
    const x = Math.random();
    const y = Math.random();
    // Center at 0.5, 0.5, radius 0.35
    const distance = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
    // 1 if inside circle, 0 if outside
    const target = distance < 0.35 ? 1 : 0;
    data.push({ inputs: [x, y], target });
  }
  return data;
}

export function generateXORData(numPoints: number): DataPoint[] {
  const data: DataPoint[] = [];
  for (let i = 0; i < numPoints; i++) {
    const x = Math.random();
    const y = Math.random();
    // XOR logic in a continuous space
    const isTopLeft = x < 0.5 && y > 0.5;
    const isBottomRight = x > 0.5 && y < 0.5;
    const target = (isTopLeft || isBottomRight) ? 1 : 0;
    data.push({ inputs: [x, y], target });
  }
  return data;
}
