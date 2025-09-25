attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform mat4 mvpMatrix;
uniform mat4 normalMatrix;
varying vec3 vNormal;
varying vec4 vColor;

void main() {
  // 法線を逆行列で変換する
  vec3 n = (normalMatrix * vec4(normal, 1.0)).xyz;

  // 拡散反射光とスペキュラー反射光と環境光を足し合わせる
  vColor = color;

  // 法線を varying 変数に格納する
  vNormal = n;

  // 色デバッグ用
  // vColor = vec4(normal.xyz, 1.0);

  gl_Position = mvpMatrix * vec4(position, 1.0);
}
