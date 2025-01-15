// === VARIABILI GLOBALI ===

// Stato di riproduzione
let isPlaying = false;
let isPaused = false;
let currentTimeoutId = null;

// Gestione note e arpeggi
let currentNoteIndex = 0;
let notesData = [];
let synth = new Tone.Synth().toDestination();
let currentDirection = "ascendente";
let completedRangeCycles = 0;
let totalRangeCyclesRequired = 1;
let completedArpeggios = 0;
let totalArpeggiosRequired = 0;

// Progress bar e range vocale
let progressBar = null;
let minNote = null;
let maxNote = null;


// Audio di esempio
let currentExampleAudio = null;

// Costanti di default
const DEFAULT_REFERENCE_NOTE = "C4";
const DEFAULT_EXERCISE = "arpeggio1";

// Gestione esercizi e gruppi
let currentEditGroupIndex = null;
let currentGroup = null;  
let selectedExercise = DEFAULT_EXERCISE; 


//MODEL: dati e logica dell'applicazione

// Lista nomi esercizi
const exerciseNames = {
  vocal1: "MMMM",
  vocal2: "Lip Thrill",
  vocal3: "Ng",
  vocal4: "Ng-Vocal",
  vocal5: "VVVV",
  vocal6: "Hi Hi Hi",
  vocal7: "IAIAIAIAIAIAIAIAIA",
  arpeggio1: "IEAOU",
  arpeggio2: "UUUU",
  arpeggio3: "Lui",
  arpeggio4: "IUUU",
  arpeggio5: "Ha Ha Ha Ha",
  articulation1: "GAGIGAGIGAGI",
  articulation2: "GHIGHIGHI con glissando",
  articulation3: "BABABABABA",
  articulation4: "MINU",
  range1: "IEEE",
  range2: "VIA",
  range3: "ZING",
  range4: "VVV e Lo",
  belt1: "Bambini Brutti",
  belt2: "GNEGNE",
  belt3: "NONONO",
  belt4: "SolFaMiReDoSolDo",
  belt5: "WATA",
  legit1: "IAAAIOOIAAIOOIA",
  legit2: "IIII",
  legit3: "Silanelgiardinleroseinfior",
  legit4: "UIUIUI",
  cooldown1: "Vocal Fry",
  cooldown2: "Vocal Fry alto"
};

