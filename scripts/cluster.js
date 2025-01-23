/**
 * center: { x: 250, y: 250 },
    color: [70, 130, 210],    // Soft Blue
    radius: 100,              // Cluster containment radius
    agentCount: 29,           // Fixed agent count of 29
    attractionStrength: 0.3,  // Force pulling agents to cluster center
    boundaryStiffness: 0.5    // Strength of boundary enforcement
 */
  
  class ClusterAgent {
    constructor(x, y, cluster) {
        // Position management
        this.homeCluster = cluster;
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
  
        // Movement constraints
        this.maxSpeed = 2;
        this.maxForce = 0.1;
        this.radius = 8;  // Random radius for variation
  
        // Color management
        this.baseColor = cluster.color;
        //this.currentColor = [...this.baseColor];
  
        // Friction coefficient
        this.friction = 0.2; // Less than 1 for gradual slowdown, 1 means no friction
    }
  
    // Advanced cluster-based force calculation
    applyClusterBehaviors(agents) {
        let clusterCenterAttraction = this.attractToClusterCenter();
        let separationForce = this.calculateSeparation(agents);
        let boundaryConstraint = this.enforceClusterBoundary();
  
        // Weighted force application
        clusterCenterAttraction.mult(this.homeCluster.attractionStrength);
        separationForce.mult(1);
        boundaryConstraint.mult(this.homeCluster.boundaryStiffness);
  
        // Accumulate forces
        this.acceleration.add(clusterCenterAttraction);
        this.acceleration.add(separationForce);
        this.acceleration.add(boundaryConstraint);
    }
  
    // Strong attraction to cluster center
    attractToClusterCenter() {
        let clusterCenter = createVector(this.homeCluster.center.x, this.homeCluster.center.y);
        let desired = p5.Vector.sub(clusterCenter, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
  
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce * 2);  // Stronger attraction force
        return steer;
    }
  
    // Sophisticated separation mechanism
    calculateSeparation(agents) {
        let desiredSeparation = this.radius * 2.5;
        let steer = createVector(0, 0);
        let count = 0;
  
        for (let other of agents) {
        // Only separate from agents in the same cluster
        if (other.homeCluster === this.homeCluster) {
            let distance = p5.Vector.dist(this.position, other.position);
            
            if (distance > 0 && distance < desiredSeparation) {
            let diff = p5.Vector.sub(this.position, other.position);
            diff.normalize();
            diff.div(distance);  // Force inversely proportional to distance
            steer.add(diff);
            count++;
            }
        }
        }
  
        if (count > 0) {
        steer.div(count);
        steer.normalize();
        steer.mult(this.maxSpeed);
        steer.sub(this.velocity);
        steer.limit(this.maxForce * 2);  // Greater separation force
        }
  
        return steer;
    }
  
    // Strong boundary enforcement
    enforceClusterBoundary() {
        let clusterCenter = createVector(this.homeCluster.center.x, this.homeCluster.center.y);
        let distanceFromCenter = p5.Vector.dist(this.position, clusterCenter);
        let clusterRadius = this.homeCluster.radius;
  
        // If agent is outside cluster radius, apply strong return force
        if (distanceFromCenter > clusterRadius) {
        let returnForce = p5.Vector.sub(clusterCenter, this.position);
        returnForce.normalize();
        returnForce.mult((distanceFromCenter - clusterRadius) * 0.5);
        return returnForce;
        }
  
        return createVector(0, 0);
    }
  
    // Update and rendering methods
    update() {
        // Apply friction: slow down the velocity over time
        this.velocity.mult(this.friction);
  
        // Apply acceleration to velocity
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
  
        // Reset acceleration
        this.acceleration.mult(0);
    }
  
    display() {
        stroke(150);
        noFill();
        // Slight color variation within cluster
        
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
  }

  // Funzione per creare un cluster
  function createCluster(centerX, centerY, color, radius, attractionStrength, boundaryStiffness, agentCount) {
    return {
        center: { x: centerX, y: centerY },
        color: color,
        radius: radius,
        agentCount: agentCount,
        attractionStrength: attractionStrength,
        boundaryStiffness: boundaryStiffness
    };
  }
  