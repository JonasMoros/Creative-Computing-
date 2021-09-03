class Bird {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4))
        this.acceleration = createVector();
        this.maxForce = .2;
        this.maxSpeed = 4;
    }


    edge_detect() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }

        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    // cohesion(boids) {
    //     let perceptionRadius = 100;
    //     let steering = createVector();
    //     let total = 0;
    //     for (let other of boids) {
    //         let d = dist(
    //             this.position.x,
    //             this.position.y,
    //             other.position.x,
    //             other.position.y
    //         );
    //         if (other != this && d < perceptionRadius) {
    //             steering.add(other.position);
    //             total++;
    //         }
    //     }
    //     if (total > 0) {
    //         steering.div(total);
    //         steering.sub(this.position);
    //         steering.setMag(this.maxSpeed);
    //         steering.sub(this.velocity);
    //         steering.limit(this.maxForce);
    //     }
    //     return steering;
    // }


    seperate(boids) {
        let perceptionRadius = 100;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                let difference = p5.Vector.sub(this.position, other.position);
                difference.div(d);
                steering.add(difference);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }



    show() {
        strokeWeight(8);
        stroke(1);
        point(this.position.x, this.position.y);

    }

    flocking(bird) {
        this.acceleration.mult(0);
        let alignin = this.squad(bird);
        // let cohes = this.cohesion(bird);
        let seperation = this.seperate(bird);
        this.acceleration.add(seperation);
        this.acceleration.add(alignin);
        // this.acceleration.add(cohes);
    }



    squad(bird) {
        let maxDistance = 50;
        let turn = createVector();
        let count = 0;
        for (let other of bird) {
            let x = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (x < maxDistance && other != this) {
                turn.add(other.velocity);
                count++
            }
        }
        if (count > 0) {
            turn.div(count);
            turn.setMag(this.maxSpeed);
            turn.sub(this.velocity);
            turn.limit(this.maxForce)
        }
        return turn;
    }


    updateBird() {
        this.position.add(this.velocity)
        this.velocity.add(this.acceleration)
    }

}