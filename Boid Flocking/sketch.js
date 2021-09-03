///CODING CHALLENGE https://www.youtube.com/watch?v=mhjuuHl6qHM&t=31s

const flock = [];


function setup() {
    createCanvas(2000, 1000);
    for (let i = 0; i < 100; i++) {
        flock.push(new Bird());
    }
}

function draw() {
    background(255);
    for (let boid of flock) {
        boid.edge_detect();
        boid.flocking(flock);
        boid.updateBird();
        boid.show();
    }
}