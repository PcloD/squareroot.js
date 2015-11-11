//#name diffspec

/*#docs

@description <p>A general purpose diffuse-specular shader.</p> 

<p>It is used internally by the Unity scene parses as the default shader. 
It works with several light related uniforms, but for now only one light per
shader is supported as well it can only be a directiona light.</p>

<p>This shader is meant to make working with basic shading easier, but is not 
intended to be some sort of one-shader-to-rule-them-all, so in most scenarios
a custom GLSL shader might be required.</p>

*/

//#vertex
precision mediump float;

attribute vec3 aNormal;
attribute vec3 aPosition;
attribute vec2 aUV;

uniform mat4 uMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjection;
uniform mat3 uNormalMatrix;
uniform vec3 uEyePosition;

varying vec3 vNormal;
varying vec3 vIncident;
varying vec2 vUV;

void main() {

	vNormal = uNormalMatrix * aNormal;
	vec3 p = (uMatrix * vec4(aPosition, 1.0)).xyz;
	vIncident = normalize(p - uEyePosition);

	vUV = aUV;
	gl_Position = uProjection * uViewMatrix * vec4(aPosition, 1.0);
}

//#fragment
precision mediump float;

//#include standardLight

uniform vec4 uEmissiveColor;

	uniform vec3 uLightDirection;
	uniform vec4 uDiffuseColor;
	#ifdef USE_SPECULAR
	uniform vec4 uSpecularColor;
	uniform float uShininess;
	#endif

#ifdef USE_DIFFUSE_MAP
uniform sampler2D uDiffuseMap;
uniform vec4 uTextureTileOffset;

vec4 texture(sampler2D t, vec2 uv) {
	return texture2D(t, uv * uTextureTileOffset.xy + uTextureTileOffset.zw);
}

#endif

#ifdef USE_SPECULAR_MAP
uniform sampler2D uSpecularMap;
#endif

varying vec3 vNormal;
varying vec3 vIncident;
varying vec2 vUV;

void main() {

	// Diffuse and emissive terms
	#ifdef USE_DIFFUSE_MAP
	vec3 dm = uDiffuseColor.rgb * texture(uDiffuseMap, vUV).rgb;
	#else
	vec3 dm = uDiffuseColor.rgb;
	#endif

	vec3 e = (uEmissiveColor.rgb* dm.rgb) * uEmissiveColor.a;
	vec3 d = diffuse(vNormal, uLightDirection, dm.rgb, uDiffuseColor.a);


	// Specular term
	#ifdef USE_SPECULAR_MAP
	#define SI uSpecularColor.a * texture(uSpecularMap, vUV).r
	#else
	#define SI uSpecularColor.a
	#endif
	
	#ifdef USE_SPECULAR
	#define SP specular(vNormal, vIncident, uLightDirection, uSpecularColor.rgb, uShininess, SI)
	#else 
	#define SP vec3(0.0) 
	#endif
	
	gl_FragColor = vec4(e + d + SP, 1.0);
}






