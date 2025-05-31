// Add this to extend CanvasRenderingContext2D with roundRect if not available
declare global {
  interface CanvasRenderingContext2D {
    roundRect?(x: number, y: number, width: number, height: number, radius: number): void
  }
}

export {}
