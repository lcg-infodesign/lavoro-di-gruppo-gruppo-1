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
const GRAVITY_STRENGTH = 0.1;

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
let leftComparisonClusters = [];
let rightComparisonClusters = [];

/**
 * AGENTS
 */
let agents = [];
let leftComparisonAgents = [];
let rightComparisonAgents = [];

function preload() {
  data = loadTable('assets/dataset/uscite.csv', 'ssv', 'header');

}

function setup() {
  agentRadius = (3 * windowWidth * 0.9) / 1700;
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
      center: { x: -200, y: -200 },
      color: categoriesColors[i],
      radius: newRadius,
      agentCount: agentSum,
      attractionStrength: 0.3,
      boundaryStiffness: 0.5
    }
    clusters.push(cluster);
    leftComparisonClusters.push(structuredClone(cluster));
    rightComparisonClusters.push(structuredClone(cluster));
  }

  // Ordino i cluster in base al numero di agenti in ordine decrescente
  clusters.sort((a, b) => b.agentCount - a.agentCount);
  rightComparisonClusters.sort((a, b) => b.agentCount - a.agentCount);
  
  // Salvo le coordinate del cluster precedente a quello calcolato
  let centralCluster = clusters[0];

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
    else {
      // Genero nuove coordinate vicine al cluster centrale
      let generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster);

      // Imposto il centro del cluster
      cluster.center.x = generatedCoordinates.abscissa;
      cluster.center.y = generatedCoordinates.ordinate;

      // Controllo che il cluster non si sovrapponga a cluster esistenti
      for(let attempts = 0; attempts < 1000; attempts++) {
        let overlaps = clusters.some(c => 
          c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 5)
        );
        if (overlaps) {
          // Creo un nuovo centro che non esca dal canvas
          generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster);
          cluster.center.x = generatedCoordinates.abscissa;
          cluster.center.y = generatedCoordinates.ordinate;
        }
        else {
          break;
        }

        if(attempts == 999) {
          // Seleziono randomicamente un altro cluster come cluster centrale
          let randomVar = floor(random(1, i));
          centralCluster = clusters[randomVar];
          generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster);

          // Imposto il centro del cluster
          cluster.center.x = generatedCoordinates.abscissa;
          cluster.center.y = generatedCoordinates.ordinate;

          // Controllo che il cluster non si sovrapponga a cluster esistenti
          for(let subAttempts = 0; subAttempts < 100; subAttempts++) {
            let overlaps = clusters.some(c => 
              c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 5)
            );
            if (overlaps && subAttempts < 99) {
              // Creo un nuovo centro che non esca dal canvas
              generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster);
              cluster.center.x = generatedCoordinates.abscissa;
              cluster.center.y = generatedCoordinates.ordinate;
            }
            else if(overlaps && subAttempts == 99) {
              cluster.center.x = -200;
              cluster.center.y = -200;
              centralCluster = clusters[0];
              break;
            }
            else {
              centralCluster = clusters[0];
              break;
            }
          }
        }
      }
    }
    // Aggiungo i pallini dei cluster
    for(let i = 0; i < cluster.agentCount; i++) {
      agents.push(new ParticleClass(cluster));
    }
  }
}


/**
 * Funzione per la generazione di una coordinata casuale sulla circonferenza esterna del cerchio generato dal centro e dal raggio
 * L'algoritmo non deve mai far uscire dal range del valore maggiore e minore della y del cluster centrale
 * @param {*} center Le coordinate del centro del cluster centrale
 * @param {*} radius La somma tra il raggio del cluster centrale e quello del cluster attuale, con un margine di 10
 * @param {number} comparisonMode 0 = visualizzazione principale, no comparison - 1 = visualizzazione di confronto, calcolo per l'area sinistra - 2 = visualizzazione di confronto, calcolo per l'area destra
 * @returns Coordinata casuale sulla circonferenza esterna del cerchio
 */
