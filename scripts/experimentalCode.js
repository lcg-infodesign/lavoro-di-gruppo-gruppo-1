const SYSTEM_CONFIGURATION = {
    canvasSize: {
      width: 800,
      height: 800
    },
    largeClusterCount: 29,
    totalParticles: 11720,
    mainAreaRadius: 500,
    clusterSizes: [
      // Using square root of particle count to determine relative radius for visual balance
      { radius: 65, particleCount: 1160, name: "Amministrazione Generale" },     // 1
      { radius: 25, particleCount: 142, name: "Difesa" },                       // 2
      { radius: 28, particleCount: 183, name: "Sicurezza pubblica" },           // 3
      { radius: 20, particleCount: 64, name: "Giustizia" },                     // 4
      { radius: 45, particleCount: 528, name: "Istruzione" },                   // 5
      { radius: 10, particleCount: 10, name: "Formazione" },                    // 6
      { radius: 22, particleCount: 83, name: "Ricerca e Sviluppo" },           // 7
      { radius: 24, particleCount: 116, name: "Cultura e servizi ricreativi" }, // 8
      { radius: 18, particleCount: 49, name: "Edilizia abitativa" },           // 9
      { radius: 68, particleCount: 1290, name: "Sanità" },                     // 10
      { radius: 55, particleCount: 873, name: "Interventi sociali" },          // 11
      { radius: 24, particleCount: 106, name: "Servizio Idrico" },             // 12
      { radius: 20, particleCount: 60, name: "Ambiente" },                     // 13
      { radius: 24, particleCount: 115, name: "Smaltimento Rifiuti" },         // 14
      { radius: 10, particleCount: 9, name: "Altri interventi sanitari" },     // 15
      { radius: 40, particleCount: 440, name: "Lavoro" },                      // 16
      { radius: 85, particleCount: 3237, name: "Previdenza" },                 // 17
      { radius: 38, particleCount: 354, name: "Altri trasporti" },             // 18
      { radius: 27, particleCount: 171, name: "Viabilità" },                   // 19
      { radius: 24, particleCount: 109, name: "Telecomunicazioni" },           // 20
      { radius: 16, particleCount: 37, name: "Agricoltura" },                  // 21
      { radius: 8, particleCount: 3, name: "Pesca" },                         // 22
      { radius: 22, particleCount: 79, name: "Turismo" },                     // 23
      { radius: 21, particleCount: 70, name: "Commercio" },                   // 24
      { radius: 38, particleCount: 354, name: "Industria e Artigianato" },    // 25
      { radius: 65, particleCount: 1148, name: "Energia" },                   // 26
      { radius: 6, particleCount: 1, name: "Altre opere pubbliche" },         // 27
      { radius: 40, particleCount: 387, name: "Altre in campo economico" },   // 28
      { radius: 45, particleCount: 526, name: "Oneri non ripartibili" }       // 29
    ]
  };
  
  class Particle {
    constructor(x, y, parentCluster) {
      this.position = createVector(x, y);
      this.velocity = createVector(random(-1, 1), random(-1, 1));
      this.acceleration = createVector(0, 0);
      this.parent = parentCluster;
      this.radius = 1.5;  // Slightly larger for better separation
      this.maxSpeed = 1;
      this.maxForce = 0.1;
      this.friction = 1;
    }
  
    applyBehaviors(particles) {
      let centerAttraction = this.attractToParentCenter();
      let separation = this.separate(particles);
      let boundaryForce = this.stayInParent();
  
      centerAttraction.mult(0.3);
      separation.mult(0.8);  // Increased separation force
      boundaryForce.mult(0.8);
  
      this.acceleration.add(centerAttraction);
      this.acceleration.add(separation);
      this.acceleration.add(boundaryForce);
    }
  
    attractToParentCenter() {
      let desired = p5.Vector.sub(this.parent.position, this.position);
      let d = desired.mag();
      let strength = map(d, 0, this.parent.radius, 0, this.maxSpeed);
      desired.normalize();
      desired.mult(strength);
      let steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    }
  
    separate(particles) {
      let desiredSeparation = this.radius * 4;  // Increased separation distance
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
      let d = p5.Vector.dist(this.position, this.parent.position);
      if (d > this.parent.radius * 0.8) {
        let desired = p5.Vector.sub(this.parent.position, this.position);
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
      fill(255, 255, 255, 100);
      noStroke();
      ellipse(this.position.x, this.position.y, this.radius * 2);
    }
  }
  
  class LargeCluster {
    constructor(x, y, config) {
      this.position = createVector(x, y);
      this.velocity = createVector(random(-1, 1), random(-1, 1));
      this.acceleration = createVector(0, 0);
      this.radius = config.radius;
      this.particleCount = config.particleCount;
      this.particles = [];
      this.maxSpeed = 0.5;
      this.maxForce = 0.05;
      
      this.initializeParticles();
    }
  
    initializeParticles() {
      let attempts = 0;
      let maxAttempts = 1000;
      
      while (this.particles.length < this.particleCount && attempts < maxAttempts) {
        let angle = random(TWO_PI);
        let r = sqrt(random(1)) * (this.radius * 0.8);  // Square root for uniform distribution
        let px = this.position.x + cos(angle) * r;
        let py = this.position.y + sin(angle) * r;
        
        // Check for overlap with existing particles
        let overlapping = false;
        for (let particle of this.particles) {
          let d = dist(px, py, particle.position.x, particle.position.y);
          if (d < 4) {  // Minimum spacing between particles
            overlapping = true;
            break;
          }
        }
        
        if (!overlapping) {
          this.particles.push(new Particle(px, py, this));
        }
        
        attempts++;
      }
    }
  
    applyBehaviors(clusters) {
      let separation = this.separate(clusters);
      let attraction = this.attract(clusters);
      let boundaryForce = this.stayInBounds();
      
      // Increase separation force to ensure no overlap
      separation.mult(1.5);  // Stronger separation
      attraction.mult(0.3);  // Gentle attraction
      boundaryForce.mult(0.8);
      
      this.acceleration.add(separation);
      this.acceleration.add(attraction);
      this.acceleration.add(boundaryForce);
    }
  
    attract(clusters) {
      let desiredAttraction = this.radius * 4; // Distance at which attraction starts
      let maxAttractionDist = this.radius * 8; // Maximum distance for attraction
      let sum = createVector(0, 0);
      let count = 0;
  
      for (let other of clusters) {
        if (this === other) continue;
        
        let d = p5.Vector.dist(this.position, other.position);
        let minSeparation = (this.radius + other.radius) * 1.1; // Minimum allowed distance
        
        // Only attract if we're not too close and not too far
        if (d > minSeparation && d < maxAttractionDist) {
          let diff = p5.Vector.sub(other.position, this.position);
          diff.normalize();
          
          // Attraction strength decreases with distance
          let strength = map(d, minSeparation, maxAttractionDist, 0.5, 0);
          diff.mult(strength);
          sum.add(diff);
          count++;
        }
      }
  
      if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxSpeed);
        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxForce);
        return steer;
      }
      return createVector(0, 0);
    }
  
    separate(clusters) {
      let sum = createVector(0, 0);
      let count = 0;
  
      for (let other of clusters) {
        if (this === other) continue;
        
        let minSeparation = (this.radius + other.radius) * 1.1; // Minimum allowed distance
        let d = p5.Vector.dist(this.position, other.position);
        
        // Strong separation when too close
        if (d < minSeparation) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.normalize();
          // Exponential separation force when very close
          let strength = map(d, 0, minSeparation, 3, 0.5);
          strength = pow(strength, 2); // Exponential increase in force
          diff.mult(strength);
          sum.add(diff);
          count++;
        }
      }
  
      if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxSpeed * 1.5); // Increased speed for separation
        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxForce * 2); // Stronger force limit for separation
        return steer;
      }
      return createVector(0, 0);
    }
  
    stayInBounds() {
      let center = createVector(width/2, height/2);
      let d = p5.Vector.dist(this.position, center);
      
      if (d > SYSTEM_CONFIGURATION.mainAreaRadius - this.radius) {
        let desired = p5.Vector.sub(center, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
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
  
      for (let particle of this.particles) {
        particle.applyBehaviors(this.particles);
        particle.update();
      }
    }
  
    display() {
      stroke(70, 130, 210, 50);
      noFill();
      ellipse(this.position.x, this.position.y, this.radius * 2);
      
      for (let particle of this.particles) {
        particle.display();
      }
    }
  }
  
  let largeClusters = [];
  
  function setup() {
    createCanvas(SYSTEM_CONFIGURATION.canvasSize.width, SYSTEM_CONFIGURATION.canvasSize.height);
    
    // Distribute clusters in a circle with some randomization
    for (let i = 0; i < SYSTEM_CONFIGURATION.largeClusterCount; i++) {
      let angle = (TWO_PI / SYSTEM_CONFIGURATION.largeClusterCount) * i;
      // Add some randomness to the radius while keeping clusters within bounds
      let radiusVariation = random(0.4, 0.6);
      let r = SYSTEM_CONFIGURATION.mainAreaRadius * radiusVariation;
      let x = width/2 + cos(angle) * r;
      let y = height/2 + sin(angle) * r;
      
      // Use the predefined cluster configuration
      let clusterConfig = SYSTEM_CONFIGURATION.clusterSizes[i];
      largeClusters.push(new LargeCluster(x, y, clusterConfig));
    }
  }
  
  function draw() {
    background(20, 20, 40);
    
    stroke(70, 130, 210, 30);
    noFill();
    ellipse(width/2, height/2, SYSTEM_CONFIGURATION.mainAreaRadius * 2);
    
    for (let cluster of largeClusters) {
      cluster.applyBehaviors(largeClusters);
      cluster.update();
      cluster.display();
    }
  }