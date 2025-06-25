
import { Yin } from "https://cdn.jsdelivr.net/npm/@dipscope/pitch-detector/+esm";


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


// Pitch exercises
const yin = new Yin({ bufferSize: 2048, threshold: 0.15 });
let audioContext;
let source;
let processor;
let isListening = false;
let targetNotes = [];
let currentStep = 0;
let exerciseType = null;
let selectedRoot = "C4";
let pendingExercise = null;
let vocalRange = { min: 98, max: 523 };
let chosenIntervals = [];
let exercisePart = null;




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
    description: "Sing the long note without straining; volume does not matter, just focus on activating the vocal cords."
  },
  vocal2: {
    name: "Lip Thrill",
    description: "Perform a lip trill while relaxing the entire vocal apparatus as much as possible. Keep the airflow steady."
  },
  vocal3: {
    name: "Ng",
    description: "Try to connect all the notes smoothly without gaps in the sound—imagine it as stretching for your vocal cords."
  },
  vocal4: {
    name: "Ng-Vocal",
    description: "Make the transition from 'ng' to vowel as effortless as possible; nothing in your position should change during the switch."
  },
  vocal5: {
    name: "VVVV",
    description: "This exercise helps relax the false vocal cords. Keep the sound steady."
  },
  vocal6: {
    name: "Hi Hi Hi",
    description: "Imagine eating an apple while performing these sounds to project the voice forward."
  },
  vocal7: {
    name: "IAIAIAIAIAIAIAIAIA",
    description: "Relax everything, especially your jaw."
  },
  arpeggio1: {
    name: "IEAOU",
    description: "Relax the sound, hit the right notes, and make transitions between vowels smooth and even."
  },
  arpeggio2: {
    name: "UUUU",
    description: "Keep the sound steady and soften it."
  },
  arpeggio3: {
    name: "Lui",
    description: "Use the 'L' sound to help bring the voice forward—take advantage of it."
  },
  arpeggio4: {
    name: "IUUU",
    description: "Focus on correctly performing the intervals without straining on the higher notes."
  },
  arpeggio5: {
    name: "Ha Ha Ha Ha",
    description: "Relax the diaphragm and start the note with air."
  },
  articulation1: {
    name: "GAGIGAGIGAGI",
    description: "Focus on the sound of the consonants."
  },
  articulation2: {
    name: "GHIGHIGHI con glissando",
    description: "Focus on the consonant sounds while keeping the volume consistent."
  },
  articulation3: {
    name: "BABABABABA",
    description: "Relax the jaw."
  },
  articulation4: {
    name: "MINU",
    description: "Focus on breath support; keep the floating ribs expanded throughout the vocal emission."
  },
  range1: {
    name: "IEEE",
    description: "Maintain a soft and projected sound without straining."
  },
  range2: {
    name: "VIA",
    description: "Use the 'V' sound to bring the voice forward—stay flexible."
  },
  range3: {
    name: "ZING",
    description: "The 'ng' sound naturally projects forward; use it to ascend without straining."
  },
  range4: {
    name: "VVV e Lo",
    description: "Perform this exercise first with the 'V' sound to relax the cords and then with 'Lo' to project the sound forward."
  },
  belt1: {
    name: "Bambini Brutti",
    description: "Do NOT release air—let it out completely before producing sound. Imagine being a whining child."
  },
  belt2: {
    name: "GNEGNE",
    description: "Without air, complain like an annoying child."
  },
  belt3: {
    name: "NONONO",
    description: "Project the sound forward without straining."
  },
  belt4: {
    name: "SolFaMiReDoSolDo",
    description: "Have fun and relax."
  },
  belt5: {
    name: "WATA",
    description: "Imagine shooting the sound far away. Like you are a Super Saiyan"
  },
  legit1: {
    name: "IAAAIOOIAAIOOIA",
    description: "Maintain a soft and relaxed sound."
  },
  legit2: {
    name: "IIII",
    description: "Use the 'I' sound to ascend higher than usual. Don’t strain your throat; imagine the sound coming from your cheekbones."
  },
  legit3: {
    name: "Silanelgiardinleroseinfior",
    description: "Think of yourself as an opera singer—fill the room with sound."
  },
  legit4: {
    name: "UIUIUI",
    description: "Relax and focus on flexibility without increasing volume."
  },
  cooldown1: {
    name: "Vocal Fry",
    description: "Try to imitate the sound. Keep the larynx low and fully relaxed."
  },
  cooldown2: {
    name: "Vocal Fry alto",
    description: "Try to bring the vocal fry position higher, as if the sound is coming from your cheekbones."
  }
}


