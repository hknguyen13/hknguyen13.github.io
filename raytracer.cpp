// FILE: raytracer.cpp
// NAME: Huu Nguyen
// Winter, 2014
//
//  Demonstrates the ability to use a 2D RayTracer
//      
//  keys:
//	f: finish drawing line segment, connects current curve segment to
//		starting point (assumes you only have one more point to
//		choose for current curve segment)
//	t: removes control points and draws only the generated curve
//	p: draws the control polygon from cpts
//	h: draws convex hull of current curve from cpts
//      d: doubles the density of points used to draw the curve
//	D: halves the density of points used to draw the curve

#include "Angel.h" //provides mat.h, which provides Ortho(), LookAt(), and Frustum
#include <math.h>  //provides pow function
#include <fstream>
using namespace std;


//GLOBAL VARIABLES:

typedef Angel::vec4  color4;
typedef Angel::vec4  point4;

//Projection matrix:
mat4 p;
const int NumVertices = 14; //number of points to draw Bezier curve
const int extra_pts = 20000;
const int screen_width = 512, screen_height = 512;
const int num_lines = 8;
const int num_pillars = 4;

point4 points[NumVertices+extra_pts];


//lines for each pillar struct
struct Line {
	point4 startPt;
	point4 endPt;
	point4 norm;
};

//pillar structure
struct Pillar {
	Line lines[num_lines];
	int num_pill_lines;
};


//array for pillar structs
Pillar pillars[num_pillars];

color4 colors[NumVertices];

float inc = 14.0;
int Index = 0;
int rayPoints = 0;
int new_lines = 0;
int pillar_index = 0;
int pillarPoints = 0;
bool traceLoop = false;

point4 rayStart;
point4 secPoint;

// RGBA colors
color4 vertex_colors[8] = {
    color4( 0.0, 0.0, 0.0, 1.0 ),  // black
    color4( 1.0, 0.0, 0.0, 1.0 ),  // red
    color4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    color4( 0.0, 1.0, 0.0, 1.0 ),  // green
    color4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    color4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    color4( 1.0, 1.0, 1.0, 1.0 ),  // white
    color4( 0.0, 1.0, 1.0, 1.0 )   // cyan
};

// Shader variable locations:
GLuint ModelView_loc;  // ModelView matrix uniform shader variable location
GLuint Projection_loc; // projection matrix uniform shader variable location
GLuint pcolor;
GLuint program;

// Spherical parameters:
GLdouble zoomin = 0.5;
GLdouble elevation = 0.0;
GLdouble azimuth = 0.0;
GLdouble twist = 0.0;

//----------------------------------------------------------------------------

// FUNCTIONS:
        
mat4 polarView(GLdouble distance, GLdouble twist, GLdouble elevation, GLdouble azimuth);
// Postcondition:  returns ModelView matrix incorporating camera position given
//      by distance, twist, elevation, and azimuth.

void glutMouseFunc(void (*func)(int button, int state, int x, int y));
//http://stackoverflow.com/questions/13399021/getting-the-position-of-a-user-mouse-click-in-c-glut
// used to detect mouseclicks and pass event handling to function

void readInPillars();
// Postcondition: reads in points from pillars.txt file and store them in the pillars array

void mouseClick(int button, int state, int x, int y);
// Postcondition: checks if two raypoints have been generated already and if not places a raypt
// 	where the mouse was clicked

void traceRay();
// Postcondition: according to the current rayStart and ray secPoint points, a ray is drawn according
// 	to its direction and detects if any pillar walls are hit and calculates the new direction and
//	starting point

void drawPoints();
// Postcondition: draws the points in the buffer, each with their respective
//	color and size according to their position in the array

void fillBuffer();
// Postcondition: initializes and fills the buffer with the points array

void init();
void display();
void keyboard(unsigned char key, int x, int y);
void mykeys(int key, int x, int y);
void reshape(int width, int height);

//----------------------------------------------------------------------------

int main( int argc, char **argv )
{
    glutInit( &argc, argv );
    glutInitDisplayMode( GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH );
    glutInitWindowSize( screen_width, screen_height );
    glutCreateWindow( "2D RayTracer | Hit 'd' for auto-fill" );
    init();
    glutDisplayFunc( display );
    glutKeyboardFunc( keyboard );
    glutSpecialFunc( mykeys );
    glutReshapeFunc( reshape );
    glutMainLoop();
    return 0;
}

