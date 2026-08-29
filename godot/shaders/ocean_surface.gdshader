shader_type spatial;
render_mode cull_disabled, diffuse_lambert;

uniform vec4 u_deep : source_color = vec4(0.01, 0.1, 0.2, 1.0);
uniform vec4 u_shallow : source_color = vec4(0.05, 0.32, 0.42, 1.0);
uniform float u_time = 0.0;

void fragment() {
	vec2 wave_uv = UV * 12.0 + vec2(u_time * 0.04, u_time * 0.03);
	float wave = sin(wave_uv.x * 6.283) * 0.5 + sin(wave_uv.y * 4.712 + u_time * 0.6) * 0.5;
	float blend = clamp(0.5 + wave * 0.08, 0.0, 1.0);
	ALBEDO = mix(u_deep.rgb, u_shallow.rgb, blend);
	ROUGHNESS = 0.28;
	METALLIC = 0.12;
	SPECULAR = 0.35;
}