// Definizione esercizi
const exercises = {
  vocal1: {
    notes: ["C", "C", "C", "C", "C", "C#"],  // MMMM
    durations: ["2n", "2n", "2n", "2n", "4n", "4n"]
  },
  vocal2: {
    notes: ["Ab", "Gb", "F", "Eb", "Db", "Ab", "Db", "Ab", "A"],  // Lip Thrill
    durations: ["4n", "4n", "4n", "4n", "2n", "2n", "2n", "4n", "4n"]
  },
  vocal3: {
    notes: ["Db", "A", "Db", "Bb", "Db", "Db", "D"],  // Ng 
    durations: ["2n", "2n", "2n", "2n", "2n", "4n", "4n"]
  },
  vocal4: {
    notes: ["C", "G", "C", "C", "C#"],  // Ng-Vocal
    durations: ["2n", "2n", "2n", "4n", "4n"]
  },
  vocal5: {
    notes: ["Bb", "D", "Bb", "D", "Bb", "D", "Bb", "Bb", "B"],  // VVVV
    durations: ["4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n"]
  },
  vocal6: {
    notes: ["C", "C", "C", "C", "C#"],  // Hi Hi Hi
    durations: ["2n", "2n", "2n", "4n", "4n"]
  },
  vocal7: {
    notes: ["E", "E", "E", "E", "E", "E", "E", "E", "E", "F"],  // IAIAIAIAIAIAIAIAIA
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "4n", "4n", "8n"]
  },
  arpeggio1: {
    notes: ["Gb", "G", "A", "Gb", "E", "Gb", "G", "E", "D", "E", "Gb", "E", "D", "Gb", "G"],  // IEAOU
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "2n", "8n", "8n"]
  },
  arpeggio2: {
    notes: ["E", "F", "Gb", "G", "Gb", "F", "E", "E", "F"],  // UUUU
    durations: ["4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n"]
  },
  arpeggio3: {
    notes: ["C", "G", "E", "C", "G", "E", "C", "C", "C#"],  // Lui
    durations: ["4n", "2n", "4n", "4n", "2n", "4n", "4n", "4n", "4n"],
  },
  arpeggio4: {
    notes: ["C", "E", "C", "G", "C", "C", "C#"],  // IUUU
    durations: ["4n", "4n", "4n", "4n", "2n", "4n", "4n"]
  },
  arpeggio5: {
    notes: ["G", "E", "C", "E", "G", "E", "C", "G", "G#"],  // Ha Ha Ha Ha
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "4n", "8n", "8n"]
  },
  articulation1: {
    notes: ["C", "E", "D", "F", "E", "G", "F", "D", "C", "C", "C#"],  // GAGIGAGIGAGI
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "4n", "8n", "8n"]
  },
  articulation2: {
    notes: ["Gb", "D", "G", "E", "A", "Gb", "G", "E", "D", "A", "D", "Gb", "G"],  // GHIGHIGHI 
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "2n", "2n", "4n", "4n", "4n"]
  },
  articulation3: {
    notes: ["C", "D", "C", "D", "E", "F", "E", "F", "G", "F", "E", "D", "C", "C", "C#"],  // BABABABABA
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "4n", "8n", "8n"]
  },
  articulation4: {
    notes: ["D", "D", "D", "D", "E", "E", "E", "E", "Gb", "Gb", "Gb", "Gb", "G", "G", "G", "G", "A", "A", "A", "A", "G", "G", "G", "G", "Gb", "Gb", "Gb", "Gb", "E", "E", "E", "E", "D", "D", "D#"],  // MINU
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "2n", "8n", "8n"]
  },
  range1: {
    notes: ["C", "C", "D", "E", "E", "F", "G", "G", "F", "E", "E", "D", "C", "C", "C#"],  // IEEE
    durations: ["4n", "8n", "8n", "4n", "8n", "8n", "4n", "8n", "8n", "4n", "8n", "8n", "2n", "4n", "4n"]
  },
  range2: {
    notes: ["C", "B", "A", "G", "F", "E", "D", "C", "C", "C#"],  // VIA
    durations: ["2n", "2n", "8n", "8n", "8n", "8n", "8n", "2n", "4n", "4n"]
  },
  range3: {
    notes: ["C", "G", "C", "C", "C#"],  // ZING
    durations: ["2n", "2n", "2n", "4n", "4n"]
  },
  range4: {
    notes: ["C", "E", "G", "B", "G", "E", "C", "C", "C#"],  // VVV e Lo
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "2n", "4n", "4n"]
  },
  belt1: {
    notes: ["E", "Ab", "E", "B", "E", "E", "F"],  // Bambini Brutti
    durations: ["2n", "2n", "2n", "2n", "2n", "4n", "4n"]
  },
  belt2: {
    notes: ["G", "E", "C", "G", "G#"],  // GNEGNE
    durations: ["2n", "2n", "2n", "4n", "4n"]
  },
  belt3: {
    notes: ["C", "G", "E", "C", "G", "E", "C", "C", "C#"],  // NO NO NO
    durations: ["4n", "2n", "4n", "4n", "2n", "4n", "2n", "4n", "4n"]
  },
  belt4: {
    notes: ["G", "F", "E", "D", "C", "G", "C", "G", "G#"],  // SolFaMiReDoSolDo
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "4n", "4n", "4n"]
  },
  belt5: {
    notes: ["C", "B", "B", "C", "C#"],  // WATA
    durations: ["2n", "4n", "2n", "4n", "4n"]
  },
  legit1: {
    notes: ["G", "A", "G", "F", "G", "F", "E", "F", "E", "D", "E", "D", "C", "G", "G#"],  // IAAAIOOOIAAAAIOOOIA
    durations: ["8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "8n", "4n", "4n", "4n"]
  },
  legit2: {
    notes: ["E", "Gb", "Ab", "Gb", "E", "Gb", "Ab", "Gb", "E", "E", "F"],  // III
    durations: ["2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "4n", "4n"]
  },
  legit3: {
    notes: ["D", "E", "Gb", "G", "A", "G", "Gb", "E", "D", "D", "D#"],  // Silanelgiardinleroseinfior
    durations: ["4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n"]
  },
  legit4: {
    notes: ["G", "C", "G", "F", "E", "D", "C", "G", "C", "G", "G#"],  // UIUIUI
    durations: ["4n", "8n", "8n", "8n", "8n", "8n", "4n", "4n", "2n", "4n", "4n"]
  }
};

// Organizzazione categorie esercizi
const categorizedExercises = {
  "Semplici Vocalizzi": ["vocal1", "vocal2", "vocal3", "vocal4", "vocal5", "vocal6", "vocal7"],
  "Arpeggi e Intervalli": ["arpeggio1", "arpeggio2", "arpeggio3", "arpeggio4", "arpeggio5"],
  "Articolazione": ["articulation1", "articulation2", "articulation3", "articulation4"],
  "Estensione Vocale": ["range1", "range2", "range3", "range4"],
  "Belt": ["belt1", "belt2", "belt3", "belt4", "belt5"],
  "Legit": ["legit1", "legit2", "legit3", "legit4"],
  "Cool Down": ["cooldown1", "cooldown2"]
};

// Descrizione esercizi
const exerciseDetails = {
  vocal1: {
    name: "MMMM",
    description: "Esegui il suono 'MMMM' per rilassare e riscaldare le corde vocali."
  },
  vocal2: {
    name: "Lip Thrill",
    description: "Esegui il 'Lip Thrill' per migliorare la respirazione e la risonanza."
  },
  vocal3: {
    name: "Ng",
    description: "Esegui il suono 'Ng' per migliorare la risonanza e la vibrazione delle corde vocali."
  },
  vocal4: {
    name: "Ng-Vocal",
    description: "Esegui il suono 'Ng' con una tecnica vocale per migliorare la resistenza."
  },
  vocal5: {
    name: "VVVV",
    description: "Esegui il suono 'VVVV' per riscaldare le corde vocali in modo delicato."
  },
  vocal6: {
    name: "Hi Hi Hi",
    description: "Esegui il suono 'Hi Hi Hi' per migliorare la flessibilità vocale."
  },
  vocal7: {
    name: "IAIAIAIAIAIAIAIAIA",
    description: "Esegui una serie di suoni 'IA' per migliorare la velocità e la precisione."
  },
  arpeggio1: {
    name: "IEAOU",
    description: "Esegui l'arpeggio 'IEAOU' per migliorare la postura e l'intonazione."
  },
  arpeggio2: {
    name: "UUUU",
    description: "Esegui l'arpeggio 'UUUU' per aumentare la capacità di resistenza."
  },
  arpeggio3: {
    name: "Lui",
    description: "Esegui l'arpeggio 'Lui' per riscaldare le corde vocali."
  },
  arpeggio4: {
    name: "IUUU",
    description: "Esegui l'arpeggio 'IUUU' per migliorare la flessibilità vocale."
  },
  arpeggio5: {
    name: "Ha Ha Ha Ha",
    description: "Esegui il suono 'Ha Ha Ha' per allenare il controllo del respiro."
  },
  articulation1: {
    name: "GAGIGAGIGAGI",
    description: "Esegui il suono articolato 'GAGIGAGIGAGI' per migliorare la dizione."
  },
  articulation2: {
    name: "GHIGHIGHI con glissando",
    description: "Esegui il suono 'GHIGHIGHI' con un glissando per migliorare la transizione tra le note."
  },
  articulation3: {
    name: "BABABABABA",
    description: "Esegui il suono 'BABABABABA' per migliorare la fluidità della voce."
  },
  articulation4: {
    name: "MINU",
    description: "Esegui 'MINU' per allenare la flessibilità delle vocali."
  },
  range1: {
    name: "IEEE",
    description: "Esegui 'IEEE' per migliorare l'estensione vocale."
  },
  range2: {
    name: "VIA",
    description: "Esegui 'VIA' per sviluppare la proiezione della voce."
  },
  range3: {
    name: "ZING",
    description: "Esegui 'ZING' per migliorare la risonanza nelle note alte."
  },
  range4: {
    name: "VVV e Lo",
    description: "Esegui 'VVV e Lo' per migliorare la qualità vocale nelle note basse."
  },
  belt1: {
    name: "Bambini Brutti",
    description: "Esegui 'Bambini Brutti' per migliorare la potenza nelle note alte."
  },
  belt2: {
    name: "GNEGNE",
    description: "Esegui 'GNEGNE' per allenare la proiezione vocale."
  },
  belt3: {
    name: "NONONO",
    description: "Esegui 'NONONO' per migliorare il controllo della voce."
  },
  belt4: {
    name: "SolFaMiReDoSolDo",
    description: "Esegui 'SolFaMiReDoSolDo' per migliorare l'agilità vocale."
  },
  belt5: {
    name: "WATA",
    description: "Esegui 'WATA' per riscaldare e rafforzare le corde vocali."
  },
  legit1: {
    name: "IAAAIOOIAAIOOIA",
    description: "Esegui 'IAAAIOOIAAIOOIA' per migliorare l'estensione vocale."
  },
  legit2: {
    name: "IIII",
    description: "Esegui 'IIII' per allenare la precisione nelle note alte."
  },
  legit3: {
    name: "Silanelgiardinleroseinfior",
    description: "Esegui il canto della frase 'Silanelgiardinleroseinfior' per migliorare il controllo del fiato."
  },
  legit4: {
    name: "UIUIUI",
    description: "Esegui 'UIUIUI' per migliorare la proiezione vocale."
  },
};


// Gruppi predefiniti
const defaultGroups = [
  {
    name: "Vocalizzi Semplici",
    exercises: ["vocal1", "vocal2", "vocal3", "vocal4"]
  },
  {
    name: "Estensione Vocale",
    exercises: ["range1", "range2", "range3", "range4"]
  }
];




// Definiamo i range delle vocalità
const vocalRanges = {
  soprano: { min: "C4", max: "C6" },
  contralto: { min: "A3", max: "A5" },
  tenore: { min: "C3", max: "C5" },
  basso: { min: "E2", max: "E4" }
};


// Funzioni per la gestione dei GRUPPI di esercizi

function getSavedGroups() {
  try {
    return JSON.parse(localStorage.getItem("savedGroups")) || [];
  } catch (error) {
    console.error("Errore durante il recupero dei gruppi salvati:", error);
    return [];
  }
}

function saveGroupToLocalStorage(group) {
  const savedGroups = getSavedGroups();
  savedGroups.push(group);
  localStorage.setItem("savedGroups", JSON.stringify(savedGroups));
}


function getGroupByIndex(index) {
  const savedGroups = getSavedGroups();
  return savedGroups[index] || null;
}


function deleteGroup(index) {
  const savedGroups = getSavedGroups(); 
  if (index >= 0 && index < savedGroups.length) {
    savedGroups.splice(index, 1); 
    localStorage.setItem("savedGroups", JSON.stringify(savedGroups)); 
    renderSavedGroups(); 
    alert(`Gruppo eliminato con successo!`);
  } else {
    console.error("Indice gruppo non valido");
  }
}


// Funzione per generare un arpeggio iniziale all'interno del range
function generateInitialArpeggio(minNote, referenceNote = DEFAULT_REFERENCE_NOTE, exerciseType = DEFAULT_EXERCISE) {
  // Ottieni le note e le durate dell'esercizio selezionato
  const { notes, durations } = exercises[exerciseType];

  // Controlla se l'esercizio esiste
  if (!notes || !durations) {
    console.error(`Esercizio "${exerciseType}" non trovato.`);
    return [];
  }

  console.log(`Generazione arpeggio per esercizio: ${exerciseType}`);
  console.log(`Note di base: ${notes}, Durate: ${durations}`);

  // Frequenze di riferimento
  const referenceFreq = Tone.Frequency(referenceNote).toFrequency();
  const minFreq = Tone.Frequency(minNote).toFrequency();

  // Calcola la distanza in semitoni
  const semitoneOffset = Math.round(12 * Math.log2(minFreq / referenceFreq));

  // Esegui la trasposizione delle note senza alterare le durate
  return notes.map((note, index) => {
    let noteWithOctave = `${note}${referenceNote.slice(-1)}`;  // Usa sempre l'ottava della nota di riferimento

    const duration = durations[index]; // Assegna la durata corrispondente alla nota

    return {
      note: Tone.Frequency(noteWithOctave).transpose(semitoneOffset).toNote(),
      duration: duration
    };
  });
}




//VIEW: Gestione dell'interfaccia utente
const vocalRangeSelector = document.getElementById("vocal-range");
// Inizializzazione dell'interfaccia utente
function initializeApp() {
  initializeKeyboardFeedback(document.querySelectorAll(".key")); // Inizializza la tastiera
  renderCategorizedExerciseList(); // Popola la lista degli esercizi
  renderDefaultGroups(); // Mostra i gruppi predefiniti
  renderSavedGroups(); // Mostra i gruppi personalizzati
  loadDefaultGroups(); // Carica i gruppi predefiniti se non esistono
}

window.addEventListener("DOMContentLoaded", initializeApp);

// Inizializzione e Feedback Tastiera
const keys = document.querySelectorAll(".key");
initializeKeyboardFeedback(keys);

function initializeKeyboardFeedback(keys) {
  if (keys.length === 0) {
    console.error("Nessun tasto trovato! Controlla l'HTML.");
    return;
  }

  keys.forEach((key) => {
    key.addEventListener("click", async () => {
      await Tone.start();
      const note = key.getAttribute("data-note");

      // Aggiungi feedback visivo
      addKeyFeedback(note);

      // Suona la nota
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease(note, "8n");
      console.log(`Playing note: ${note}`);
    });
  });
}


function addKeyFeedback(note) {
  const key = Array.from(keys).find(key => key.getAttribute("data-note") === note);
  if (key) {
    key.classList.add("active");
    setTimeout(() => key.classList.remove("active"), 200);
  }
}


function removeAllKeyFeedback() {
  keys.forEach(key => key.classList.remove("active"));
}


// Rendering Interfaccia utente

function updateCurrentExerciseLabel(selectedExercise) {
  const currentExerciseName = document.getElementById("current-exercise-name");
  const exerciseDescriptionText = document.getElementById("exercise-description-text");

  if (exerciseDetails[selectedExercise]) {
    currentExerciseName.textContent = exerciseDetails[selectedExercise].name;
    exerciseDescriptionText.textContent = exerciseDetails[selectedExercise].description;
  } else {
    currentExerciseName.textContent = "Esercizio Sconosciuto";
    exerciseDescriptionText.textContent = "Descrizione non disponibile.";
  }
}


function renderCategorizedExerciseList() {
  const exerciseListContainer = document.getElementById("exercise-list");

  if (!exerciseListContainer) {
    console.error("Elemento con ID 'exercise-list' non trovato!");
    return;
  }

  exerciseListContainer.innerHTML = ""; // Pulisce il contenitore

  Object.keys(categorizedExercises).forEach((category) => {
    // Creare un contenitore per la categoria
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category");

    // Titolo della categoria
    const categoryTitle = document.createElement("h3");
    categoryTitle.textContent = category;
    categoryContainer.appendChild(categoryTitle);

    // Lista di esercizi
    const exerciseUl = document.createElement("ul");
    categorizedExercises[category].forEach((exerciseId) => {
      const exerciseLi = document.createElement("li");

      const exerciseCheckbox = document.createElement("input");
      exerciseCheckbox.type = "checkbox";
      exerciseCheckbox.value = exerciseId;
      exerciseCheckbox.id = `checkbox-${exerciseId}`;

      const exerciseLabel = document.createElement("label");
      exerciseLabel.textContent = exerciseNames[exerciseId] || "Esercizio Sconosciuto";
      exerciseLabel.htmlFor = `checkbox-${exerciseId}`;

      exerciseLi.appendChild(exerciseCheckbox);
      exerciseLi.appendChild(exerciseLabel);
      exerciseUl.appendChild(exerciseLi);
    });

    categoryContainer.appendChild(exerciseUl);
    exerciseListContainer.appendChild(categoryContainer);
  });
}


function renderDefaultGroups() {
  const defaultGroupsContainer = document.getElementById("default-groups");
  defaultGroupsContainer.innerHTML = ""; // Pulisce il contenitore

  defaultGroups.forEach((group, index) => {
    const groupDiv = document.createElement("div"); // Div per il gruppo
    groupDiv.textContent = group.name; // Nome del gruppo
    groupDiv.classList.add("group-section"); // Classe CSS per lo stile

    // Contenitore pulsanti
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container"); // Uniforme

    // Pulsante "Play"
    const playButton = document.createElement("button");
    playButton.textContent = "Play"; // Testo del pulsante
    playButton.classList.add("play-group"); // Classe CSS
    playButton.addEventListener("click", () => playExerciseGroup(group.exercises)); // Listener per avviare il gruppo

    // Pulsante "Pausa"
    const pauseButton = document.createElement("button");
    pauseButton.textContent = "Pause"; // Testo del pulsante
    pauseButton.classList.add("pause-group"); // Classe CSS
    pauseButton.addEventListener("click", (event) => pauseExerciseGroup(event.target)); // Listener per mettere in pausa il gruppo

    // Pulsante "Stop"
    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";  // Testo del pulsante
    stopButton.classList.add("stop-group");  // Classe CSS per lo stile
    stopButton.addEventListener("click", stopArpeggio);  // Listener per fermare il gruppo


    // Aggiungi i pulsanti al contenitore
    buttonContainer.appendChild(playButton);
    buttonContainer.appendChild(pauseButton);
    buttonContainer.appendChild(stopButton);

    // Aggiungi il contenitore dei pulsanti al div del gruppo
    groupDiv.appendChild(buttonContainer);

    // Aggiungi il gruppo al contenitore principale
    defaultGroupsContainer.appendChild(groupDiv);
  });
}



// Mostra i gruppi salvati (gruppi personalizzati creati dall'utente)
function renderSavedGroups() {
  const savedGroupsContainer = document.getElementById("saved-groups"); // Recupera il contenitore per i gruppi salvati
  // Rimuove solo i div con classe "exercise-group", lasciando il titolo intatto
  savedGroupsContainer.querySelectorAll(".exercise-group").forEach(el => el.remove());
  const savedGroups = getSavedGroups(); // Recupera i gruppi salvati dal localStorage
  console.log("Gruppi salvati da visualizzare:", savedGroups); // Log di debug per verificare i gruppi recuperati

  // Cicla su ogni gruppo salvato e crea gli elementi HTML corrispondenti
  savedGroups.forEach((group, index) => {
    const groupDiv = document.createElement("div"); // Crea un div per rappresentare il gruppo
    groupDiv.textContent = group.name; // Imposta il nome del gruppo come testo
    groupDiv.classList.add("exercise-group"); // Aggiunge una classe CSS per lo stile

    // Contenitore per i pulsanti associati al gruppo
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container"); // Uniforme

    // Pulsante "Play"
    const playButton = document.createElement("button");
    playButton.textContent = "Play"; // Testo del pulsante
    playButton.classList.add("play-group"); // Classe CSS per lo stile del pulsante
    playButton.addEventListener("click", () => playExerciseGroup(group.exercises)); // Aggiunge un listener per avviare il gruppo

    // Pulsante "Pausa"
    const pauseButton = document.createElement("button");
    pauseButton.textContent = "Pause"; // Testo del pulsante
    pauseButton.classList.add("pause-group"); // Classe CSS per lo stile del pulsante
    pauseButton.addEventListener("click", (event) => pauseExerciseGroup(event.target)); // Listener per mettere in pausa il gruppo

    // Pulsante "Stop"
    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";  // Testo del pulsante
    stopButton.classList.add("stop-group");  // Classe CSS per lo stile
    stopButton.addEventListener("click", stopArpeggio);  // Listener per fermare il gruppo


    // Pulsante "Delete"
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete"; // Testo del pulsante
    deleteButton.classList.add("delete-group"); // Classe CSS per lo stile del pulsante
    deleteButton.addEventListener("click", () => deleteGroup(index)); // Listener per eliminare il gruppo

    // Pulsante "Edit"
    const editButton = document.createElement("button");
    editButton.textContent = "Edit"; // Testo del pulsante
    editButton.classList.add("edit-group"); // Classe CSS per lo stile del pulsante
    editButton.addEventListener("click", () => openEditGroupModal(index)); // Listener per aprire il modale di modifica

    // Aggiungi i pulsanti al contenitore dei pulsanti
    buttonContainer.appendChild(playButton);
    buttonContainer.appendChild(pauseButton);
    buttonContainer.appendChild(stopButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    // Aggiungi il contenitore dei pulsanti al div del gruppo
    groupDiv.appendChild(buttonContainer);

    // Aggiungi il div del gruppo al contenitore principale
    savedGroupsContainer.appendChild(groupDiv);
  });
}

// Gestione dei modali

function openNewGroupModal() {
  const modal = document.getElementById("new-modal");
  const overlay = document.getElementById("global-modal-overlay");

  modal.style.display = "block";
  overlay.style.display = "block";

  // Popola la lista degli esercizi categorizzati
  renderCategorizedExerciseList(); // Usa questa funzione per generare esercizi divisi per categoria
}



function closeNewGroupModal() {
  const modal = document.getElementById("new-modal");
  const overlay = document.getElementById("global-modal-overlay");

  modal.style.display = "none"; // Nascondi il modale
  overlay.style.display = "none"; // Nascondi l'overlay
}


function openEditGroupModal(index) {
  const modal = document.getElementById("edit-modal");
  const overlay = document.getElementById("global-modal-overlay");

  if (!modal) {
    console.error("Elemento con ID 'edit-modal' non trovato!");
    return;
  }

  if (!overlay) {
    console.error("Elemento con ID 'global-modal-overlay' non trovato!");
    return;
  }

  // Salva l'indice globale
  currentEditGroupIndex = index;

  modal.style.display = "block";
  overlay.style.display = "block";

  // Rimuovi aria-hidden
  modal.removeAttribute("aria-hidden");

  const editExerciseList = document.getElementById("edit-exercise-list");
  editExerciseList.innerHTML = ""; // Pulisce il contenitore

  // Recupera il gruppo salvato
  const savedGroup = getSavedGroups()[index];

  if (!savedGroup) {
    console.error("Gruppo non trovato per l'indice specificato!");
    return;
  }

  // Genera la lista degli esercizi categorizzati
  Object.keys(categorizedExercises).forEach((category) => {
    // Contenitore della categoria
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category");

    // Titolo della categoria
    const categoryTitle = document.createElement("h3");
    categoryTitle.textContent = category;
    categoryContainer.appendChild(categoryTitle);

    // Lista di esercizi
    const exerciseUl = document.createElement("ul");
    categorizedExercises[category].forEach((exerciseId) => {
      const exerciseLi = document.createElement("li");

      const exerciseCheckbox = document.createElement("input");
      exerciseCheckbox.type = "checkbox";
      exerciseCheckbox.value = exerciseId;

      // Imposta lo stato del checkbox in base agli esercizi salvati nel gruppo
      exerciseCheckbox.checked = savedGroup.exercises.includes(exerciseId);

      const exerciseLabel = document.createElement("label");
      exerciseLabel.textContent = exerciseNames[exerciseId] || "Esercizio Sconosciuto";
      exerciseLabel.htmlFor = `checkbox-${exerciseId}`;

      exerciseLi.appendChild(exerciseCheckbox);
      exerciseLi.appendChild(exerciseLabel);
      exerciseUl.appendChild(exerciseLi);
    });

    categoryContainer.appendChild(exerciseUl);
    editExerciseList.appendChild(categoryContainer);
  });
}

function closeEditGroupModal() {
  const modal = document.getElementById("edit-modal");
  const overlay = document.getElementById("global-modal-overlay");

  if (!modal || !overlay) {
    console.error("Elemento 'edit-modal' o 'global-modal-overlay' non trovato!");
    return;
  }

  modal.style.display = "none";
  overlay.style.display = "none";

  // Aggiungi aria-hidden
  modal.setAttribute("aria-hidden", "true");

  // Rimuovi il focus dagli elementi del modal
  document.activeElement.blur();

  currentEditGroupIndex = null; // Reimposta l'indice
}


//Event Listeners:
// Chiude il modal al click
document.getElementById("close-modal").addEventListener("click", closeNewGroupModal);

// Aggiungi un listener per il pulsante "NUOVO"
document.getElementById("create-new-group").addEventListener("click", openNewGroupModal);

// Chiudi il modal senza salvare
document.getElementById("cancel-edit-group").onclick = closeEditGroupModal;



// CONTROLLER: Logica di coordinamento e iterazioni utente

// Riproduzione esercizi:
function playExerciseGroup(exerciseGroup) {
  let currentExerciseIndex = 0; // Indice dell'esercizio corrente
  let completedArpeggiosCumulative = 0; // Arpeggi completati in totale
  isPlaying = true;  
  isPaused = false;

  function playCurrentExercise() {
    if (currentExerciseIndex >= exerciseGroup.length) {
      console.log("Tutti gli esercizi del gruppo sono stati completati.");
      Tone.Transport.stop();
      return;
    }

    const currentExercise = exerciseGroup[currentExerciseIndex];
    console.log(`Avvio esercizio: ${currentExercise}`);

    // Aggiorna nome e descrizione dell'esercizio
    updateCurrentExerciseLabel(currentExercise);

    const totalRangeCyclesNeeded = 1; // Numero di salite e discese necessarie per completare un esercizio

    playArpeggioWithRange(
      currentExercise,
      exerciseGroup.length, // Passa il numero totale di esercizi al parametro totalExercises
      (completedRangeCycles, updatedCompletedArpeggios) => {
        completedArpeggiosCumulative = updatedCompletedArpeggios; // Aggiorna il progresso cumulativo
        if (completedRangeCycles >= totalRangeCyclesNeeded) {
          console.log(`Esercizio completato: ${currentExercise}`);
          currentExerciseIndex++;
          playCurrentExercise(); // Passa al prossimo esercizio
        }
      },
      completedArpeggiosCumulative // Passa il progresso cumulativo
    );
  }

  playCurrentExercise();
}


function playArpeggioWithRange(selectedExerciseParam = DEFAULT_EXERCISE, totalExercises = 1, onCycleComplete = null, completedArpeggiosCumulative = 0) {
  const selectedRange = vocalRanges[vocalRangeSelector.value];
  minNote = selectedRange.min;
  maxNote = selectedRange.max;

  selectedExercise = selectedExerciseParam;



  notesData = generateInitialArpeggio(minNote, DEFAULT_REFERENCE_NOTE, selectedExercise);
  console.log(`Selected exercise before play: ${selectedExercise}`);
  console.log(`Generated notes: ${JSON.stringify(notesData)}`);

  synth = new Tone.Synth().toDestination();
  currentNoteIndex = 0;
  currentDirection = "ascendente";
  completedRangeCycles = 0;
  totalRangeCyclesRequired = 1;
  completedArpeggios = 0;
  totalArpeggiosRequired = totalExercises * 48;

  console.log(`Numero totale di arpeggi richiesti: ${totalArpeggiosRequired}`);
  console.log(`Numero totale di salite e discese richieste per esercizio: ${totalRangeCyclesRequired}`);

  // Resetta la barra di progresso
  progressBar = document.getElementById("progress-bar");
  if (!progressBar) {
    console.error("Elemento con ID 'progress-bar' non trovato!");
    return;
  }
  progressBar.style.width = "0%";
  console.log("Elemento progress-bar trovato:", progressBar);

  // Inizializza il ciclo
  playNextNote();
}

function playNextNote() {
  console.log(`Esecuzione di playNextNote. Esercizio corrente: ${selectedExercise}`);

  // Se è in pausa, blocca l'esecuzione
  if (isPaused) {
    console.log("Playback in pausa.");
    return;
  }

  // Verifica se ci sono note da suonare
  if (!notesData || notesData.length === 0) {
    console.error("notesData è vuoto o non definito.");
    return;
  }

  const noteData = notesData[currentNoteIndex];
  console.log(`Nota corrente: ${noteData.note} con durata: ${noteData.duration}`);

  // Feedback visivo sulla tastiera
  removeAllKeyFeedback();
  addKeyFeedback(noteData.note);

  // Suona la nota
  synth.triggerAttackRelease(noteData.note, noteData.duration);

  // Passa alla nota successiva
  currentNoteIndex = (currentNoteIndex + 1) % notesData.length;

  // Controllo per completare l'arpeggio
  if (currentNoteIndex === 0) {
    completedArpeggios++;
    const progress = ((completedArpeggios) / totalArpeggiosRequired) * 100;
    progressBar.style.width = `${progress}%`;

    if (currentDirection === "ascendente") {
      notesData = notesData.map((note) => ({
        note: Tone.Frequency(note.note).transpose(1).toNote(),
        duration: note.duration
      }));

      if (Tone.Frequency(notesData[notesData.length - 1].note).toFrequency() >= Tone.Frequency(maxNote).toFrequency()) {
        currentDirection = "discendente";
      }
    } else {
      notesData = notesData.map((note) => ({
        note: Tone.Frequency(note.note).transpose(-1).toNote(),
        duration: note.duration
      }));

      if (Tone.Frequency(notesData[0].note).toFrequency() <= Tone.Frequency(minNote).toFrequency()) {
        currentDirection = "ascendente";
        completedRangeCycles++;

        if (completedRangeCycles >= totalRangeCyclesRequired) {
          console.log(`Esercizio completato: ${selectedExercise}`);
          return;
        }
      }
    }
  }

  // Se non è in pausa, continua a suonare la prossima nota
  if (!isPaused) {
    currentTimeoutId = setTimeout(playNextNote, Tone.Time(noteData.duration).toMilliseconds());
  }
}


function stopArpeggio() {
  console.log("Riproduzione fermata.");

  if (currentTimeoutId !== null) {
    clearTimeout(currentTimeoutId);
  }

  Tone.Transport.stop();
  currentNoteIndex = 0;
  isPlaying = false;
  isPaused = false;
  removeAllKeyFeedback();

  // Resetta la progress bar
  if (progressBar) {
    progressBar.style.width = "0%";
  }
}

// Event Listener: aggiorna l'esercizio selezionato al click di un pulsante
document.querySelectorAll(".exercise-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    selectedExercise = button.getAttribute("data-exercise");
    console.log(`Nuovo esercizio selezionato: ${selectedExercise}`);
    updateCurrentExerciseLabel(selectedExercise);
  });
});