//----------------------------------------------------------------------------

void init() 
{
    readInPillars();


    //store chamber pillar points in points array
    for (int i=0; i<1; i++) {

        for (int j=0; j<pillars[i].num_pill_lines; j++) {

		points[Index++] = pillars[i].lines[j].startPt;
		points[Index++] = pillars[i].lines[j].endPt;
		pillarPoints+=2;
	}
    }

    glutMouseFunc(mouseClick);

    fillBuffer();

    pcolor = glGetUniformLocation( program, "pcolor" ); 
    ModelView_loc = glGetUniformLocation( program, "ModelView" );
    Projection_loc = glGetUniformLocation( program, "Projection" );
    glEnable(GL_POINT_SMOOTH);  //make points round instead of square

    glEnable( GL_DEPTH_TEST );
    glClearColor( 0.8, 0.8, 0.8, 1.0 ); 
}

//----------------------------------------------------------------------------

void display( void )
{
    glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );       
        
        //Generate the ModelView Matrix and send to vertex shader:
        mat4  mv = polarView(zoomin, twist, elevation, azimuth);        
    glUniformMatrix4fv( ModelView_loc, 1, GL_TRUE, mv );

        //Generate the Projection Matrix and send to vertex shader:
        p = Frustum( -1.0, 1.0, -1.0, 1.0, 0.5, 100.0 );
    glUniformMatrix4fv( Projection_loc, 1, GL_TRUE, p );

    //call function to draw chamber
    drawPoints();

    //let user have ray draw automatically
    if (traceLoop) {
	new_lines += 2;
	traceRay();
    }

    glutSwapBuffers();
}

//----------------------------------------------------------------------------

void mouseClick(int button, int state, int x, int y) {

	if((state == GLUT_UP) && (rayPoints < 2)) {

	  //convert screen coords from mouseclick into real-world coords
	  float rx = (((float(x) * 2.0)/float(screen_width)) - 1.0);
	  float ry = ((float(screen_height) - float(y))
		 - (1.0*(float(screen_height)/2.0)))/(float(screen_height)/2.0);

	  points[Index++] = point4(rx,ry,0.0,1.0);	

	  rayPoints++;
	
	  //store clicked points as ray points
	  if(rayPoints == 1) {
		rayStart = points[Index-1];
	  }
	  else if(rayPoints == 2) {
		secPoint = points[Index-1];
	  }

	  //store points for dotted line segments
	  if(rayPoints == 2) {
	    for(float i=0.0; i<1.0; i+=(1.0/inc)) {
		points[Index].x = rayStart.x + i*(secPoint.x - rayStart.x);
		points[Index].y = rayStart.y + i*(secPoint.y - rayStart.y);
		points[Index].z = 0.0;
		points[Index++].w = 1.0;
	    }
	  }
	}
	
        fillBuffer();
        drawPoints();
        glutPostRedisplay();
}

//----------------------------------------------------------------------------

