/** 
 * GEOGRAFIA DELLE REGIONI
 * Politecnico di Milano - AA 2024/25
 * Design della Comunicazione - Laboratorio di Computer Grafica per l'Information Design
 * 
 * Authors: Bano, Chinni, Lages, Magalhaes, Menoni, Piganzoli, Segato
 * 
 * Questo script crea il sistema di cluster per la visualizzazione delle spese
 * 
 * Formato dei dati che compongono un cluster:
 * center: { x: 250, y: 250 },
    color: [70, 130, 210],    // Soft Blue
    radius: 100,              // Cluster containment radius
    agentCount: 29,           // Fixed agent count of 29
    attractionStrength: 0.3,  // Force pulling agents to cluster center
    boundaryStiffness: 0.5    // Strength of boundary enforcement
 */

let agentRadius = 1; // Valore di default per il raggio degli agenti
  
class ClusterClass {
    constructor(cluster) {
        this.homeCluster = cluster;
        this.baseColor = cluster.color;

        this.position = createVector(cluster.center.x, cluster.center.y);
    }

    display() {
        noStroke();
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}

class ParticleClass {
    constructor(parentCluster) {
        // Generate a random position within the parent cluster
        let posRadius = random(0, parentCluster.radius);
        let angle = random(TWO_PI);
        let x = parentCluster.center.x + cos(angle) * posRadius;
        let y = parentCluster.center.y + sin(angle) * posRadius;
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector(0, 0);
        this.parent = parentCluster;
        this.radius = agentRadius;
        this.maxSpeed = 1;
        this.maxForce = 0.1;
        this.friction = 1;
    }
  
    applyBehaviors(particles) {
        let centerAttraction = this.attractToParentCenter();
        //let separation = this.separate(particles);
        let boundaryForce = this.stayInParent();
    
        centerAttraction.mult(0.5);
        //separation.mult(0.1);  // Increased separation force
        boundaryForce.mult(0.1);
    
        //this.acceleration.add(centerAttraction);
        //this.acceleration.add(separation);
        this.acceleration.add(boundaryForce);
    }
  
    attractToParentCenter() {
        let parentPosition = createVector(this.parent.center.x, this.parent.center.y);
        let desired = p5.Vector.sub(parentPosition, this.position);
        let d = desired.mag();
        let strength = map(d, 0, this.parent.radius, 0, this.maxSpeed);
        desired.normalize();
        desired.mult(strength);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
  
    separate(particles) {
        let desiredSeparation = this.radius;  // Increased separation distance
        let sum = createVector(0, 0);
        let count = 0;
    
        for (let other of particles) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < desiredSeparation) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                // Stronger repulsion for very close particles
                let strength = map(d, 0, desiredSeparation, 3, 0.5);
                diff.mult(strength);
                sum.add(diff);
                count++;
            }
        }
  
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed * 1.5);  // Increased separation speed
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce * 2);  // Allow stronger separation force
            return steer;
        }
        return createVector(0, 0);
    }
  
    stayInParent() {
        let outerParentPosition = createVector(this.parent.center.x, this.parent.center.y);
        let d = p5.Vector.dist(this.position, outerParentPosition);
        if (d > this.parent.radius) {
            let parentPosition = createVector(this.parent.center.x, this.parent.center.y);
            let desired = p5.Vector.sub(parentPosition, this.position);
            desired.normalize();
            desired.mult(this.maxSpeed * 1.5);
            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxForce * 1.5);
            return steer;
        }
        return createVector(0, 0);
    }
  
    update() {
        this.velocity.add(this.acceleration);
        this.velocity.mult(0.99);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }
  
    display() {
        fill(this.parent.color);
        noStroke();
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
  }