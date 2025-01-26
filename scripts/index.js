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
    let pComparisonDropdown = document.getElementById('box-2');

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
        comparisonButton.className = 'region-label';
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
function pRegionClicked(e) {
    // Ottengo il option selezionato
    selectedRegion = e.target.value;
    // Scrivo il nome della regione selezionata nel button
    let pSelection = document.getElementById("bottom-selected-region");
    pSelection.value = selectedRegion;
    pSelection.innerHTML = selectedRegion;
}

function pFindRegionIndex(regionName) {
    return regions.indexOf(regionName);
}


//PARTE INSERITA DA SIMO DA UNIRE ALLA FUNZIONE PRIMA//
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
}






/**
 * Funzione per mostrare il dropdown per la selezione della regione
 * @param {Event} e Evento del click
 */
function pToggleComparisonButton(e) {
    let pComparisonDropdown = document.getElementById('box-2');
    let button = e.target.closest('#comparison-button'); // Ensure we get the button element
    
    if(pComparisonDropdown.style.display == 'block') {
        // Nascondo il dropdown
        pComparisonDropdown.style.display = 'none';
        // Ruoto il pulsante di apertura del dropdown di 45 gradi
        button.classList.remove('rotated');
        // Abilito la selezione di Tutte le regioni
        document.getElementById('regions-dropdown').childNodes[0].disabled = false;
        // Modifico la visualizzazione
        isComparison = false;
    }
    else {
        // Mostro il dropdown
        pComparisonDropdown.style.display = 'block';
        // Ruoto il pulsante di apertura del dropdown di 45 gradi
        button.classList.add('rotated');
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
