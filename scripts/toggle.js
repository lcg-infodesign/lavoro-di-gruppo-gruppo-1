/** 
 * GEOGRAFIA DELLE REGIONI
 * Politecnico di Milano - AA 2024/25
 * Design della Comunicazione - Laboratorio di Computer Grafica per l'Information Design
 * 
 * Authors: Bano, Chinni, Lages, Magalhaes, Menoni, Piganzoli, Segato
 * 
 * Questo script si occupa di gestire il funzionamento del toggle per la visualizzazione in percentuale
 */

const descriptions = [
    "100.000.000€",
    "0,0087%"
];

let activeOption = 0;

function tToggleView() {
    const toggleButton = document.getElementById("toggle-button");
    const descriptionText = document.getElementById("toggle-description");

    activeOption = 1 - activeOption; // Alterna tra 0 e 1
    toggleButton.classList.toggle("active", activeOption === 1);
    descriptionText.textContent = descriptions[activeOption];

    if(activeOption === 1) {
        pLoadPercentages();
    }
}

/**
 * Funzione per gestire la visibilità dello switch stesso
 * Deve essere visibile solo se è attiva la visualizzazione a confronto tra due regioni
 */
function tToggleVisibility() {
    const toggleCont = document.getElementById("toggle-container");
    toggleCont.style.display = isComparison ? "block" : "none";
}



function tToggleView(selected) {
    const leftToggle = document.getElementById("mtoggle-left");
    const rightToggle = document.getElementById("mtoggle-right");

    // Se il pulsante sinistro è selezionato (selected = 0)
    if (selected === 0) {
        leftToggle.classList.add("m-selected");  // Aggiungo la classe m-selected al pulsante sinistro
        rightToggle.classList.remove("m-selected");  // Rimuovo la classe m-selected dal pulsante destro
        document.getElementById("topballs").src="assets/images/Gif_spazivuoti_bottomright_verde.gif"
        document.getElementById("link").style.color="#B8E557"
        document.getElementById("titolo").style.color="#B8E557"
        document.getElementsByClassName("demo-circle")[0].style.backgroundColor="#B8E557"
        document.getElementById("demo-value").textContent="100.000.000€"

        


    } else {  // Se il pulsante destro è selezionato (selected = 1)
        rightToggle.classList.add("m-selected");  // Aggiungo la classe m-selected al pulsante destro
        leftToggle.classList.remove("m-selected");  // Rimuov la classe m-selected dal pulsante sinistro
        document.getElementById("topballs").src="assets/images/Gif_spazivuoti_bottomright_viola.gif"
        document.getElementById("link").style.color="#A757E5"
        document.getElementById("titolo").style.color="#A757E5"
        document.getElementsByClassName("demo-circle")[0].style.backgroundColor="#A757E5"
        document.getElementById("demo-value").textContent="%"






    }
}



