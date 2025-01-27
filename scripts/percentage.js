/**
 * GEOGRAFIA DELLE REGIONI
 * Politecnico di Milano - AA 2024/25
 * Design della Comunicazione - Laboratorio di Computer Grafica per l'Information Design
 * 
 * Authors: Bano, Chinni, Lages, Magalhaes, Menoni, Piganzoli, Segato
 * 
 * Questo script carica tutti gli elementi grafici della pagina, ad eccezione della rappresentazione grafica al centro
 */

/**
 * Funzione per rappresentare i label delle regioni dopo che sono state caricate dallo sketch
 */
function pDrawLabels() {
    // Salvo il div che conterrà i label delle regioni
    let pRegionsDropdown = document.getElementById('regions-dropdown');
    // Salvo il div che conterrà i label delle regioni per il confronto
    let pComparisonDropdown = document.getElementById('comparison-dropdown');

    // Creo un option per ogni regione
    for (let i = 0; i < regions.length; i++) {
        let pRegionLabel = document.createElement('option');
        pRegionLabel.innerHTML = regions[i];
        pRegionLabel.value = regions[i];
        pRegionLabel.classList.add('region-label');
        pRegionsDropdown.appendChild(pRegionLabel);
        if(i != 0) {
            pComparisonDropdown.appendChild(pRegionLabel.cloneNode(true));
        }
    }

    // Imposto "Tutte le regioni" come regione selezionata
    let pAllRegionsLabel = document.getElementsByClassName('region-label')[0];
    pAllRegionsLabel.classList.add('selected-label');
}

/**
 * Funzione che viene chiamata quando un label di regione viene cliccato
 * @param {MouseEvent} e Evento del click
 */
function pRegionClicked(e) {
    // Ottengo il option selezionato
    selectedRegion = e.target.value;
}

function pFindRegionIndex(regionName) {
    return regions.indexOf(regionName);
}

/**
 * Funzione per mostrare il dropdown per la selezione della regione
 * @param {Event} e Evento del click
 */
function pToggleComparisonButton(e) {
    let pComparisonDropdown = document.getElementById('comparison-dropdown');
    if(pComparisonDropdown.style.display == 'block') {
        // Nascondo il dropdown
        pComparisonDropdown.style.display = 'none';
        // Ruoto il pulsante di apertura del dropdown di 45 gradi
        e.target.style.transform = 'rotate(0deg)';
        // Abilito la selezione di Tutte le regioni
        document.getElementById('regions-dropdown').childNodes[0].disabled = false;
        // Modifico la visualizzazione
        isComparison = false;
    }
    else {
        // Mostro il dropdown
        pComparisonDropdown.style.display = 'block';
        // Ruoto il pulsante di apertura del dropdown di 45 gradi
        e.target.style.transform = 'rotate(45deg)';
        // Cambio la selezione del dropdown di sinistra se è tutte le regioni
        if(selectedRegion == "Tutte le regioni") {
            document.getElementById('regions-dropdown').selectedIndex = 3;
            selectedRegion = "Lombardia";
        }
        // Disabilito la selezione di Tutte le regioni
        document.getElementById('regions-dropdown').childNodes[0].disabled = true;
        // Modifico la visualizzazione
        isComparison = true;
    }
    tToggleVisibility();
}

/**
 * Funzione per gestire il cambio della selezione della regione di confronto
 * @param {*} e 
 */
function pComparisonClicked(e) {
    selectedComparison = e.target.value;
}















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
const AGENTS_PER_REGION = 100; // Each region gets exactly 100 agents

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
let dataLoaded = false;

function calculateTotalAgents() {
  return (regions.length - 1) * AGENTS_PER_REGION;
}

function preload() {
  loadTable('assets/dataset/uscite.csv', 'ssv', 'header', 
    function(results) {
      data = results;
      dataLoaded = true;
    },
    function(error) {
      console.error('Error loading data:', error);
      dataLoaded = false;
    }
  );
}

