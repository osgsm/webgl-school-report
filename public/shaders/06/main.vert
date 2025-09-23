attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform mat4 mvpMatrix;
uniform mat4 normalMatrix;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec4 vColor;

// ライトベクトルはひとまず定数で定義する
const vec3 lightDirection = vec3(-0.5, 0.5, 0.5);

void main() {
  // 視線ベクトルとライトベクトルのハーフベクトルを計算する
  vec3 halfLE = normalize(normalize(lightDirection) + normalize(eyeDirection));
  // 法線を逆行列で変換する
  vec3 n = (normalMatrix * vec4(normal, 1.0)).xyz;

  // 単位化した法線と単位化したライトベクトルで内積を取る
  float diffuse = clamp(dot(normalize(n), normalize(lightDirection)), 0.0, 1.0);

  // ハーフベクトルと法線の内積を取り、スペキュラーを計算する
  float specular = pow(clamp(dot(n, halfLE), 0.0, 1.0), 25.0);

  // 拡散反射光とスペキュラー反射光を足し合わせる
  vec4 light = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);

  // 拡散反射光とスペキュラー反射光と環境光を足し合わせる
  vColor = light + ambientColor;

  // 色デバッグ用
  // vColor = vec4(normal.xyz, 1.0);

  gl_Position = mvpMatrix * vec4(position, 1.0);
}
