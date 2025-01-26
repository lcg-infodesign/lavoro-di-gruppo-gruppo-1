/** 
 * GEOGRAFIA DELLE REGIONI
 * Politecnico di Milano - AA 2024/25
 * Design della Comunicazione - Laboratorio di Computer Grafica per l'Information Design
 * 
 * Authors: Bano, Chinni, Lages, Magalhaes, Menoni, Piganzoli, Segato
 * 
 * Questo script carica la rappresentazione grafica usando il framework p5.js
 */

let data;
let expenses;
let color = "white";
let center;

let frameWidth = 0;
let frameHeight = 0;

let selectedRegion = "Tutte le regioni";
let selectedComparison = "Piemonte";
let isComparison = false;

let expensesLength;

let regions = ["Tutte le regioni"];
let categories = [];
let expensesPerCategory = [];
let totalExpenses = 0;

// Create a data struct to store the region name, and for each the category and the amount
let regionDataLastYear = [];

let canvas;

/**
 * Colors
 */
let backgroundColor = "#252129";
let textColor = "#ffffff";
let categoriesColors = ["#F87A01", "#C2858C", "#016647", "#FF467B", "#0001B1", "#7469B5", "#B22F75", "#FFAFD7", "FF040F", "#84B5BC", "#DABC36", "#A69FF2", "#28D3E9", "#6D8C6B",
                        "#F28C9C", "#2FA398", "#F7B429", "#527BFF", "#CFAD7C", "#BDD2FF", "#DFF304", "#EFBE9E", "#FFD459", "#02C3BD", "#B8FFFA", "#A1153E", "#E34516", "#B19B2C", "#FFFFFF"];

/**
 * CLUSTERS
 */
let clusters = [];
let agents = [];

function preload() {
  data = loadTable('assets/dataset/uscite.csv', 'ssv', 'header');
}