// Gruppi predefiniti
const defaultGroups = [
  {
    name: "Quick Warmup",
    exercises: ["vocal3", "arpeggio2", "articulation4", "belt4", "cooldown1"]
  },
  {
    name: "Long Warmup",
    exercises: ["vocal1", "vocal2", "arpeggio1", "arpeggio3", "articulation1", "articulation2", "legit3"]
  },
  {
    name: "Legit Warmup",
    exercises: ["vocal1", "vocal4", "arpeggio3", "arpeggio5", "articulation4", "range1", "range4", "legit1", "legit2", "legit3"]
  },
  {
    name: "Belt Warmup",
    exercises: ["vocal3", "vocal4", "arpeggio2", "articulation2", "articulation4", "belt1", "belt3", "belt5"]
  }
];




// Definiamo i range delle vocalità
const vocalRanges = {
  basso: { min: "E2", max: "E3" },
  baritone: { min: "G2", max: "G3" },
  tenore: { min: "C3", max: "C4" },
  contralto: { min: "F3", max: "F4" },
  mezzo: { min: "A3", max: "A4" },
  soprano: { min: "C4", max: "C5" }
};

// Pitch exercises

const simpleExercisesDescriptions = {
  arpeggios: "First listen to the arpeggio. Then sing the first note; once you sing it correctly, it will be played again for confirmation. Wait for the next instruction on screen before singing the next note.",
  scales: "First listen to the full scale. Then sing the first note; once you sing it correctly, it will be played again for confirmation. Wait for the next instruction on screen before singing the next note.",
  randomIntervals: "First listen to the full sequence of intervals. Then sing the first note; once you sing it correctly, it will be played again for confirmation. Wait for the next instruction on screen before singing the next note, which will be separated from the previous one by the interval shown (the note in parentheses is the target)."
};




// Funzioni per la gestione dei GRUPPI di esercizi

function getSavedGroups() {
  try {
    return JSON.parse(localStorage.getItem("savedGroups")) || [];
  } catch (error) {
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
    return [];
  }


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



// Pitch Exercises: 
function showExerciseDescription(type) {
  const descriptionBox = document.getElementById('simple-exercise-description');
  if (type === 'Arpeggi') {
    descriptionBox.textContent = simpleExercisesDescriptions.arpeggios;
  } else if (type === 'Scale') {
    descriptionBox.textContent = simpleExercisesDescriptions.scales;
  } else if (type === 'Intervalli') {
    descriptionBox.textContent = simpleExercisesDescriptions.randomIntervals;
  }
}

function openModal(type) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const buttons = document.getElementById('modal-buttons');
  modal.style.display = 'flex';

  buttons.innerHTML = '';

  if (type === 'Arpeggi') {
    title.textContent = 'Choose an Arpeggio Type ';
    addButton('major', (exerciseType) => openNoteModal('Arpeggi', exerciseType));
    addButton('minor', (exerciseType) => openNoteModal('Arpeggi', exerciseType));
  } else if (type === 'Scale') {
    title.textContent = 'Choose a Scale Type';
    addButton('major', (exerciseType) => openNoteModal('Scale', exerciseType));
    addButton('minor', (exerciseType) => openNoteModal('Scale', exerciseType));
    addButton('cromatic', (exerciseType) => openNoteModal('Scale', exerciseType));
  }
}

