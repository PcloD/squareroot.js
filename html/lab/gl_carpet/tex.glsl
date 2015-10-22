// normal2color.glsl
//#vertex
attribute vec3 aNormal;
attribute vec3 aPosition;
attribute vec2 aUV;

uniform mat4 uMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjection;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
varying vec2 vUV;
	 
void main() {
	vNormal = normalize(uNormalMatrix * aNormal);
	vUV = aUV;
	gl_Position = uProjection * uViewMatrix * vec4(aPosition, 1.0);
}

//#fragment
precision highp float;

varying vec3 vNormal;          
varying vec2 vUV;

uniform sampler2D uTexture;
uniform vec3 uLight;

void main() {
	float l = 0.4 + 1.2 * dot(vNormal, uLight);
	vec3 c = texture2D(uTexture, vUV).rgb;
	gl_FragColor = vec4(c * l, 1.0);
}