// Controlli di Playback:

function pauseExerciseGroup(button) {
  if (isProcessingPause) return; // Previene click multipli rapidi
  isProcessingPause = true;

  if (!isPlaying) {
    console.log("Nessun esercizio in corso da mettere in pausa.");
    isProcessingPause = false;
    return;
  }

  if (!isPaused) {
    // Metti in pausa
    isPaused = true;
    clearTimeout(currentTimeoutId);  // Annulla il timeout corrente
    console.log("Playback messo in pausa. Timeout cancellato.");
    button.textContent = "Resume";
  } else {
    // Riprendi
    isPaused = false;
    console.log("Playback ripreso.");
    button.textContent = "Pause";
    playNextNote();  // Riprendi dal punto in cui era stato interrotto
  }

  // Sblocca il pulsante dopo 300ms per evitare click multipli rapidi
  setTimeout(() => {
    isProcessingPause = false;
  }, 300);
}

//Selettori Globali
const playButton = document.getElementById("arpeggio");
const stopButton = document.getElementById("stop");

playButton.addEventListener("click", async () => {
  await Tone.start();  // Assicura che l'audio sia avviato
  console.log(`Avvio esercizio: ${selectedExercise}`);
  isPlaying = true;
  isPaused = false;

  // Avvia direttamente l'arpeggio per qualsiasi esercizio selezionato
  playArpeggioWithRange(selectedExercise);
});


