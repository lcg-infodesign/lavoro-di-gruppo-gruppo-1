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