function setup() {
  if (!dataLoaded) {
    console.error('Data not loaded, cannot proceed with setup');
    return;
  }

  agentRadius = (3 * windowWidth * 0.9) / 1700;
  frameWidth = windowWidth * 0.9;
  frameHeight = windowHeight - 230;
  canvas = createCanvas(frameWidth, frameHeight);
  canvas.parent("sketch-container");
  canvas.loadPixels();

  frameRate(60);

  try {
    expenses = data.getObject();
    expensesLength = Object.keys(expenses).length;

    // Load regions and categories
    loadRegionsAndCategories();
    
    // Calculate expenses and percentages
    calculateExpensesAndPercentages();

    // Create and position clusters
    createClusters();

  } catch (error) {
    console.error('Error in setup:', error);
  }
}

function loadRegionsAndCategories() {
  // Load region names
  for (let i = 0; i < expensesLength; i++) {
    let region = expenses[i]['Regione per Dettaglio'];
    if (!regions.includes(region)) {
      regions.push(region);
    }
  }
  
  if (typeof pDrawLabels === 'function') {
    pDrawLabels();
  }

  // Load categories
  for (let i = 0; i < expensesLength; i++) {
    let category = expenses[i]['Settore'];
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }
}

function calculateExpensesAndPercentages() {
  // Calculate for each region
  for(let i = 1; i < regions.length; i++) {
    let region = {
      region: regions[i],
      totalExpense: 0,
      data: []
    };

    // Calculate total expenses for region
    for(let j = 0; j < categories.length; j++) {
      let categorySum = calculateCategorySum(regions[i], categories[j]);
      region.totalExpense += categorySum;
    }

    // Calculate percentages and agents for each category
    for(let j = 0; j < categories.length; j++) {
      let categorySum = calculateCategorySum(regions[i], categories[j]);
      let percentage = region.totalExpense > 0 ? (categorySum / region.totalExpense) * 100 : 0;
      let agentsForCategory = Math.max( Math.round((percentage / 100) * AGENTS_PER_REGION));
      
      region.data.push({
        category: categories[j],
        amount: categorySum,
        percentage: percentage,
        agents: agentsForCategory
      });
    }
    
    // Adjust for rounding errors
    adjustAgentCount(region);
    
    regionDataLastYear.push(region);
  }
}

function calculateCategorySum(region, category) {
  let sum = 0;
  for(let k = 0; k < expensesLength; k++) {
    if(expenses[k]['Regione per Dettaglio'] == region && 
       expenses[k]['Settore'] == category && 
       expenses[k]['Anno'] == '2021') {
      try {
        let value = parseInt(expenses[k]['S - Consolidato SPA']);
        sum += isNaN(value) ? 0 : value;
      } catch {
        sum += 0;
      }
    }
  }
  return sum;
}

function adjustAgentCount(region) {
  let totalAgents = region.data.reduce((sum, cat) => sum + cat.agents, 0);
  if (totalAgents !== AGENTS_PER_REGION) {
    let diff = AGENTS_PER_REGION - totalAgents;
    let largestCategory = region.data.reduce((prev, curr) => 
      prev.agents > curr.agents ? prev : curr
    );
    largestCategory.agents += diff;
  }
}

function createClusters() {
  // Create clusters based on categories
  for(let i = 0; i < categories.length; i++) {
    let totalAgentsForCategory = calculateTotalAgentsForCategory(categories[i]);
    
    if (totalAgentsForCategory > 0) {
      let cluster = {
        center: { x: -200, y: -200 },
        color: categoriesColors[i],
        radius: calculateClusterRadius(totalAgentsForCategory),
        agentCount: totalAgentsForCategory,
        category: categories[i],
        attractionStrength: 0.3,
        boundaryStiffness: 0.5
      };
      clusters.push(cluster);
    }
  }

  // Sort and position clusters
  clusters.sort((a, b) => b.agentCount - a.agentCount);
  if (clusters.length > 0) {
    positionClusters(clusters[0]);
  }
}

function calculateTotalAgentsForCategory(category) {
  let total = 0;
  regionDataLastYear.forEach(region => {
    let categoryData = region.data.find(d => d.category === category);
    if (categoryData) {
      total += categoryData.agents;
    }
  });
  return total;
}

function calculateClusterRadius(agentCount) {
  let agentsArea = agentCount * (4 * agentRadius * agentRadius) * 1.1;
  return sqrt(agentsArea / PI);
}

function positionClusters(centralCluster) {
  for(let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    
    if(i === 0) {
      cluster.center.x = frameWidth / 2;
      cluster.center.y = frameHeight / 2;
    } else {
      positionCluster(cluster, centralCluster);
    }

    // Create agents for the cluster
    createAgentsForCluster(cluster);
  }
}