function setup() {
  frameWidth = windowWidth * 0.9;
  frameHeight = windowHeight - 230;
  canvas = createCanvas(frameWidth, frameHeight);
  canvas.parent("sketch-container");
  canvas.loadPixels();

  frameRate(60);

  expenses = data.getObject();
  expensesLength = Object.keys(expenses).length;

  // Carico i nomi delle regioni
  for (let i = 0; i < expensesLength; i++) {
    let region = expenses[i]['Regione per Dettaglio'];
    if (!regions.includes(region)) {
      regions.push(region);
    }
  }
  pDrawLabels();

  // Carico le categorie di spesa
  for (let i = 0; i < expensesLength; i++) {
    let category = expenses[i]['Settore'];
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }

  // Eseguo il calcolo dei pallini per ogni categoria di spesa
  for(let i = 0; i < categories.length; i++) {
    let sum = 0;
    for(let j = 0; j < expensesLength; j++) {
      if(expenses[j]['Settore'] == categories[i] && expenses[j]['Anno'] == '2021') {
        try {
          sum += parseInt(expenses[j]['S - Consolidato SPA']);
        }
        catch {
          sum += 0;
        }
      }
    }
    expensesPerCategory.push(sum);
  }

  // Calcolo il totale delle spese
  for(let i = 0; i < expensesPerCategory.length; i++) {
    totalExpenses += expensesPerCategory[i];
  }

  // Ordino i dati dentro all'array dell'ultimo anno
  for(let i = 1; i < regions.length; i++) {
    let region = {
      region: regions[i],
      data: []
    };
    for(let j = 0; j < categories.length; j++) {
      let sum = 0;
      for(let k = 0; k < expensesLength; k++) {
        if(expenses[k]['Regione per Dettaglio'] == regions[i] && expenses[k]['Settore'] == categories[j] && expenses[k]['Anno'] == '2021') {
          try {
            sum += parseInt(expenses[k]['S - Consolidato SPA']);
          }
          catch {
            sum += 0;
          }
        }
      }
      region.data.push({
        category: categories[j],
        amount: sum
      });
    }
    regionDataLastYear.push(region);
  }

  // Popolo l'array dei cluster, creando un cluster per ogni categoria di spesa
  for(let i = 0; i < categories.length; i++) {
    // Calcolo il numero degli agenti
    let agentSum =  floor(expensesPerCategory[i] / 100000000);

    // Calcolo raggio del cluster in base al numero di agenti
    let agentsArea = agentSum * (4 * agentRadius * agentRadius) * 1.1;
    let newRadius = sqrt(agentsArea / PI);
    
    let cluster = {
      center: createVector(random(newRadius, frameWidth - newRadius), random(newRadius, frameHeight - newRadius)),
      color: categoriesColors[i],
      radius: newRadius,
      agentCount: agentSum,
      attractionStrength: 0.3,
      boundaryStiffness: 0.5,
      velocity: createVector(0, 0)
    }
    clusters.push(cluster);
  }

  // Ordino i cluster in base al numero di agenti in ordine decrescente
  clusters.sort((a, b) => b.agentCount - a.agentCount);

  for (let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    // Applico il principio di gravità a tutti i cerchi
    for (let j = 0; j < clusters.length; j++) {
      if (i !== j) {
        let other = clusters[j];
        let force = p5.Vector.sub(other.center, cluster.center);
        let distance = constrain(force.mag(), cluster.radius + other.radius, 200);
        force.setMag(1 / (distance * distance)); // Gravitational force
        cluster.velocity.add(force);
      }
    }

    // Update position with velocity
    cluster.center.add(cluster.velocity);

    // Keep within canvas bounds
    cluster.center.x = constrain(cluster.center.x, cluster.radius, frameWidth - cluster.radius);
    cluster.center.y = constrain(cluster.center.y, cluster.radius, frameHeight - cluster.radius);

    // Collision handling with other circles
    for (let j = 0; j < clusters.length; j++) {
      if (i !== j) {
        let other = clusters[j];
        let overlap = (cluster.radius + other.radius) - dist(cluster.center.x, cluster.center.y, other.center.x, other.center.y);
        if (overlap > 0) {
          let push = p5.Vector.sub(cluster.center, other.center).normalize().mult(overlap / 2);
          cluster.center.add(push);
          other.center.sub(push);
        }
      }
    }

    // Apply damping to slow down velocity
    cluster.velocity.mult(0.95);

    for(let i = 0; i < cluster.agentCount; i++) {
      let angle = random(TWO_PI);
      let radius = random(0, cluster.radius) - agentRadius;
      
      let x = cluster.center.x + cos(angle) * radius;
      let y = cluster.center.y + sin(angle) * radius;
  
      agents.push(new ClusterAgent(x, y, cluster));
    }
  }
  /*
  // Salvo le coordinate del cluster precedente a quello calcolato
  let previousCluster = clusters[0];

  for(let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    // Ridimensiono raggio cluster in base a numero agenti
    let agentsArea = cluster.agentCount * (4 * agentRadius * agentRadius) * 1.1;
    let newRadius = sqrt(agentsArea / PI);
    cluster.radius = newRadius;

    // Se è il primo cluster lo posiziono al centro
    if(i == 0) {
      cluster.center.x = frameWidth / 2;
      cluster.center.y = frameHeight / 2;
    }
    else if(i == 1) {
      // Imposto l'ascissa del cluster completamente a destra di quello precedente
      cluster.center.x = previousCluster.center.x + previousCluster.radius + cluster.radius + 10;
      // Imposto l'ordinata del cluster uguale a quello precedente
      cluster.center.y = previousCluster.center.y;
    }
    else if(i == 2) {
      // Imposto l'ascissa del cluster completamente a sinistra di quella segnata come precedente
      cluster.center.x = previousCluster.center.x - previousCluster.radius - cluster.radius - 10;
      // Imposto l'ordinata del cluster uguale a quello precedente
      cluster.center.y = previousCluster.center.y;
      // Cambio il cluster precedente
      previousCluster = cluster;
    }
    else if (i != 0) {
      // Genero nuove coordinate vicine al cluster precedente
      /*let generatedCoordinates = generateRandomCoordinatesOnOuterCircle(previousCluster.center, cluster.radius + previousCluster.radius + 10);

      // Imposto il centro del cluster
      cluster.center.x = generatedCoordinates.abscissa;
      cluster.center.y = generatedCoordinates.ordinate;

      // Controllo che il cluster non si sovrapponga a cluster esistenti
      for(let attempts = 0; attempts < 100; attempts++) {
        let overlaps = clusters.some(c => 
          c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 5)
        );
        if (overlaps) {
          // Creo un nuovo centro che non esca dal canvas
          generatedCoordinates = generateRandomCoordinatesOnOuterCircle(previousCluster.center, cluster.radius + previousCluster.radius + 10);
          cluster.center.x = generatedCoordinates.abscissa;
          cluster.center.y = generatedCoordinates.ordinate;
        }
        else {
          break;
        }
        if(attempts == 999) {
          cluster.color = [255, 0, 0];
          console.error('Il cluster non ha trovato posto');
        }
      }

      // Cambio il cluster precedente
      previousCluster = cluster;
    }

      // Creo un nuovo centro casuale che non esca dal canvas
      cluster.center.x = random((cluster.radius), frameWidth - (cluster.radius * 2));
      cluster.center.y = random((10 + (cluster.radius * 2)), frameHeight - (cluster.radius * 2));

      // Controllo che il cluster non si sovrapponga a cluster esistenti
      for(let attempts = 0; attempts < 1000; attempts++) {
        let overlaps = clusters.some(c => 
          c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 10)
        );
        if (overlaps) {
          // Creo un nuovo centro che non esca dal canvas
          cluster.center.x = random((cluster.radius), frameWidth - (cluster.radius * 2));
          cluster.center.y = random((10 + (cluster.radius * 2)), frameHeight - (cluster.radius * 2));
        }
        else {
          break;
        }
        if(attempts == 999) {
          cluster.color = [255, 0, 0];
          console.error('Il cluster non ha trovato posto');
        }
      }*/
}

