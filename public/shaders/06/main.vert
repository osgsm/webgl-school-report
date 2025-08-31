attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform mat4 mvpMatrix;
uniform mat4 normalMatrix;
varying vec4 vColor;

// ライトベクトルはひとまず定数で定義する
const vec3 light = vec3(1.0, 1.0, 1.0);

void main() {
  // 法線を行列で変換する
  vec3 n = (normalMatrix * vec4(normal, 1.0)).xyz;

  // 単位化した法線と単位化したライトベクトルで内積を取る
  float d = dot(normalize(n), normalize(light));

  // 内積の結果を頂点カラーの RGB 成分に乗算する
  vColor = vec4(color.rgb * d, color.a);

  // 色デバッグ用
  // vColor = vec4(normal.xyz, 1.0);

  gl_Position = mvpMatrix * vec4(position, 1.0);
}