function generateRandomCoordinatesOnOuterCircle(centralCluster, cluster, comparisonMode = 0) {
  // Creo un raggio sommando quello del cluster centrale e quello del cluster attuale
  let totalRadius = centralCluster.radius + cluster.radius + 10;
  const minY = centralCluster.center.y - centralCluster.radius; // Punto più basso del cluster centrale
  const maxY = centralCluster.center.y + centralCluster.radius; // Punto più alto del cluster centrale

  if(comparisonMode == 0) {
    // Controllo se il total radius, partendo dal centro del cluster centrale, esce dal canvas
    if(centralCluster.center.x - totalRadius < 0 || centralCluster.center.x + totalRadius > frameWidth) {
      // Non esce dal canvas, cerco posizione randomica calcolando l'ascissa massima e minima
      let leftAbscissaRange = centralCluster.center.x - totalRadius;
      let rightAbscissaRange = centralCluster.center.x + totalRadius;

      // Controllo che l'ascissa sommando il raggio non esca dal canvas
      if(leftAbscissaRange < 0) {
        leftAbscissaRange = centralCluster.center.x + centralCluster.radius;
      }
      if(rightAbscissaRange > frameWidth) {
        rightAbscissaRange = centralCluster.center.x - centralCluster.radius;
      }

      // Trovo una ascissa casuale all'interno del range
      let abscissa = random(leftAbscissaRange, rightAbscissaRange);
      // Calcolo l'ordinata in base all'ascissa
      let ordinate = sqrt(pow(cluster.radius, 2) - pow(abscissa - centralCluster.center.x, 2));

      // Calcolo il quadrante in cui si trova il punto
      if(random() < 0.5) {
        ordinate = centralCluster.center.y + ordinate;
      }
      else {
        ordinate = centralCluster.center.y - ordinate;
      }
      return { abscissa, ordinate };
    }
    else {
      // Esce dal canvas, cerco posizione che abbia ordinate tra minY e maxY
      const centerDY = Math.random() * (maxY - minY) + minY;

      // Calcola la distanza orizzontale dall'asse X per rispettare il raggio totale
      const deltaX = Math.sqrt(Math.pow(totalRadius, 2) - Math.pow(centerDY - centralCluster.center.y, 2));

      // Decidi casualmente se andare a sinistra o a destra del centro del cluster centrale
      const direction = Math.random() < 0.5 ? -1 : 1;
      const centerDX = centralCluster.center.x + direction * deltaX;

      return { abscissa: centerDX, ordinate: centerDY };
    }
  }
  else {
    // Controllo che il total radius a partire dal centro non esca dalla metà sinistra del canvas
    if(centralCluster.center.x - totalRadius > 0 && centralCluster.center.x + totalRadius < frameWidth / 2) {
      // Non esce dal canvas, cerco posizione randomica calcolando l'ascissa massima e minima
      let leftAbscissaRange = centralCluster.center.x - totalRadius;
      let rightAbscissaRange = centralCluster.center.x + totalRadius;

      // Controllo che l'ascissa sommando il raggio non esca dal canvas
      if(leftAbscissaRange < 0) {
        leftAbscissaRange = centralCluster.center.x + centralCluster.radius;
      }
      if(rightAbscissaRange > frameWidth / 2) {
        rightAbscissaRange = centralCluster.center.x - centralCluster.radius;
      }

      // Trovo una ascissa casuale all'interno del range
      let abscissa = random(leftAbscissaRange, rightAbscissaRange);
      let squaredDistance = Math.pow(cluster.radius, 2) - Math.pow(abscissa - centralCluster.center.x, 2);
      // Assicurati che squaredDistance non sia negativo (gestisce errori di precisione)
      if (squaredDistance < 0) {
        squaredDistance = 0; // Imposta a 0 se è leggermente negativo
      }
      let ordinate = Math.sqrt(squaredDistance);

      // Calcolo il quadrante in cui si trova il punto
      if(random() < 0.5) {
        ordinate = centralCluster.center.y + ordinate;
      }
      else {
        ordinate = centralCluster.center.y - ordinate;
      }
      return { abscissa, ordinate };
    }
    else {
      // Esce dal canvas, cerco posizione che abbia ordinate tra minY e maxY
      const centerDY = Math.random() * (maxY - minY) + minY;

      // Calcola la distanza orizzontale dall'asse X per rispettare il raggio totale
      const deltaX = Math.sqrt(Math.pow(totalRadius, 2) - Math.pow(centerDY - centralCluster.center.y, 2));

      // Decidi casualmente se andare a sinistra o a destra del centro del cluster centrale
      const direction = Math.random() < 0.5 ? -1 : 1;
      const centerDX = centralCluster.center.x + direction * deltaX;

      return { abscissa: centerDX, ordinate: centerDY };
    }
  }
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
  background(backgroundColor);

  if (isComparison) {
    drawComparisonView();
  } else {
    drawMainView();
  }
  
  showHover();
}