/**
 * Funzione per la generazione di una coordinata casuale sulla circonferenza esterna del cerchio generato dal centro e dal raggio
 * @param {*} center Le coordinate del centro del cluster precedente
 * @param {*} radius La somma tra il raggio del cluster precedente e quello del cluster attuale, con un margine di 10
 * @returns Coordinata casuale sulla circonferenza esterna del cerchio
 */
function generateRandomCoordinatesOnOuterCircle(center, radius) {
  // Creo un il raggio che userò per calcolare la circonferenza esterna
  let leftAbscissaRange = center.x - radius;
  let rightAbscissaRange = center.x + radius;

  // Controllo che l'ascissa sommando il raggio non esca dal canvas
  if(leftAbscissaRange < 0) {
    leftAbscissaRange = center.x + radius;
  }
  if(rightAbscissaRange > frameWidth) {
    rightAbscissaRange = center.x - radius;
  }
  // Trovo una ascissa casuale all'interno del range
  let abscissa = random(leftAbscissaRange, rightAbscissaRange);
  // Calcolo l'ordinata in base all'ascissa
  let ordinate = sqrt(pow(radius, 2) - pow(abscissa - center.x, 2));

  // Calcolo il quadrante in cui si trova il punto
  if(random() < 0.5) {
    ordinate = center.y + ordinate;
  }
  else {
    ordinate = center.y - ordinate;
  }
  
  // Controllo che l'ordinata generata 

  return { abscissa, ordinate };
}

/**
 * Funzione che calcola la distanza tra il centro di due cluster
 * @param a Centro del primo cluster
 * @param b Centro del secondo cluster
 * @returns {number} Distanza tra i due cluster
 */
function clusterDistance(a, b) {
  return dist(a.x, a.y, b.x, b.y);
}

function draw() {
  background(0);

  if (isComparison) {
    drawComparisonView();
  } else {
    drawMainView();
  }

  let currentColor = rgbaToHex(canvas.get(mouseX, mouseY));
  if(currentColor != "#000000") {
    showHover(currentColor);
  }
}

/**
 * Funzione per disegnare la visualizzazione di confronto
 */