void traceRay() {
	
	bool firstHit = false;
	float tHit, small_tHit, numer, denom;
	float smallX, largeX, smallY, largeY;
	float offset = 0.0001;
	vec4 c, new_dir, tmp, norm, hitNorm, ray_point, hitPoint;


	c = (secPoint - rayStart);
	c.w = 0.0;
	c = normalize(c);

	//iterate through pillars
	for(int i=0; i<num_pillars; i++) {

	  //iterate through lines of each pillar
	  for(int j=0; j<pillars[i].num_pill_lines; j++) {

		//store containing x and y coords for each line segment 
		if (pillars[i].lines[j].startPt.x <= pillars[i].lines[j].endPt.x) {
		  smallX = pillars[i].lines[j].startPt.x - offset;
		  largeX = pillars[i].lines[j].endPt.x + offset;
		} else {
		  smallX = pillars[i].lines[j].endPt.x - offset;
		  largeX = pillars[i].lines[j].startPt.x + offset;
		}
		if (pillars[i].lines[j].startPt.y <= pillars[i].lines[j].endPt.y) {
		  smallY = pillars[i].lines[j].startPt.y - offset;
		  largeY = pillars[i].lines[j].endPt.y + offset;
		} else {
		  smallY = pillars[i].lines[j].endPt.y - offset;
		  largeY = pillars[i].lines[j].startPt.y + offset;
		}


		tmp = pillars[i].lines[j].startPt - rayStart;
		tmp.w = 0.0;

		norm = (pillars[i].lines[j].norm);
		norm.w = 0.0;
		norm = normalize(norm);

		numer = dot(norm, tmp);
		denom = dot(norm, c);

		tHit = numer / denom;
		ray_point = rayStart + (c)*tHit;
		
		//Debug
		/*std::cout << std::endl << "Pillar " << i << std::endl;
		std::cout << "Line " << j << ": " << std::endl;
		std::cout << "norm: " << norm << std::endl;

		std::cout << "tmp: " << tmp << std::endl;

		std::cout << "rayStart: " << rayStart << std::endl;
		std::cout << "rayEnd: " << secPoint << std::endl;
		std::cout << "c: " << c << std::endl;

		std::cout << "denom: " << denom << std::endl;
		std::cout << "numer: " << numer << std::endl;

		std::cout << "smallX: " << smallX << std::endl;
		std::cout << "smallY: " << smallY << std::endl;
		std::cout << "largeX: " << largeX << std::endl;
		std::cout << "largeY: " << largeY << std::endl;

		std::cout << "tHit: " << tHit << std::endl;

		std::cout << "hit point: " << ray_point << std::endl;*/
		/////////////////////////////////////////////////


		//initialize smallest tHit to first tHit that is
		//positive
		//(offset 0.0 due to when rayStart is on a pillar
		//it believes, sometimes, a very small positive hit 
		//time occurs between the ray and its current position)
		if ((tHit > offset) && (ray_point.x <= largeX) && (ray_point.x >= smallX)
		&& (ray_point.y <= largeY) && (ray_point.y >= smallY)) {

			if (!firstHit) {
				small_tHit = tHit;
			}

			//check if tHit is positive and if it is smallest
			//tHit for pillar
			if (tHit <= small_tHit) {	
				small_tHit = tHit;
				hitNorm = norm;
				hitPoint = ray_point;
				firstHit = true;
			}
		}
	  }
	}

	//store new hitPoint and ray in points array if hitPoint was
	//detected
	if (firstHit) {

		//first point of new raytraced line is startpoint of ray
		points[Index++] = rayStart;

		//second point of new raytraced line is adjusted point
		//from ray
		points[Index] = hitPoint;
		points[Index].z = 0.0;
		points[Index++].w = 1.0;

		//reset new ray start and end points
		rayStart = hitPoint;
		new_dir = (c - (hitNorm * (2*(dot(c, hitNorm)))));
		secPoint = rayStart + new_dir;


		/*std::cout << std::endl << "New dir: " << new_dir << std::endl;
		std::cout << "norm: " << hitNorm << std::endl;
		std::cout << "2n(dot(c,n)): " << (hitNorm * (2*(dot(c, hitNorm)))) << std::endl;
		std::cout << "New rayStart: " << rayStart << std::endl;
		std::cout << "New rayEnd: " << secPoint << std::endl;*/
	}


        fillBuffer();
}

//----------------------------------------------------------------------------

void drawPoints() {

	int dotted_ray_pts = 0;
	glPointSize(5.0);

	//draw chamber
	glUniform4f( pcolor, 1.0, 0.0, 0.0, 1.0 ); //red
	glLineWidth(2.5);
	glDrawArrays( GL_LINES, 0, pillarPoints );

	//draw ray points
	glUniform4f( pcolor, 0.0, 0.0, 0.0, 1.0 ); //black
	glDrawArrays( GL_POINTS, pillarPoints, rayPoints ); //2

	//draw dotted ray vector
	if (rayPoints == 2) {
	  for (int i=0; i<inc; i+=2) {
		glDrawArrays( GL_LINES, pillarPoints+rayPoints+i, 2 );
		dotted_ray_pts+=2;
	  }
	}

	//draw new raytraced lines
	glDrawArrays( GL_LINES, pillarPoints+rayPoints+dotted_ray_pts, 2+new_lines );

	glutPostRedisplay();
}

//----------------------------------------------------------------------------

