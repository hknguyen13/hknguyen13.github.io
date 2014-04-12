attribute  vec4 vPosition;
uniform  vec4 pcolor;

varying vec4 color;

uniform mat4 ModelView;
uniform mat4 Projection;

void main() 
{
    gl_Position = Projection*ModelView*vPosition;
    color = pcolor;
}