function positionCluster(cluster, centralCluster) {
  let positioned = false;
  let attempts = 0;
  
  while (!positioned && attempts < 1000) {
    let coords = generateRandomCoordinatesOnOuterCircle(centralCluster, cluster);
    cluster.center.x = coords.abscissa;
    cluster.center.y = coords.ordinate;
    
    let overlaps = clusters.some(c => 
      c != cluster && clusterDistance(c.center, cluster.center) < (c.radius + cluster.radius + 5)
    );
    
    if (!overlaps) {
      positioned = true;
    }
    
    attempts++;
  }
  
  if (!positioned) {
    cluster.center.x = -200;
    cluster.center.y = -200;
  }
}

function createAgentsForCluster(cluster) {
  for(let i = 0; i < cluster.agentCount; i++) {
    let agent = new ParticleClass(cluster);
    agent.percentage = 1; // Each agent represents 1% of its region's total
    agents.push(agent);
  }
}

function draw() {
  if (!dataLoaded) {
    background(backgroundColor);
    fill(255);
    textAlign(CENTER, CENTER);
    text('Loading data...', width/2, height/2);
    return;
  }

  background(backgroundColor);

  if (isComparison) {
    drawComparisonView();
  } else {
    drawMainView();
  }
  
  showHover();
}

function drawMainView() {
  // Draw clusters
  clusters.forEach(cluster => {
    noFill();
    ellipse(cluster.center.x, cluster.center.y, cluster.radius * 2);
  });

  // Update and display agents
  for (let agent of agents) {
    agent.applyBehaviors(agents);
    agent.update();
    agent.display();
  }
}

function showHover() {
  let mouseCoordinates = createVector(mouseX, mouseY);

  // Find cluster under mouse
  let selectedCluster = clusters.find(cluster => 
    dist(mouseCoordinates.x, mouseCoordinates.y, cluster.center.x, cluster.center.y) < cluster.radius
  );

  if (selectedCluster) {
    let category = selectedCluster.category;
    let textLength = textWidth(category);
    
    push();
    fill(255, 255, 255, 25);
    stroke(79, 79, 79);
    rect(mouseX + 5, mouseY - 55, textLength + 20, 50, 8);
    noStroke();
    fill("white");
    textSize(20);
    text(category, mouseX + 15, mouseY - 30);
    pop();
  }
}

// Keep your existing helper functions (generateRandomCoordinatesOnOuterCircle, clusterDistance, etc.)

/**
 * Funzione per la generazione di una coordinata casuale sulla circonferenza esterna del cerchio generato dal centro e dal raggio
 * L'algoritmo non deve mai far uscire dal range del valore maggiore e minore della y del cluster centrale
 * @param {*} center Le coordinate del centro del cluster centrale
 * @param {*} radius La somma tra il raggio del cluster centrale e quello del cluster attuale, con un margine di 10
 * @returns Coordinata casuale sulla circonferenza esterna del cerchio
 */
function generateRandomCoordinatesOnOuterCircle(centralCluster, cluster) {
  // Creo un raggio sommando quello del cluster centrale e quello del cluster attuale
  let totalRadius = centralCluster.radius + cluster.radius + 10;
  const minY = centralCluster.center.y - centralCluster.radius; // Punto più basso del cluster centrale
  const maxY = centralCluster.center.y + centralCluster.radius; // Punto più alto del cluster centrale

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
    
    // Controllo che l'ordinata generata 

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

  

  // Controllo che l'ascissa sommando il raggio non esca dal canvas
  /*if(leftAbscissaRange < 0) {
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

  return { abscissa, ordinate };*/
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
    //fill("grey");
    noFill();
    ellipse(cluster.center.x, cluster.center.y, cluster.radius * 2);
    noFill();
  });
  for (let agent of agents) {
    agent.applyBehaviors(agents);
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
    fill(255, 255, 255, 25);
    stroke(79, 79, 79);
    rect(mouseX + 5, mouseY - 55, textLength, 50, 8);
    noStroke();
    fill("white");
    textSize(20);
    text(category, mouseX + 15, mouseY - 30);
    pop();
  }
}