/**
 * Funzione per disegnare la visualizzazione di confronto
 */
function drawComparisonView() {
  /** Visualizzazione di sinistra */
  

  // Disegno i cluster
  for(let i = 0; i < leftComparisonClusters.length; i++) {
    let cluster = leftComparisonClusters[i];
    //console.log(cluster.center);
    // Disegno il cluster
    fill("red");
    ellipse(cluster.center.x, cluster.center.y, cluster.radius * 2);
    noFill();
  }

  /** Visualizzazione di destra */
  rightComparisonClusters.forEach(cluster => {
    fill("green");
    ellipse(cluster.center.x, cluster.center.y, cluster.radius * 2);
    noFill();
  });
  
}

/**
 * Funzione per calcolare i cluster di sinistra nella visualizzazione di confronto
 */
function calculateLeftComparisonClusters() {
  for(let i = 0; i < leftComparisonClusters.length; i++) {
    let cluster = leftComparisonClusters[i];
    // Calcolo il numero di agenti al suo interno per la regione selezionata
    let regionIndex = regions.indexOf(selectedRegion) - 1;
    let agentSum = 0;
    // Calcolo gli agenti della categoria i per la regione selezionata
    if(regionIndex >= 0) {
      agentSum = floor(regionDataLastYear[regionIndex].data[i].amount / 100000000);
    }
    else {
      agentSum = 0;
    }
    cluster.agentCount = agentSum;

    // Ridimensiono raggio cluster in base a numero agenti
    let agentsArea = cluster.agentCount * (4 * agentRadius * agentRadius) * 1.1;
    let newRadius = sqrt(agentsArea / PI);
    cluster.radius = newRadius;
  }

  // Riordino i cluster in base al numero di agenti
  leftComparisonClusters.sort((a, b) => b.agentCount - a.agentCount);
  let centralCluster = leftComparisonClusters[0];
  centralCluster.center.x = frameWidth / 4;
  centralCluster.center.y = frameHeight / 2;

  // Cambio le coordinate di ogni cluster per rimanere a sinistra e non sovrapporsi
  for(let i = 1; i < leftComparisonClusters.length; i++) {
    let cluster = leftComparisonClusters[i];
    if(i == 0) {
      cluster.center.x = frameWidth / 4;
      cluster.center.y = frameHeight / 2;
    }
    else {
      // Genero nuove coordinate vicine al cluster centrale
      let generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster, 1);

      // Imposto il centro del cluster
      cluster.center.x = generatedCoordinates.abscissa;
      cluster.center.y = generatedCoordinates.ordinate;

      // Controllo che il cluster non si sovrapponga a cluster esistenti
      for(let attempts = 0; attempts < 1000; attempts++) {
        let overlaps = clusters.some(c => 
          c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 5)
        );
        if (overlaps) {
          // Creo un nuovo centro che non esca dal canvas
          generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster, 1);
          cluster.center.x = generatedCoordinates.abscissa;
          cluster.center.y = generatedCoordinates.ordinate;
        }
        else {
          break;
        }

        if(attempts == 999) {
          // Seleziono randomicamente un altro cluster come cluster centrale
          let randomVar = floor(random(1, i));
          centralCluster = clusters[randomVar];
          generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster, 1);

          // Imposto il centro del cluster
          cluster.center.x = generatedCoordinates.abscissa;
          cluster.center.y = generatedCoordinates.ordinate;

          // Controllo che il cluster non si sovrapponga a cluster esistenti
          for(let subAttempts = 0; subAttempts < 100; subAttempts++) {
            let overlaps = clusters.some(c => 
              c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 5)
            );
            if (overlaps && subAttempts < 99) {
              // Creo un nuovo centro che non esca dal canvas
              generatedCoordinates = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster, 1);
              cluster.center.x = generatedCoordinates.abscissa;
              cluster.center.y = generatedCoordinates.ordinate;
            }
            else if(overlaps && subAttempts == 99) {
              cluster.center.x = -200;
              cluster.center.y = -200;
              centralCluster = clusters[0];
              break;
            }
            else {
              centralCluster = clusters[0];
              break;
            }
          }
        }
      }
    }
  }
}

