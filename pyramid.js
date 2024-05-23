const canvas = document.getElementById('pyramidCanvas'); // this is the size of the pic
const context = canvas.getContext('2d'); // this allows us to draw the picture 

console.log('Canvas:', canvas);

const WHITE = 'rgb(255, 255, 255)';
const BLACK = 'rgb(0,0,0)';
const RED = 'rgb(255, 0, 0)';
const BLUE = 'rgb(15, 15, 255)';

const width = canvas.width; 
const height = canvas.height; 
// this is because the canvas already has its own diseginated size 


const scale = 100; 
let angle = 0; // this one is let becuase it is a variable that wil change in value 
const rotationSpeed = 0.01;

let circlePos = [width/2, height/2];
let points = []; // points will be an array that contains arrays aight 

let reversed = false; 
let shape;


let start_Time = Date.now(); 

//the points and corners of our shape
function changeShape(newShape) {
    shape = newShape;
    points = [];

    if (shape === 'pyramid') {
        points.push([-1, -1, 0]);
        points.push([1, -1, 0]);
        points.push([1, 1, 0]);
        points.push([-1, 1, 0]);
        points.push([0, 0, 2]);
        points.push([0, 0, -2]);
    } else if (shape === 'cube') {
        points.push([-1, -1, -1]);
        points.push([1, -1, -1]);
        points.push([1, 1, -1]);
        points.push([-1, 1, -1]);
        points.push([-1, -1, 1]);
        points.push([1, -1, 1]);
        points.push([1, 1, 1]);
        points.push([-1, 1, 1]);
    }
    console.log('Shape changed to:', shape);
}

changeShape('pyramid');



// const projection matrix 

const projectionMatrix = [
    [1, 0, 0], 
    [0, 1, 0]
]; 

let projected_points = Array.from({length: points.length}, (v, n) => [n, n]);

function connect_points(i, j, points){
    //console.log(`Drawing point ${index}: (${x}, ${y})`);

    context.beginPath(); 
    context.moveTo(points[i][0], points[i][1]);
    context.lineTo(points[j][0], points[j][1]); 
    context.strokeStyle = RED; // this sets the color of the lines 
    if(reversed) context.strokeStyle = BLUE;
    context.stroke(); // this actually draws the lines 
}
// there is no while loop insteaad





function rotate(points, angle, axis){
    let cosA = Math.cos(angle);
    let sinA = Math.sin(angle); 

    let rotationMatrix; 
    // rotates on the z axis
    if(axis === 'z')
    {
        rotationMatrix = [
            [cosA, -sinA, 0], 
            [sinA, cosA, 0], 
            [0, 0, 1],
        ];
    }
    // rotates in the y axis
    else if(axis === 'y')
    {
        rotationMatrix = [
            [cosA, 0, sinA], 
            [0, 1, 0], 
            [-sinA, 0, cosA],
        ];
    }
    // rotates in the x axis
    else if(axis === 'x')
    {
        rotationMatrix = [
            [1, 0, 0], 
            [0, cosA, -sinA],
            [0, sinA, cosA],
        ];
    }
    
    return [
        points[0] * rotationMatrix[0][0] + points[1] * rotationMatrix[0][1] + points[2] * rotationMatrix[0][2],
        points[0] * rotationMatrix[1][0] + points[1] * rotationMatrix[1][1] + points[2] * rotationMatrix[1][2],
        points[0] * rotationMatrix[2][0] + points[1] * rotationMatrix[2][1] + points[2] * rotationMatrix[2][2]
    ];    
}

function project(points) {
    return [
        // points[0] * projectionMatrix[0][0] + points[1] * projectionMatrix[0][1] + points[2] * projectionMatrix[0][2],
        // points[0] * projectionMatrix[1][0] + points[1] * projectionMatrix[1][1] + points[2] * projectionMatrix[1][2]
        points[0] * projectionMatrix[0][0] + points[1] * projectionMatrix[0][1],
        points[0] * projectionMatrix[1][0] + points[1] * projectionMatrix[1][1] 
    ];
}
function draw() {
    context.clearRect(0, 0, width, height);

    const elapsedTime = (Date.now() - start_Time) / 1000;

    if (elapsedTime >= 5) {
        reversed = !reversed;
        start_Time = Date.now();
        //elapsedTime = Date.now() - start_Time;
    }

    // const currentRotationSpeed = reversed ? -rotationSpeed : rotationSpeed;
    // angle += currentRotationSpeed;
    angle += reversed ? -rotationSpeed : rotationSpeed;
    


    const rotatedPoints = points.map(point => {
        let rotated = rotate(point, angle, 'z');
        rotated = rotate(rotated, angle, 'y');
        rotated = rotate(rotated, angle, 'x');
        return rotated;
    });

    const projectedPoints = rotatedPoints.map(points => {
        const projected = project(points);
        return [
            projected[0] * scale + circlePos[0],
            projected[1] * scale + circlePos[1]
        ];
    });

    projectedPoints.forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 5, 0, Math.PI * 2);
        context.fillStyle = WHITE;
        context.fill();
    });

    if (shape === 'pyramid') {
        for (let p = 0; p < 4; p++) {
            connect_points(p, (p + 1) % 4, projectedPoints);
            connect_points(p, 4, projectedPoints);  
            connect_points(p, 5, projectedPoints);  
        }
    } else if (shape === 'cube') {
        // Connect bottom face
        for (let p = 0; p < 4; p++) {
            connect_points(p, (p + 1) % 4, projectedPoints);
        }
        // Connect top face
        for (let p = 4; p < 8; p++) {
            connect_points(p, (p + 1) % 4 + 4, projectedPoints);
        }
        // Connect vertical edges
        for (let p = 0; p < 4; p++) {
            connect_points(p, p + 4, projectedPoints);
        }
    }

    requestAnimationFrame(draw);
}

draw();