function drawComparisonView() {
  let area = windowWidth * 0.40 * (windowHeight - 230);
  let circleArea = area / ((totalExpenses / 100000000) * 1.8);
  let radius = Math.sqrt(circleArea / Math.PI);
  let positionX = radius;
  let positionY = radius;

  for(let i = 0; i < expensesPerCategory.length; i++) {
    for(let j = 0; j < expensesPerCategory[i]; j+= 100000000) {
      if(selectedRegion == "Tutte le regioni") {
        fill(categoriesColors[i]);
      }
      else {
        if(j < regionDataLastYear[regions.indexOf(selectedRegion) - 1].data[i].amount) {
          fill(categoriesColors[i]);
          circle(positionX, positionY, radius * 2);
          positionX += radius * 2;
          if(positionX > windowWidth * 0.40) {
            positionX = radius;
            positionY += radius * 2;
          }
        }
      }
    }
  }

  positionX = radius + windowWidth * 0.50;
  positionY = radius;

  for(let i = 0; i < expensesPerCategory.length; i++) {
    for(let j = 0; j < expensesPerCategory[i]; j+= 100000000) {
      if(j < regionDataLastYear[regions.indexOf(selectedComparison) - 1].data[i].amount) {
        fill(categoriesColors[i]);
        circle(positionX, positionY, radius * 2);
        positionX += radius * 2;
        if(positionX > windowWidth * 0.9) {
          positionX = radius + windowWidth * 0.50;
          positionY += radius * 2;
        }
      }
    }
  }
}

/**
 * Funzione per disegnare i cerchi della visualizzazione principale
 */
function drawMainView() {
  // Disegno i cluster
  clusters.forEach(cluster => {
    fill("grey");
    ellipse(cluster.center.x, cluster.center.y, cluster.radius * 2);
    noFill();
  });
  // Simulation loop
  for (let agent of agents) {
    //agent.applyClusterBehaviors(agents); // TODO: Fare un controllo di fattibilità per vedere se è possibile applicare questa funzione
    //agent.update();
    agent.display();
  }
  /*
  let area = windowWidth * 0.9 * (windowHeight - 230);
  let circleArea = area / ((totalExpenses / 100000000) * 1.8);
  let radius = Math.sqrt(circleArea / Math.PI);

  let positionX = radius;
  let positionY = radius;

  let counter = 0;
  for(let i = 0; i < expensesPerCategory.length; i++) {
    for(let j = 0; j < expensesPerCategory[i]; j+= 100000000) {
      if(selectedRegion == "Tutte le regioni") {
        fill(categoriesColors[i]);
        circle(positionX, positionY, radius * 2);
        counter++;
        positionX += radius * 2;
        if(positionX > windowWidth * 0.9) {
          positionX = radius;
          positionY += radius * 2;
        }
      }
      else {
        if(j < regionDataLastYear[regions.indexOf(selectedRegion) - 1].data[i].amount) {
          fill(categoriesColors[i]);
          circle(positionX, positionY, radius * 2);
          counter++;
          positionX += radius * 2;
          if(positionX > windowWidth * 0.9) {
            positionX = radius;
            positionY += radius * 2;
          }
        }
      }
    }
  }
    */
}

/**
 * Funzione per convertire l'array contenente i valori rgba nel codice esadecimale
 * @param {*} rgba Array contenente [0] = r, [1] = g, [2] = b, [3] = a
 * @returns Codice esadecimale
 */
function rgbaToHex(rgba) {
  let hex = '#';
  
  for(let i = 0; i < 3; i++) {
    let menoSignificativo = parseInt(rgba[i]) % 16;
    let piuSignificativo = parseInt(parseInt(rgba[i]) / 16);

    hex += piuSignificativo.toString(16);
    hex += menoSignificativo.toString(16);
  }

  return hex.toUpperCase();
}

/**
 * Funzione per far comparire il rettangolo dell'hover sulle categorie
 * @param {string} hexColor Colore della categoria
 */
function showHover(hexColor) {
  let indexHovered = categoriesColors.indexOf(hexColor);
  let category = categories[indexHovered];

  if(category == undefined) {
    return;
  }
  // Calcolo la lunghezza del rettangolo
  let textLength = textWidth(category);

  push();
  fill(backgroundColor);
  stroke("white");
  rect(mouseX + 5, mouseY - 55, textLength+20, 50);
  noStroke();
  fill("white");
  text(category, mouseX + 15, mouseY - 30);
  pop();
}

