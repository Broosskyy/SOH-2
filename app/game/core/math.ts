export const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

export const distance = (
  first: { x: number; y: number },
  second: { x: number; y: number },
) => Math.hypot(first.x - second.x, first.y - second.y);

export const normalizeAngle = (value: number) => {
  let angle = value;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

