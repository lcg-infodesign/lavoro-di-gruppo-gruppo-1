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

let agentRadius = 3;
  
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
        this.radius = agentRadius;

        // Color management
        this.baseColor = cluster.color;

        // Friction coefficient
        this.friction = 0.2; // Less than 1 for gradual slowdown, 1 means no friction
    }

    display() {
        noStroke();
        fill(this.baseColor);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}