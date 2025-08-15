precision mediump float;

uniform float time;

varying vec4 vColor;

void main() {
  vec3 rgb = vColor.rgb * abs(sin(time));

  gl_FragColor = 1.0 - vec4(rgb, 1.0);
}