function openNoteModal(exerciseCategory, exerciseType) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const buttons = document.getElementById('modal-buttons');
  modal.style.display = 'flex';

  buttons.innerHTML = '';
  title.textContent = 'Choose the starting note';

  const startingNotes = ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  startingNotes.forEach(note => {
    addButton(note, (selectedNote) => {
      closeModal();
      if (exerciseCategory === 'Arpeggi') startArpeggio(exerciseType, selectedNote);
      else if (exerciseCategory === 'Scale') startScala(exerciseType, selectedNote);
    });
  });
}


function closeModal() {
  document.getElementById('modal').style.display = 'none';
  startMicrophone();
}

function addButton(text, callback) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.onclick = () => {
    callback(text);
  };
  document.getElementById('modal-buttons').appendChild(btn);
}


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

document.getElementById('stopPlayback').addEventListener('click', () => {
  stopExercise(); // Usa la funzione vera che resetta tutto
  console.log('Playback fermato');
});

// Pitch exercises
function frequencyToNote(frequency) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const A4 = 440;
  const semitone = 12 * Math.log2(frequency / A4);
  const noteIndex = Math.round(semitone) + 57;
  const octave = Math.floor(noteIndex / 12);
  const noteName = notes[(noteIndex % 12 + 12) % 12];
  return `${noteName}${octave}`;
}

function noteToFrequency(note) {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return null;
  const [_, noteName, octave] = match;
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteIndex = notes.indexOf(noteName);
  const noteNumber = noteIndex + parseInt(octave) * 12;
  const A4_INDEX = 9 + 4 * 12;
  const semitoneDiff = noteNumber - A4_INDEX;
  return 440 * Math.pow(2, semitoneDiff / 12);
}

function getCentsDifference(frequency, targetFrequency) {
  return 1200 * Math.log2(frequency / targetFrequency);
}





// CONTROLLER: Logica di coordinamento e iterazioni utente

