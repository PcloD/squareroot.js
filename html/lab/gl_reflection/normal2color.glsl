// normal2color.glsl
//#vertex
attribute vec3 aNormal;
attribute vec3 aPosition;

uniform mat4 uMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjection;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
     
void main() {

	// vNormal = aNormal;
	vNormal = normalize(uNormalMatrix * aNormal);

	gl_Position = uProjection * uViewMatrix * vec4(aPosition, 1.0);
}

//#fragment
precision highp float;

varying vec3 vNormal;

uniform float uAlpha;
         
void main() {
	vec3 l = vNormal * 0.5 + vec3(0.5);
	gl_FragColor = vec4(l, uAlpha);
}
