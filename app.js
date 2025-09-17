let deck = [];
let originalDeck = [];
let currentIndex = 0;
let isShuffled = false;

const flashcard = document.getElementById("flashcard");
const front = document.querySelector(".flashcard-front");
const back = document.querySelector(".flashcard-back");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const nextCardBtn = document.getElementById("nextCardBtn");
const deckSelect = document.getElementById("deckSelect");
const progressText = document.getElementById("progressText");
const shuffleToggle = document.getElementById("shuffleToggle");
const prevCardBtn = document.getElementById("prevCardBtn");

// Initialise progress text on page load
showCard();

// Load deck automatically when selection changes
deckSelect.addEventListener("change", loadDeck);

function loadDeck() {
  const selectedValue = deckSelect.value;
  if (!selectedValue) return;

  const deckFile = "decks/" + selectedValue;
  fetch(deckFile)
    .then((res) => res.json())
    .then((data) => {
      originalDeck = [...data]; // store original order
      deck = [...originalDeck];
      if (isShuffled) deck = shuffle([...deck]);
      currentIndex = 0;
      flashcard.classList.remove("flipped");
      showCard();
    })
    .catch((err) => {
      front.textContent = "Error loading deck.";
      back.textContent = "";
      console.error(err);
    });
}

showAnswerBtn.addEventListener("click", () => {
  if (deck.length > 0 && front.textContent.trim() !== "") {
    flipCard();
  }
});

prevCardBtn.addEventListener("click", prevCard);

nextCardBtn.addEventListener("click", nextCard);

// Flip card when clicking anywhere on it, only if not empty
flashcard.addEventListener("click", () => {
  if (deck.length > 0 && front.textContent.trim() !== "") {
    flipCard();
  }
});

shuffleToggle.addEventListener("change", () => {
  isShuffled = shuffleToggle.checked;
  if (deck.length > 0) {
    if (isShuffled) {
      deck = shuffle([...originalDeck]);
    } else {
      deck = [...originalDeck]; // restore original order
    }
    currentIndex = 0;
    showCard();
  }
});

function showCard() {
  // Always update progress text
  progressText.textContent =
    deck.length > 0
      ? `Card ${currentIndex + 1} of ${deck.length}`
      : `Card 0 of 0`;

  if (deck.length === 0) {
    front.textContent = "";
    back.textContent = "";
    return;
  }

  const card = deck[currentIndex];

  // FRONT: Hungarian + IPA (if available)
  if (card.ipa) {
    front.innerHTML = `
      <div class="fs-2 fw-bold d-block">${card.hu}</div>
      <div class="text-muted fst-italic d-block">${card.ipa}</div>
    `;
  } else {
    front.textContent = card.hu;
  }

  // BACK: English + example sentences (if available)
  if (card.hu_example && card.en_example) {
    back.innerHTML = `
      <div class="fs-2 fw-bold d-block mb-2">${card.en}</div>
      <div class="fs-4 fst-italic d-block">${card.hu_example}</div>
      <div class="fs-4 text-muted d-block">${card.en_example}</div>
    `;
  } else {
    back.textContent = card.en;
  }
}

function flipCard() {
  flashcard.classList.toggle("flipped");
}