// Riproduzione esercizi:
function playExerciseGroup(exerciseGroup) {
  let currentExerciseIndex = 0; // Indice dell'esercizio corrente
  let completedArpeggiosCumulative = 0; // Arpeggi completati in totale
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
  if (isPlaying) stopArpeggio();  
  isPlaying = true;
  isPaused  = false;

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
  totalArpeggiosRequired = totalExercises * 15;

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

      const descendingStep = 3; // Scende di 3 semitoni invece di 1
      notesData = notesData.map((note) => ({
        note: Tone.Frequency(note.note).transpose(-descendingStep).toNote(),
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







// Pitch Exercises

async function startMicrophone() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  source = audioContext.createMediaStreamSource(stream);
  processor = audioContext.createScriptProcessor(2048, 1, 1);
  source.connect(processor);
  processor.connect(audioContext.destination);

  let holdStart = null;
  let isHolding = false;

  processor.onaudioprocess = (event) => {
    if (!isListening) return;
    const input = event.inputBuffer.getChannelData(0);
    const pitch = yin.detect(input, audioContext.sampleRate);

    if (pitch && targetNotes.length > 0 && targetNotes[currentStep]) {
      const detected = frequencyToNote(pitch);
      document.getElementById('note-display').textContent = `Note detected: ${detected}`;

      const expectedFrequency = noteToFrequency(targetNotes[currentStep]);
      if (!expectedFrequency) return;

      const cents = getCentsDifference(pitch, expectedFrequency);


      if (Math.abs(cents) < 40) {
        if (!holdStart) {
          holdStart = Date.now();
          isHolding = true;
          document.getElementById('instruction-display').textContent = "Hold the pitch...";
        } else if (Date.now() - holdStart > 500) {
          if (exerciseType === 'arpeggio' || exerciseType === 'scale') {
            currentStep++;
            holdStart = null;
            isHolding = false;
            if (currentStep >= targetNotes.length) {
              document.getElementById('instruction-display').textContent = "Exercise completed!";
              isListening = false;
            } else {
              document.getElementById('instruction-display').textContent = "Good job! Next note:";
              setTimeout(() => {
                document.getElementById('instruction-display').textContent = `Sing: ${targetNotes[currentStep]}`;
                playNote(targetNotes[currentStep - 1]);
              }, 1000);
            }
          }

          if (exerciseType === 'intervalli-random') {
            playNote(targetNotes[currentStep]); // Suona la nota appena cantata giusta
            currentStep++;
            holdStart = null;
            isHolding = false;
            if (currentStep >= targetNotes.length) {
              document.getElementById('instruction-display').textContent = "Exercise completed!";
              isListening = false;
            } else {
              const intervalName = chosenIntervals[currentStep - 1].name;
              const nextNote = targetNotes[currentStep];
              document.getElementById('instruction-display').textContent = `Sing a ${intervalName} (${nextNote})`;
            }
          }
        }
      }
    }
  }
}

function playNote(note, time = Tone.now()) {
  synth.triggerAttackRelease(note, "8n", time);
}


function startArpeggio(type, rootNote) {
  exerciseType = 'arpeggio';
  currentStep = 0;

  const semitoneOffsets = (type === 'major') ? [0, 4, 7] : [0, 3, 7];

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootMatch = rootNote.match(/^([A-G]#?)(\d)$/);
  const rootIndex = notes.indexOf(rootMatch[1]);
  const rootOctave = parseInt(rootMatch[2]);

  const ascending = semitoneOffsets.map(offset => {
    let noteIndex = rootIndex + offset;
    let octave = rootOctave;
    while (noteIndex >= 12) {
      noteIndex -= 12;
      octave += 1;
    }
    return `${notes[noteIndex]}${octave}`;
  });

  const descending = [...ascending].reverse().slice(1);
  targetNotes = [...ascending, ...descending];

  // Creiamo gli eventi
  const events = targetNotes.map((note, index) => [index * 0.4, note]);

  if (exercisePart) {
    exercisePart.dispose();
  }

  exercisePart = new Tone.Part((time, note) => {
    playNote(note, time);
  }, events);

  exercisePart.start(0);
  Tone.Transport.start();

  document.getElementById('instruction-display').textContent = `Listen to the arpeggio...`;

  const totalDuration = targetNotes.length * 0.4;
  setTimeout(() => {
    document.getElementById('instruction-display').textContent = `Now sing the arpeggio!`;
    isListening = true;
  }, totalDuration * 1000);
}


function startScala(type, rootNote) {
  exerciseType = 'scale';
  currentStep = 0;

  const scalePatterns = {
    "major": [0, 2, 4, 5, 7, 9, 11, 12],
    "minor": [0, 2, 3, 5, 7, 8, 10, 12],
    "cromatic": Array.from({ length: 13 }, (_, i) => i)
  };

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootMatch = rootNote.match(/^([A-G]#?)(\d)$/);
  const rootIndex = notes.indexOf(rootMatch[1]);
  const rootOctave = parseInt(rootMatch[2]);

  const ascending = scalePatterns[type].map(offset => {
    let noteIndex = rootIndex + offset;
    let octave = rootOctave;
    while (noteIndex >= 12) {
      noteIndex -= 12;
      octave += 1;
    }
    return `${notes[noteIndex]}${octave}`;
  });

  const descending = [...ascending].reverse().slice(1);
  targetNotes = [...ascending, ...descending];

  // Creiamo gli eventi
  const events = targetNotes.map((note, index) => [index * 0.4, note]);

  if (exercisePart) {
    exercisePart.dispose();
  }

  exercisePart = new Tone.Part((time, note) => {
    playNote(note, time);
  }, events);

  exercisePart.start(0);
  Tone.Transport.start();

  document.getElementById('instruction-display').textContent = `Listen to the scale...`;

  const totalDuration = targetNotes.length * 0.4;
  setTimeout(() => {
    document.getElementById('instruction-display').textContent = 'Now sing the scale!';
    isListening = true;
  }, totalDuration * 1000);
}


function startAccordiRandom(startingNote) {
  exerciseType = 'intervalli-random';
  currentStep = 0;
  targetNotes = [startingNote];
  chosenIntervals = [];
  const intervalsAvailable = [
    { name: "Major second up", semitones: 2 },
    { name: "Minor second down", semitones: -1 },
    { name: "Major third up", semitones: 4 },
    { name: "Minor third down", semitones: -3 },
    { name: "Perfect fourth up", semitones: 5 },
    { name: "Perfect fifth down", semitones: -7 }
  ];


  for (let i = 0; i < 5; i++) {
    const random = intervalsAvailable[Math.floor(Math.random() * intervalsAvailable.length)];
    chosenIntervals.push(random);
  }

  let currentFrequency = noteToFrequency(startingNote);

  chosenIntervals.forEach(interval => {
    currentFrequency *= Math.pow(2, interval.semitones / 12);
    const nextNote = frequencyToNote(currentFrequency);
    targetNotes.push(nextNote);
  });

  Tone.start();

  // Creiamo gli eventi come negli altri esercizi
  const events = targetNotes.map((note, index) => [index * 0.8, note]); // 0.8s invece di 0.4s per dare tempo di ascoltare

  if (exercisePart) {
    exercisePart.dispose();
  }

  exercisePart = new Tone.Part((time, note) => {
    playNote(note, time);
  }, events);

  exercisePart.start(0);
  Tone.Transport.start();

  document.getElementById('instruction-display').textContent = `Listen to the sequence...`;

  const totalDuration = targetNotes.length * 0.8;
  setTimeout(() => {
    document.getElementById('instruction-display').textContent = `Now sing the sequence`;
    isListening = true;
    startMicrophone();

  }, totalDuration * 1000);
}




function confirmAccordiRandom() {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const buttons = document.getElementById('modal-buttons');
  modal.style.display = 'flex';

  buttons.innerHTML = '';
  title.textContent = 'Seleziona il tuo vocal range:';

  addButton('Bass (E2–E3)', () => {
    vocalRange = { min: 82, max: 165 };
    chooseStartingNoteForRandom();
  });
  addButton('Baritone (G2–G3)', () => {
    vocalRange = { min: 98, max: 196 };
    chooseStartingNoteForRandom();
  });
  addButton('Tenor (C3–C4)', () => {
    vocalRange = { min: 130, max: 261 };
    chooseStartingNoteForRandom();
  });
  addButton('Alto (F3–F4)', () => {
    vocalRange = { min: 174, max: 349 };
    chooseStartingNoteForRandom();
  });
  addButton('Mezzo (A3–A4)', () => {
    vocalRange = { min: 220, max: 440 };
    chooseStartingNoteForRandom();
  });
  addButton('Soprano (C4–C5)', () => {
    vocalRange = { min: 261, max: 523 };
    chooseStartingNoteForRandom();
  });
}


function chooseStartingNoteForRandom() {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const buttons = document.getElementById('modal-buttons');

  buttons.innerHTML = '';
  title.textContent = 'Scegli nota di partenza';

  const startingNotes = ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  startingNotes.forEach(note => {
    addButton(note, (selectedNote) => {
      closeModal();
      startAccordiRandom(selectedNote);
    });
  });
}

function stopExercise() {
  console.log("Esercizio stoppato");
  isListening = false;
  currentStep = 0;
  exerciseType = null;

  Tone.Transport.stop();

  document.getElementById('instruction-display').textContent = "Exercise stopped";
  document.getElementById('note-display').textContent = "";
}


window.openModal = openModal;
window.closeModal = closeModal;
window.confirmAccordiRandom = confirmAccordiRandom;

document.getElementById('arpeggios-btn').addEventListener('click', () => {
  stopExercise(); // ← aggiunto
  openModal('Arpeggi');
  showExerciseDescription('Arpeggi');
});

document.getElementById('scale-btn').addEventListener('click', () => {
  stopExercise(); // ← aggiunto
  openModal('Scale');
  showExerciseDescription('Scale');
});

document.getElementById('random-intervals-btn').addEventListener('click', () => {
  stopExercise(); // ← aggiunto
  confirmAccordiRandom();
  showExerciseDescription('Intervalli');
});





