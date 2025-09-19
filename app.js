// =======================
// STATE
// =======================
let deck = [];
let originalDeck = [];
let currentIndex = 0;
let isShuffled = false;
let showEnglishFront = false;

// =======================
// DOM ELEMENTS
// =======================
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
const removeFromMyDeckBtn = document.getElementById("removeFromMyDeckBtn");
const navButtons = document.getElementById("navButtons");

// =======================
// INITIALISATION
// =======================
updateMyDeckOption();
autoLoadDeck();

// =======================
// EVENT LISTENERS
// =======================
deckSelect.addEventListener("change", loadDeck);

showAnswerBtn.addEventListener("click", () => {
  if (deck.length && front.textContent.trim()) flipCard();
});

nextCardBtn.addEventListener("click", nextCard);
prevCardBtn.addEventListener("click", prevCard);

shuffleToggle.addEventListener("change", toggleShuffle);

document.getElementById("toggle-sides").addEventListener("click", () => {
  showEnglishFront = !showEnglishFront;
  showCard();
});

// Touch/click to flip
if ("ontouchstart" in window) {
  flashcard.addEventListener("touchstart", handleFlip, { passive: false });
} else {
  flashcard.addEventListener("click", handleFlip);
}

// =======================
// FUNCTIONS
// =======================

// --- Deck loading ---
function setDeckFromArray(arr) {
  deck = [...arr];
  originalDeck = [...arr];
}

function autoLoadDeck() {
  const myDeckData = JSON.parse(localStorage.getItem("myDeck")) || [];
  if (myDeckData.length) {
    deckSelect.value = "myDeck";
    addToMyDeckBtn.style.display = "none";
    removeFromMyDeckBtn.style.display = "inline-block";
    setDeckFromArray(myDeckData);
    currentIndex = 0;
    flashcard.classList.remove("flipped");
    showCard();
  } else {
    const firstDeckOption = deckSelect.querySelector(
      "option[value]:not([disabled])"
    );
    if (firstDeckOption) {
      deckSelect.value = firstDeckOption.value;
      loadDeck();
    }
  }
}

function loadDeck() {
  const selectedValue = deckSelect.value;
  if (!selectedValue) {
    setDeckFromArray([]);
    currentIndex = 0;
    showCard();
    return;
  }

  if (selectedValue === "myDeck") {
    addToMyDeckBtn.style.display = "none";
    removeFromMyDeckBtn.style.display = "inline-block";
    const storedDeck = JSON.parse(localStorage.getItem("myDeck")) || [];
    setDeckFromArray(storedDeck);
    currentIndex = 0;
    flashcard.classList.remove("flipped");
    showCard();
    return;
  }

  addToMyDeckBtn.style.display = "inline-block";
  removeFromMyDeckBtn.style.display = "none";

  fetch("decks/" + selectedValue)
    .then((res) => res.json())
    .then((data) => {
      setDeckFromArray(data);
      if (isShuffled) deck = shuffle([...deck]);
      currentIndex = 0;
      flashcard.classList.remove("flipped");
      showCard();
    })
    .catch((err) => {
      console.error(err);
      front.textContent = "Error loading deck.";
      back.textContent = "";
      setDeckFromArray([]);
      showCard();
    });
}

// --- My Deck management ---
addToMyDeckBtn.addEventListener("click", () => {
  if (!deck.length) return;
  const card = deck[currentIndex];
  let myDeck = JSON.parse(localStorage.getItem("myDeck")) || [];

  if (!myDeck.some((item) => item.hu === card.hu)) {
    myDeck.push(card);
    localStorage.setItem("myDeck", JSON.stringify(myDeck));
    showToast(`"${card.hu}" added to your deck!`, "success");
    updateMyDeckOption();
    if (deckSelect.value === "myDeck") {
      setDeckFromArray(myDeck);
      showCard();
    }
  } else {
    showToast(`"${card.hu}" is already in your deck.`, "warning");
  }
});

removeFromMyDeckBtn.addEventListener("click", () => {
  if (!deck.length) return;
  const card = deck[currentIndex];
  let myDeck = JSON.parse(localStorage.getItem("myDeck")) || [];

  myDeck = myDeck.filter((item) => item.hu !== card.hu);
  localStorage.setItem("myDeck", JSON.stringify(myDeck));

  if (deckSelect.value === "myDeck") {
    setDeckFromArray(myDeck);
    if (currentIndex >= deck.length) currentIndex = 0;
    showCard();
  }

  showToast(`"${card.hu}" removed from your deck.`, "danger");
  updateMyDeckOption();
});

