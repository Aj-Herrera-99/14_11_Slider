import { slides } from "./db.js";
/*
 * Carosello con javascript
 * FUNZIONAMENTO:
 * Dopo aver preso le source delle immagini da un database
 * li carico dinamicamente nel DOM in modo da avere un'immagine principale attiva e tutte
 * le altre nascoste e sotto di essa le thumbnail più piccole di tutte le immagini
 * L'effetto è un carosello infinito, se non ci sono eventi scatenati le immagini cambiano
 * automaticamente come se fossero delle slide.
 * Al cliccare di una delle due icone o di una delle thumbnail,
 * l'immagine principale cambiera di conseguenza
 */
// DOM elements selection
const slider = document.querySelector(".slider");
const thumbnails = document.querySelector(".thumbnails");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
// other variables
// for the template of slider and thumbnails
let sliderContent = "";
let thumbnailsContent = "";
// index of the image that will be active, initial = 0
let indexActive = 0;
// for the carousel effect
const afkTime = 15000;
const transitionTime = 3000;
let timeout;
let isTimeoutActive = false;
let isLastEventClick = false;
// faccio partire il carosello infinito
let clock = infiniteCarousel();
// genera template per slider e thumbnails
slides.forEach((slide, index) => {
    const templateSlide = generateSlideFrom({ ...slide });
    const templateThumbnail = generateThumbnailfrom({ ...slide });
    sliderContent += templateSlide;
    thumbnailsContent += templateThumbnail;
});
slider.innerHTML = sliderContent;
thumbnails.innerHTML = thumbnailsContent;
// imposto la classe active solo alla prima immagine
if (slider.childElementCount && thumbnails.childElementCount) {
    slider.children[indexActive].classList.add("active");
    thumbnails.children[indexActive].classList.add("active");
} else {
    console.log("No immagini nello slider e nella thumbnails");
}

//* event listeners
// icona next
next.addEventListener("click", handleSlider);
next.addEventListener("mouseover", handleHoverOnActive);
next.addEventListener("mouseleave", handleHoverOnActive);
// icona prev
prev.addEventListener("click", handleSlider);
prev.addEventListener("mouseover", handleHoverOnActive);
prev.addEventListener("mouseleave", handleHoverOnActive);
// immagini thumbnail
for (let thumbnail of thumbnails.children) {
    let imgThumb = thumbnail.querySelector("img");
    imgThumb.addEventListener("click", handleActiveThumbnail);
}

