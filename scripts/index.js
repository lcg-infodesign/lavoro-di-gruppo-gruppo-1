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
    let pRegionsList = document.getElementById('regions-list');
    let pComparisonDropdown = document.getElementById('regions-list-2');

    for (let i = 0; i < regions.length; i++) {
        // First dropdown buttons
        let regionButton = document.createElement('button');
        regionButton.className = 'region-label';
        regionButton.value = regions[i];
        regionButton.innerHTML = regions[i];
        regionButton.onclick = pRegionClicked;
        pRegionsList.appendChild(regionButton);

        // Comparison dropdown buttons
        let comparisonButton = document.createElement('button');
        comparisonButton.className = 'comparison-label';
        comparisonButton.value = regions[i];
        comparisonButton.innerHTML = regions[i];
        comparisonButton.onclick = pComparisonClicked;
        pComparisonDropdown.appendChild(comparisonButton);
    }

    let pAllRegionsLabel = document.getElementsByClassName('region-label')[0];
    pAllRegionsLabel.classList.add('selected-label');
}


/**
 * Funzione che viene chiamata quando un label di regione viene cliccato
 * @param {MouseEvent} e Evento del click
 */
function pFindRegionIndex(regionName) {
    return regions.indexOf(regionName);
}

function pRegionClicked(e) {
    // Ottieni l'elemento della regione cliccata
    const clickedRegion = e.target;

    // Rimuovi la classe 'selected' da tutte le altre regioni
    const allRegionLabels = document.querySelectorAll('.region-label');
    allRegionLabels.forEach(region => {
        region.classList.remove('selected'); // Rimuove la classe 'selected' (simulando "hover off")
    });

    // Aggiungi la classe 'selected' all'elemento cliccato (simulando "hover on")
    clickedRegion.classList.add('selected');

    // Ottieni e aggiorna il nome della regione selezionata nel button
    selectedRegion = clickedRegion.value;
    let pSelection = document.getElementById("bottom-selected-region");
    pSelection.value = selectedRegion;
    pSelection.innerHTML = selectedRegion;

    // Ricalcolo i cluster per la regione selezionata
    calculateLeftComparisonClusters();
}

function pComparisonClicked(e) {
    // Ottieni l'elemento della regione cliccata
    const clickedRegion = e.target;

    // Rimuovi la classe 'selected' da tutte le altre regioni
    const allRegionLabels = document.querySelectorAll('.comparison-label');
    allRegionLabels.forEach(region => {
        region.classList.remove('selected'); // Rimuove la classe 'selected' (simulando "hover off")
    });

    // Aggiungi la classe 'selected' all'elemento cliccato (simulando "hover on")
    clickedRegion.classList.add('selected');

    // Ottieni e aggiorna il nome della regione selezionata nel button
    selectedRegion = clickedRegion.value;
    let pSelection = document.getElementById("comparison-dropdown");
    pSelection.value = selectedRegion;
    pSelection.innerHTML = selectedRegion;

    // Calcolo nuovamente i cluster e gli agenti per la regione selezionata
    calculateRightComparisonClusters();
}

/**
 * Funzione per mostrare il dropdown per la selezione della regione
 * @param {Event} e Evento del click
 */
function pToggleComparisonButton(e) {    
    let pComparisonDropdown = document.getElementById('box-2');
    let button = e.target.closest('#comparison-button'); // Ensure we get the button element
    
    if(pComparisonDropdown.style.display == 'flex') {
        // Nascondo il dropdown
        pComparisonDropdown.style.display = 'none';
        // Ruoto il pulsante di apertura del dropdown di 45 gradi
        button.classList.remove('rotated');
        // Modifico la visualizzazione
        isComparison = false;
    }
    else {
        // Mostro il dropdown
        pComparisonDropdown.style.display = 'flex';
        // Ruoto il pulsante di apertura del dropdown di 45 gradi
        button.classList.add('rotated');
        // Cambio la selezione del dropdown di sinistra se è tutte le regioni
        if(selectedRegion == "Tutte le regioni") {
            document.getElementById('bottom-selected-region').innerHTML = "Lombardia";
            document.getElementsByClassName('region-label')[0].classList.remove('selected');
            document.getElementsByClassName('region-label')[pFindRegionIndex('Lombardia')].classList.add('selected');
            selectedRegion = "Lombardia";
        }
        // Disabilito la selezione di Tutte le regioni
        // TODO: Implementare questa condizione
        // Modifico la visualizzazione
        isComparison = true;
    }
    tToggleVisibility();

    // Effettuo il calcolo dei cluster e degli agenti per la regione di sinistra
    calculateLeftComparisonClusters();
    // Effettuo il calcolo dei cluster e degli agenti per la regione di destra
    calculateRightComparisonClusters();
}

const elements = document.querySelectorAll(".animated");

window.addEventListener("scroll", () => {
    elements.forEach((el) => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight) {
            el.classList.add("show");
        } else {
            el.classList.remove("show");
        }
    });
});

const elements1 = document.querySelectorAll(".animated2");

window.addEventListener("scroll", () => {
    elements1.forEach((el) => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight) {
            el.classList.add("show");
        } else {
            el.classList.remove("show");
        }
    });
});


const elements2 = document.querySelectorAll(".animated3");

window.addEventListener("scroll", () => {
    elements2.forEach((el) => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight) {
            el.classList.add("show");
        } else {
            el.classList.remove("show");
        }
    });
});


const elements3 = document.querySelectorAll(".animated4");

window.addEventListener("scroll", () => {
    elements3.forEach((el) => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight) {
            el.classList.add("show");
        } else {
            el.classList.remove("show");
        }
    });
});



const elements4 = document.querySelectorAll(".animated1");

window.addEventListener("scroll", () => {
    elements4.forEach((el) => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight) {
            el.classList.add("show");
        } else {
            el.classList.remove("show");
        }
    });
});