function nextCard() {
  flashcard.classList.remove("flipped");
  const flipDuration = 600; // match CSS transition
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function prevCard() {
  flashcard.classList.remove("flipped");
  const flipDuration = 600;
  setTimeout(() => {
    currentIndex = (currentIndex - 1 + deck.length) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flipCard();
  } else if (e.code === "ArrowRight") {
    nextCard();
  } else if (e.code === "ArrowLeft") {
    prevCard();
  }
});

/*
let deck = [];
let originalDeck = [];
let currentIndex = 0;
let isShuffled = false;

const flashcard = document.getElementById("flashcard");
const front = document.querySelector(".flashcard-front");
const back = document.querySelector(".flashcard-back");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const nextCardBtn = document.getElementById("nextCardBtn");
const prevCardBtn = document.getElementById("prevCardBtn");
const deckSelect = document.getElementById("deckSelect");
const progressText = document.getElementById("progressText");
const shuffleToggle = document.getElementById("shuffleToggle");
const addToMyDeckBtn = document.getElementById("addToMyDeckBtn");
const clearMyDeckBtn = document.getElementById("clearMyDeckBtn");

showCard();

// Load deck automatically when selection changes
deckSelect.addEventListener("change", loadDeck);

function loadDeck() {
  const selectedValue = deckSelect.value;
  if (!selectedValue) return;

  if (selectedValue === "myDeck") {
    const storedDeck = JSON.parse(localStorage.getItem("myDeck")) || [];
    deck = [...storedDeck];
    originalDeck = [...deck];
    currentIndex = 0;
    flashcard.classList.remove("flipped");
    showCard();
    return;
  }

  const deckFile = "decks/" + selectedValue;
  fetch(deckFile)
    .then(res => res.json())
    .then(data => {
      originalDeck = [...data];
      deck = [...originalDeck];
      if (isShuffled) deck = shuffle([...deck]);
      currentIndex = 0;
      flashcard.classList.remove("flipped");
      showCard();
    })
    .catch(err => {
      front.textContent = "Error loading deck.";
      back.textContent = "";
      console.error(err);
    });
}

showAnswerBtn.addEventListener("click", () => {
  if (deck.length > 0 && front.textContent.trim() !== "") {
    flipCard();
  }
});

nextCardBtn.addEventListener("click", nextCard);
prevCardBtn.addEventListener("click", prevCard);

flashcard.addEventListener("click", () => {
  if (deck.length > 0 && front.textContent.trim() !== "") {
    flipCard();
  }
});

shuffleToggle.addEventListener("change", () => {
  isShuffled = shuffleToggle.checked;
  if (deck.length > 0) {
    deck = isShuffled ? shuffle([...originalDeck]) : [...originalDeck];
    currentIndex = 0;
    showCard();
  }
});

// Add to My Deck
addToMyDeckBtn.addEventListener("click", () => {
  if (deck.length === 0) return;

  const card = deck[currentIndex];
  let myDeck = JSON.parse(localStorage.getItem("myDeck")) || [];

  if (!myDeck.some(item => item.hu === card.hu)) {
    myDeck.push(card);
    localStorage.setItem("myDeck", JSON.stringify(myDeck));
    alert(`"${card.hu}" added to your deck!`);
  } else {
    alert(`"${card.hu}" is already in your deck.`);
  }
});

// Clear My Deck
clearMyDeckBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear your deck?")) {
    localStorage.removeItem("myDeck");
    if (deckSelect.value === "myDeck") {
      deck = [];
      originalDeck = [];
      currentIndex = 0;
      showCard();
    }
    alert("Your deck has been cleared.");
  }
});

function showCard() {
  progressText.textContent =
    deck.length > 0
      ? `Card ${currentIndex + 1} of ${deck.length}`
      : `Card 0 of 0`;

  if (deck.length === 0) {
    front.textContent = "";
    back.textContent = "";
    return;
  }

  const card = deck[currentIndex];

  if (card.ipa) {
    front.innerHTML = `
      <div class="fs-2 fw-bold d-block">${card.hu}</div>
      <div class="text-muted fst-italic d-block">${card.ipa}</div>
    `;
  } else {
    front.textContent = card.hu;
  }

  if (card.hu_example && card.en_example) {
    back.innerHTML = `
      <div class="fs-2 fw-bold d-block mb-2">${card.en}</div>
      <div class="fs-4 fst-italic d-block">${card.hu_example}</div>
      <div class="fs-4 text-muted d-block">${card.en_example}</div>
    `;
  } else {
    back.textContent = card.en;
  }
}

function flipCard() {
  flashcard.classList.toggle("flipped");
}

function nextCard() {
  flashcard.classList.remove("flipped");
  const flipDuration = 600;
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function prevCard() {
  flashcard.classList.remove("flipped");
  const flipDuration = 600;
  setTimeout(() => {
    currentIndex = (currentIndex - 1 + deck.length) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flipCard();
  } else if (e.code === "ArrowRight") {
    nextCard();
  } else if (e.code === "ArrowLeft") {
    prevCard();
  }
});

*/