stopButton.addEventListener("click", () => {
  stopArpeggio();  // Ferma l'arpeggio per qualsiasi esercizio

  // Ferma l'audio di esempio se è in riproduzione
  if (currentExampleAudio) {
    currentExampleAudio.pause();
    currentExampleAudio.currentTime = 0;
  }
});


// Event Listener: passa il riferimento al pulsante pausa
let isProcessingPause = false;
const pauseButtons = document.querySelectorAll(".pause-group");
pauseButtons.forEach((button) => {
  button.addEventListener("click", (event) => pauseExerciseGroup(event.target));
});



// Gestione dei gruppi

function saveExerciseGroup() {
  const groupName = document.getElementById("new-group-name").value.trim();
  if (!groupName) {
    alert("Inserisci un nome per il gruppo.");
    return;
  }

  // Recupera gli esercizi selezionati
  const selectedExercises = Array.from(
    document.querySelectorAll("#exercise-list input[type='checkbox']") // Assicurati che corrisponda al contenitore corretto
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  console.log("Esercizi selezionati:", selectedExercises); // Debug

  if (selectedExercises.length === 0) {
    alert("Seleziona almeno un esercizio.");
    return;
  }

  // Salva il gruppo nel MODEL
  const group = { name: groupName, exercises: selectedExercises };
  saveGroupToLocalStorage(group);

  // Aggiorna la VIEW
  renderSavedGroups();

  // Chiudi il modale
  closeNewGroupModal();

  alert(`Gruppo "${groupName}" salvato con successo!`);
}

function saveGroupEdits(index, exerciseList) {
  const checkboxes = exerciseList.querySelectorAll("input[type='checkbox']");
  const updatedExercises = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked) // Recupera solo i checkbox selezionati
    .map((checkbox) => checkbox.value);

  // Aggiorna il gruppo nel MODEL
  const savedGroups = getSavedGroups();
  savedGroups[index].exercises = updatedExercises;
  localStorage.setItem("savedGroups", JSON.stringify(savedGroups));

  // Aggiorna la VIEW
  renderSavedGroups();

  // Chiudi il modale
  const modal = document.getElementById("edit-modal");
  if (modal) {
    document.body.removeChild(modal);
  }

  alert(`Gruppo modificato con successo!`);
}