/**
 * Funzione per calcolare i cluster di destra nella visualizzazione di confronto
 */
function calculateRightComparisonClusters() {
  // Cambio la posizione dei cluster per rimanere nella parte destra del canvas
  let minLeft = frameWidth / 2;
  let maxRight = frameWidth;

  // Adatto la posizione dei cluster di sinistra
  for(let i = 0; i < rightComparisonClusters.length; i++) {
    let cluster = rightComparisonClusters[i];
    let newCenter = { x: random(minLeft, maxRight), y: random(0, frameHeight) };
    cluster.center = newCenter;
  }
}

/**
 * Funzione per disegnare i cerchi della visualizzazione principale
 */
function drawMainView() {
  // Disegno i cluster
  clusters.forEach(cluster => {
    noFill();
    ellipse(cluster.center.x, cluster.center.y, cluster.radius * 2);
    noFill();
  });

  let selectedRegionIndex = regions.indexOf(selectedRegion);

  // Salvo il colore del cluster precedente
  let previousColor = agents[0].parent.color;
  let amountSum = 0;
  let currentCategory = 0;
  let currentCategoryAmount = regionDataLastYear[selectedRegionIndex].data[0].amount;
  for(let i = 0; i < agents.length; i++) {
    let agent = agents[i];
    agent.applyBehaviors(agents);
    agent.update();
    // Controllo che l'agente sia da colorare o no
    if(selectedRegion == "Tutte le regioni") {
      agent.setColored(true);
    }
    else {
      if(amountSum < currentCategoryAmount) {
        agent.setColored(true);
        amountSum += 100000000;
      }
      else {
        agent.setColored(false);
        amountSum += 100000000;
        if(amountSum >= expensesPerCategory[currentCategory]) {
          currentCategory++;
          currentCategoryAmount = regionDataLastYear[selectedRegionIndex - 1].data[currentCategory].amount;
          amountSum = 0;
        }
      }
      previousColor = agent.parent.color;
    }
    agent.display();
  }
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
 */
function showHover() {
  let mouseCoordinates = createVector(mouseX, mouseY);

  // Trovo il cerchio in cui si trova il mouse
  let selectedCluster = null;
  for(let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    if(dist(mouseCoordinates.x, mouseCoordinates.y, cluster.center.x, cluster.center.y) < cluster.radius) {
      selectedCluster = cluster;
      break;
    }
  }

  // Se il mouse è sopra un cerchio
  if(selectedCluster != null) {
    let category = categories[clusters.indexOf(selectedCluster)];
    let textLength = textWidth(category);
    
    push();
    fill(37, 33, 41);
    stroke(79, 79, 79);
    rect(mouseX + 5, mouseY - 55, (3/2)*textLength+36, 60, 10);
    noStroke();
    fill("white");
    textSize(18);
    text(category, mouseX + 23, mouseY - 18);
    pop();
  }
}