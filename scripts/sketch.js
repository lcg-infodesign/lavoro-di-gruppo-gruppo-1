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
  canvas = createCanvas(windowWidth * 0.9, windowHeight - 230);
  canvas.parent("sketch-container");
  canvas.loadPixels();

  //frameRate(60);
  noLoop();

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

  // Eseguo il calcolo dei pallini per ogi categoria di spesa
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
    let cluster = {
      center: { x: random(100, windowWidth - 100), y: random(100, windowHeight - 100) },
      color: [70, 130, 210],
      radius: 100,
      agentCount: floor(expensesPerCategory[i] / 100000000),
      attractionStrength: 0.3,
      boundaryStiffness: 0.5
    }
    clusters.push(new ClusterAgent(250, 250, cluster));
  }

  let sum = 0;
  clusters.forEach(cluster => {
    for (let i = 0; i < cluster.homeCluster.agentCount; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        let angle = random(TWO_PI);
        let radius = random(0, cluster.radius * 0.8);
        
        let x = cluster.homeCluster.center.x + cos(angle) * radius;
        let y = cluster.homeCluster.center.y + sin(angle) * radius;
        
        // Check for overlap with existing agents
        let overlaps = agents.some(agent => 
          p5.Vector.dist(createVector(x, y), agent.position) < agent.radius * 2
        );
        
        if (!overlaps) {
          agents.push(new ClusterAgent(x, y, cluster));
          placed = true;
        }
        sum++;
        attempts++;
      }
    }
  });
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
  // Simulation loop
  for (let agent of agents) {
    agent.applyClusterBehaviors(agents);
    agent.update();
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