function setSelectedGroup(index) {
  const group = getGroupByIndex(index);
  if (group) {
    currentGroup = group;
    console.log(`Gruppo selezionato: ${group.name}`);
  } else {
    console.error("Impossibile caricare il gruppo selezionato");
  }
}

function loadDefaultGroups() {
  console.log("Eseguendo loadDefaultGroups...");
  const savedGroups = getSavedGroups();
  if (savedGroups.length === 0) {
    defaultGroups.forEach(group => saveGroupToLocalStorage(group));
    console.log("Gruppi predefiniti caricati:", defaultGroups);
  } else {
    console.log("Gruppi salvati già presenti, nessun caricamento necessario.");
  }
}

// Salva le modifiche
document.getElementById("save-edit-group").onclick = () => {
  const editExerciseList = document.getElementById("edit-exercise-list");
  if (!editExerciseList) {
    console.error("Elemento 'edit-exercise-list' non trovato nel DOM!");
    return;
  }

  // Recupera i nuovi esercizi selezionati
  const updatedExercises = Array.from(
    editExerciseList.querySelectorAll("input[type='checkbox']")
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  console.log("Esercizi aggiornati:", updatedExercises);

  // Recupera i gruppi salvati
  const savedGroups = getSavedGroups();

  // Verifica se l'indice del gruppo esiste
  if (currentEditGroupIndex !== null && currentEditGroupIndex >= 0 && currentEditGroupIndex < savedGroups.length) {
    // Aggiorna il gruppo specifico
    savedGroups[currentEditGroupIndex] = { ...savedGroups[currentEditGroupIndex], exercises: updatedExercises };

    // Salva i gruppi aggiornati nel localStorage
    localStorage.setItem("savedGroups", JSON.stringify(savedGroups));

    // Aggiorna la vista
    renderSavedGroups();

    // Chiudi il modal
    closeEditGroupModal();

    alert("Gruppo modificato con successo!");
  } else {
    console.error("Indice del gruppo non valido.");
  }
};


// UTILITY: funzioni di supporto

function playExampleAudio(audioFile) {
  // Se un audio è già in riproduzione, lo ferma
  if (currentExampleAudio) {
    currentExampleAudio.pause();
    currentExampleAudio.currentTime = 0;
  }

  // Crea un nuovo oggetto Audio e lo riproduce
  currentExampleAudio = new Audio(audioFile);
  currentExampleAudio.play();
}

// Aggiunge l'evento ai pulsanti di esempio
document.querySelectorAll(".play-example-btn").forEach(button => {
  button.addEventListener("click", function () {
    const audioFile = this.getAttribute("data-audio");
    playExampleAudio(audioFile);
  });
});


function saveNewGroup() {
  const groupNameInput = document.getElementById("new-group-name");
  const groupName = groupNameInput.value.trim();

  if (!groupName) {
    alert("Inserisci un nome per il gruppo.");
    return;
  }

  const selectedExercises = Array.from(
    document.querySelectorAll("#new-exercise-list input[type='checkbox']")
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  if (selectedExercises.length === 0) {
    alert("Seleziona almeno un esercizio.");
    return;
  }

  // Salva il gruppo (Model)
  const newGroup = { name: groupName, exercises: selectedExercises };
  saveGroupToLocalStorage(newGroup);

  // Aggiorna la lista dei gruppi salvati (View)
  renderSavedGroups();

  // Chiudi il modal (View)
  closeNewGroupModal();

  alert(`Gruppo "${groupName}" salvato con successo!`);
}

// Event listener: per salvare i gruppi
document.getElementById("save-group").addEventListener("click", saveExerciseGroup);

