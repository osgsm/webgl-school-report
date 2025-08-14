precision mediump float;

varying vec4 vColor;

void main() {
  // Invert the color
  gl_FragColor = 1.0 - vColor;
}