void fillBuffer() {
    // Create a vertex array object
    GLuint vao[1];
    #ifdef __APPLE__       // For use with OS X
      glGenVertexArraysAPPLE(1, vao );
      glBindVertexArrayAPPLE(vao[0] );
    #else                      // Other (Linux)
      glGenVertexArrays(1, vao );
      glBindVertexArray(vao[0] );       
    #endif

    // Create and initialize a buffer object
    GLuint buffer;
    glGenBuffers( 1, &buffer );
    glBindBuffer( GL_ARRAY_BUFFER, buffer );
    glBufferData( GL_ARRAY_BUFFER, sizeof(points),
                  NULL, GL_STATIC_DRAW );
    glBufferSubData( GL_ARRAY_BUFFER, 0, sizeof(points), points );

    // Load shaders and use the resulting shader program
    program = InitShader( "vshader.glsl", "fshader.glsl" );
    glUseProgram( program );

    // set up vertex arrays
    GLuint vPosition = glGetAttribLocation( program, "vPosition" );
    glEnableVertexAttribArray( vPosition );
    glVertexAttribPointer( vPosition, 4, GL_FLOAT, GL_FALSE, 0, BUFFER_OFFSET(0) );
}

//----------------------------------------------------------------------------

void readInPillars() {

   string c;
   int b, num_pillars;
   ifstream infile;

   float startPtX, startPtY, endPtX, endPtY;
   float norm_x, norm_y;


   infile.open("pillars.txt");
   
   infile>>c;
   num_pillars = atof(c.c_str());

   infile>>c;
   b = atof(c.c_str());

   
   for (int j = 0; j < num_pillars; j++) 
   {

      pillars[j].num_pill_lines = b;

      for (int i = 0; i < b; i++) 
      {
         infile>>c;
	 startPtX = atof(c.c_str());
         infile>>c;
	 startPtY = atof(c.c_str());

         infile>>c;
	 endPtX = atof(c.c_str());
         infile>>c;
	 endPtY = atof(c.c_str());


	pillars[j].lines[i].startPt = point4( startPtX, startPtY,  0.0, 1.0 );
	pillars[j].lines[i].endPt = point4( endPtX, endPtY,  0.0, 1.0 );

	norm_x = (pillars[j].lines[i].endPt.y - pillars[j].lines[i].startPt.y);
	norm_y = (pillars[j].lines[i].endPt.x - pillars[j].lines[i].startPt.x);

	if (norm_y) {
	  norm_y = -(norm_y);
	} else {
	  norm_x = -(norm_x);
	}

	pillars[j].lines[i].norm = point4(norm_x,norm_y,0.0,1.0);
      }

	infile>>c;
	b = atof(c.c_str());
	pillar_index++;
   }
   infile.close();
}

//----------------------------------------------------------------------------

mat4 polarView(GLdouble distance, GLdouble twist, GLdouble elevation, GLdouble azimuth)
{
        mat4 c;
        c = Translate(0.0, 0.0, -distance) * RotateZ(twist) * RotateX(elevation) * RotateY(-azimuth);
        return c; 
}

//----------------------------------------------------------------------------

void reshape( int width, int height )
{
    glViewport( 0, 0, width, height );
}

//----------------------------------------------------------------------------

void keyboard( unsigned char key, int x, int y )
{
    switch( key ) {
        case 033: // Escape Key
        case 'q': case 'Q':
            exit( EXIT_SUCCESS );
        break;
        case '+': 
                twist = twist + 1.0;
                glutPostRedisplay();
        break;
        case '-':
                twist = twist - 1.0;
                glutPostRedisplay();
        break;
        case 'Z':
                zoomin = zoomin + 0.2;
                glutPostRedisplay();
        break;
        case 'z':
                zoomin = zoomin - 0.2;
                glutPostRedisplay();
        break;
        case 's':
		traceRay();
		new_lines += 2;
                glutPostRedisplay();
        break;
        case 'd':
		traceLoop = (traceLoop)? false:true;
                glutPostRedisplay();
        break;
        case ' ':  //space bar - reset everything
                zoomin = 0.5;
                elevation = 0.0;
                azimuth = 0.0;
                twist = 0.0;
                glutPostRedisplay();
        break;
        
    }
}

//----------------------------------------------------------------------------

void mykeys(int key, int x, int y)
{
   switch(key){
           case GLUT_KEY_LEFT:
                   azimuth = azimuth - 5.0;
                   glutPostRedisplay();
           break;
                   
      case GLUT_KEY_RIGHT:
                   azimuth = azimuth + 5.0;
                   glutPostRedisplay();
          break;
                   
      case GLUT_KEY_DOWN:
                   elevation = elevation - 5.0;
                   glutPostRedisplay();
          break;
                   
      case GLUT_KEY_UP:
                   elevation = elevation + 5.0;
                   glutPostRedisplay();
          break;
                  
      default:
          break;
    }
}

//----------------------------------------------------------------------------

