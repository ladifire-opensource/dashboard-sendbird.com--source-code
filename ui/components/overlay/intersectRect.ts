interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function intersectRect(r1: Rect, r2: Rect) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}
