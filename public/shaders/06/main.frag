precision mediump float;

uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec4 vColor;
varying vec3 vNormal;

// ライトベクトルはひとまず定数で定義する
const vec3 lightDirection = vec3(-0.5, 0.5, 0.5);

void main() {
    // 視線ベクトルとライトベクトルのハーフベクトルを計算する
  vec3 halfLE = normalize(normalize(lightDirection) + normalize(eyeDirection));

  // 単位化した法線と単位化したライトベクトルで内積を取る
  float diffuse = clamp(dot(normalize(vNormal), normalize(lightDirection)), 0.0, 1.0);

  // ハーフベクトルと法線の内積を取り、スペキュラーを計算する
  float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 25.0);

  // 拡散反射光とスペキュラー反射光を足し合わせる
  vec4 light = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);

  // 拡散反射光とスペキュラー反射光と環境光を足し合わせる
  vec4 destColor = light + ambientColor;
  gl_FragColor = destColor;
}