//* event handlers
// Al click delle icone prev e next fai questo
function handleSlider(e) {
    // se slider e thumbnails hanno delle immagini entra nell'IF
    if (slider.childElementCount && thumbnails.childElementCount) {
        // inizializzo il nuovo indice all'indice attivo corrente
        let newIndexActive = indexActive;
        // se l'evento e scatenato dal next, newIndexActive lo incremento
        if (e.target.id === "next") {
            newIndexActive++;
        }
        // se l'evento e scatenato dal prev, newIndexActive lo decremento
        else if (e.target.id === "prev") {
            newIndexActive--;
        }
        //Errore che non dovrebbe capitare
        else {
            console.error("ERROR");
            indexActive = -1;
        }
        // se per qualche motivo indexActive === -1 non entro nell'IF
        if (indexActive !== -1) {
            // aggiorno l'index corrente al nuovo index, e aggiorno la ui
            indexActive = activateAnotherImage(newIndexActive, indexActive);
            // mette in pausa l'effetto carosello e riparte dopo afkTime millisecondi
            pauseRestartCarousel(afkTime);
        }
        // Non dovrebbe capitare
        else {
            indexActive = 0;
        }
    } else {
        console.log("No immagini nello slider e nella thumbnails");
    }
}
// Al click di una delle immagini in thumbnails fai questo
function handleActiveThumbnail(e) {
    // seleziono dal DOM il thumbnail padre dell'immagine
    const thumbnail = this.closest(".thumbnail");
    /* Prendo in prestito il metodo indexOf degli array e la chiamo
     sulla thumbnails.children che è una collezione iterabile
     Trovo l'indice della thumbnail cliccata
    */
    const newIndexActive = Array.prototype.indexOf.call(
        thumbnails.children,
        thumbnail
    );
    // aggiorno l'index corrente al nuovo index, e aggiorno la ui
    indexActive = activateAnotherImage(newIndexActive, indexActive);
    // mette in pausa l'effetto carosello e riparte dopo afkTime millisecondi
    pauseRestartCarousel(afkTime);
}
// All'hover sulle icone fai questo
function handleHoverOnActive(e) {
    /*
    Al mouseover fermo il clock
    Al mouseleave il clock riparte
    Attenzione alla ripartenza del clock al mouseleave
    perche viene fatto ripartire dopo tot secondi all'evento click (se è stato scatenato)
    Disattivare o usare una condizione nel timeout per evitare di creare piu clocks
    */
    // se l'ultimo evento non è stato un click
    if (!isLastEventClick) {
        // se l'elemento ha scatenato l'evento mouseover
        if (e.type === "mouseover") {
            clearTimeout(timeout); // cancello eventuali timeout (se ci sono)
            clearInterval(clock); // fermo il clock del carosello infinito
        }
        // se l'elemento ha scatenato l'evento mouseleave
        else if (e.type === "mouseleave") {
            // se non è attivo il timeout per il pauseRestart, riparte normalmente il clock
            if (!isTimeoutActive) {
                clock = infiniteCarousel();
            }
            // se è attivo il timeout, cancello il corrente e sovrascrivo un timeout in cui
            // fa ripartire il clock del carosello infinito dopo afkTime/3 millisecondi
            else {
                clearInterval(timeout);
                timeout = setTimeout(() => {
                    clock = infiniteCarousel();
                }, parseInt(afkTime / 3));
            }
        }
    }
    // se l'ultimo evento è stato un click
    else {
        // al mouseover, fermo il clock del carosello e l'ultimo evento registrato non è piu un click
        if (e.type === "mouseover") {
            clearInterval(clock);
            isLastEventClick = false;
        }
    }
}

//! functions
function generateSlideFrom({ image, title, text }) {
    return `<div class="slide">
                            <img class="img-fluid" src="assets/${image}" alt="${title}">
                            <div class="text-content">
                                <h5>${title}</h5>
                                <p>${text}</p>
                            </div>
                        </div>`;
}

function generateThumbnailfrom({ image }) {
    return `<div class="thumbnail"> 
                <img class="pointer" src="assets/${image}" alt="">
            </div>`;
}

function activateAnotherImage(newIndex, oldIndex) {
    // se vado oltre il range dx, il nuovo indice diventa quello della prima immagine
    if (newIndex >= slider.childElementCount) {
        newIndex = 0;
    }
    //se vado oltre il range sx, il nuovo indice diventa l'ultimo
    else if (newIndex < 0) {
        newIndex = slider.childElementCount - 1;
    }
    // Attivo l'image con il nuovo indice in slide e thumb
    slider.children[newIndex].classList.add("active");
    thumbnails.children[newIndex].classList.add("active");
    // Disattivo l'image con il vecchio indice in slide e thumb
    slider.children[oldIndex].classList.remove("active");
    thumbnails.children[oldIndex].classList.remove("active");
    // ritorno il nuovo index da assegnare all'index corrente
    return newIndex;
}

function infiniteCarousel() {
    // ad ogni transitionTime millisecondi, aggiorno incrementando l'index della active
    return setInterval(() => {
        let newIndexActive = indexActive;
        newIndexActive++;
        indexActive = activateAnotherImage(newIndexActive, indexActive);
    }, transitionTime);
}

function pauseRestartCarousel(afkTime) {
    // rimuovo eventuali timeout (se ci sono)
    clearTimeout(timeout);
    // fermo il clock
    clearInterval(clock);
    // variabili essenziali per il corretto funzionamento
    // per evitare creazione di nuovi timeout e clocks
    isLastEventClick = true;
    isTimeoutActive = true;
    // dopo afkTime millisecondi, se l'ultimo evento rimane il click, fai ripartire il carosello
    timeout = setTimeout(() => {
        if (isLastEventClick) {
            clock = infiniteCarousel();
        }
        isTimeoutActive = false;
    }, afkTime);
}