function updateMyDeckOption() {
  const myDeckData = JSON.parse(localStorage.getItem("myDeck")) || [];
  let myDeckOption = deckSelect.querySelector('option[value="myDeck"]');

  if (myDeckData.length) {
    if (!myDeckOption) {
      myDeckOption = document.createElement("option");
      myDeckOption.value = "myDeck";
      myDeckOption.textContent = "⭐ My Deck";
      deckSelect.appendChild(myDeckOption);
    }
  } else if (myDeckOption) {
    if (deckSelect.value === "myDeck") {
      deckSelect.value = "";
      setDeckFromArray([]);
      currentIndex = 0;
      showCard();
      addToMyDeckBtn.style.display = "none";
      removeFromMyDeckBtn.style.display = "none";
    }
    myDeckOption.remove();
  }
}

// --- Card rendering ---
function renderVerbTable(card, label) {
  return `
    <div class="fw-bold mb-1">${label}</div>
    <div class="small mb-2"><strong>Infinitive:</strong> ${card.infinitive}</div>
    <div class="d-flex justify-content-center">
      <table class="table table-sm table-borderless mb-0 w-auto">
        <tbody>
          <tr><td class="text-start px-5">${card.present_indefinite[0]}</td><td class="text-start px-5">${card.present_indefinite[3]}</td></tr>
          <tr><td class="text-start px-5">${card.present_indefinite[1]}</td><td class="text-start px-5">${card.present_indefinite[4]}</td></tr>
          <tr><td class="text-start px-5">${card.present_indefinite[2]}</td><td class="text-start px-5">${card.present_indefinite[5]}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function showCard() {
  flashcard.classList.remove("flipped");
  if (!deck.length) {
    progressText.textContent = "Card 0 of 0";
    front.textContent = "";
    back.textContent = "";
    navButtons.style.display = "none";
    return;
  }

  progressText.textContent = `Card ${currentIndex + 1} of ${deck.length}`;
  navButtons.style.display = "flex";

  const card = deck[currentIndex];
  const frontText = showEnglishFront ? card.en : card.hu;
  const backText = showEnglishFront ? card.hu : card.en;

  // FRONT
  if (!showEnglishFront && card.ipa) {
    front.innerHTML = `<div class="fs-2 fw-bold">${frontText}</div>
                       <div class="text-muted fst-italic">${card.ipa}</div>`;
  } else {
    front.textContent = frontText;
  }

  // BACK
  if (card.present_indefinite) {
    back.innerHTML = renderVerbTable(card, backText);
  } else if (card.hu_example && card.en_example) {
    back.innerHTML = `
      <div class="fs-2 fw-bold mb-2">${backText}</div>
      <div class="fs-4 fst-italic text-muted">${card.hu_example}</div>
      <div class="fs-4 fst-italic">${card.en_example}</div>
    `;
  } else {
    back.textContent = backText;
  }
}

// --- Navigation & controls ---
function flipCard() {
  flashcard.classList.toggle("flipped");
}

function nextCard() {
  if (!deck.length) return;
  flashcard.classList.remove("flipped");
  const flipDuration = 600;
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function prevCard() {
  if (!deck.length) return;
  flashcard.classList.remove("flipped");
  const flipDuration = 600;
  setTimeout(() => {
    currentIndex = (currentIndex - 1 + deck.length) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function toggleShuffle() {
  isShuffled = shuffleToggle.checked;
  if (deck.length > 0) {
    deck = isShuffled ? shuffle([...originalDeck]) : [...originalDeck];
    currentIndex = 0;
    showCard();
  }
}

function handleFlip(e) {
  if (deck.length && front.textContent.trim()) {
    flipCard();
  }
}

// --- Utils ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showToast(message, type = "success") {
  const toastEl = document.getElementById("actionToast");
  const toastBody = document.getElementById("toastMessage");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastBody.textContent = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// Keyboard shortcuts (capture phase to beat default button behavior)
document.addEventListener(
  "keydown",
  (e) => {
    const isEditable =
      e.target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);

    // Space
    if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
      if (!isEditable) {
        e.preventDefault();
        e.stopPropagation();
        flipCard();
        document.querySelectorAll("button").forEach((button) => button.blur());
      }
      return;
    }

    // Arrows
    if (!isEditable && (e.key === "ArrowRight" || e.code === "ArrowRight")) {
      e.preventDefault();
      nextCard();
      document.querySelectorAll("button").forEach((button) => button.blur());
    } else if (
      !isEditable &&
      (e.key === "ArrowLeft" || e.code === "ArrowLeft")
    ) {
      e.preventDefault();
      prevCard();
      document.querySelectorAll("button").forEach((button) => button.blur());
    }
  },
  true
); // capture = true

document.addEventListener(
  "keyup",
  (e) => {
    if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
      const isEditable =
        e.target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
      if (!isEditable) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  },
  true
);
