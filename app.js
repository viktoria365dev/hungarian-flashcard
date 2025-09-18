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
const removeFromMyDeckBtn = document.getElementById("removeFromMyDeckBtn");
const navButtons = document.getElementById("navButtons");

// Helper to set deck + originalDeck together
function setDeckFromArray(arr) {
  deck = [...arr];
  originalDeck = [...arr];
}

// Initialise with auto-load
updateMyDeckOption();

(function autoLoadDeck() {
  const myDeckData = JSON.parse(localStorage.getItem("myDeck")) || [];

  if (myDeckData.length > 0) {
    // My Deck exists → load it
    deckSelect.value = "myDeck";
    addToMyDeckBtn.style.display = "none";
    removeFromMyDeckBtn.style.display = "inline-block";
    setDeckFromArray(myDeckData);
    currentIndex = 0;
    flashcard.classList.remove("flipped");
    showCard();
  } else {
    // No My Deck → load first available deck
    const firstDeckOption = deckSelect.querySelector(
      "option[value]:not([disabled])"
    );
    if (firstDeckOption) {
      deckSelect.value = firstDeckOption.value;
      loadDeck();
    }
  }
})();

// Load deck when selection changes
deckSelect.addEventListener("change", loadDeck);

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
  } else {
    addToMyDeckBtn.style.display = "inline-block";
    removeFromMyDeckBtn.style.display = "none";
  }

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
      front.textContent = "Error loading deck.";
      back.textContent = "";
      console.error(err);
      setDeckFromArray([]);
      showCard();
    });
}

// Add to My Deck
addToMyDeckBtn.addEventListener("click", () => {
  if (deck.length === 0) return;
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

// Remove from My Deck
removeFromMyDeckBtn.addEventListener("click", () => {
  if (deck.length === 0) return;
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

showAnswerBtn.addEventListener("click", () => {
  if (deck.length > 0 && front.textContent.trim() !== "") {
    flipCard();
  }
});

nextCardBtn.addEventListener("click", nextCard);
prevCardBtn.addEventListener("click", prevCard);

function handleFlip(e) {
  if (deck.length > 0 && front.textContent.trim() !== "") {
    flipCard();
  }
}

if ("ontouchstart" in window) {
  flashcard.addEventListener("touchstart", handleFlip, { passive: false });
} else {
  flashcard.addEventListener("click", handleFlip);
}

shuffleToggle.addEventListener("change", () => {
  isShuffled = shuffleToggle.checked;
  if (deck.length > 0) {
    deck = isShuffled ? shuffle([...originalDeck]) : [...originalDeck];
    currentIndex = 0;
    showCard();
  }
});

function showCard() {
  progressText.textContent =
    deck.length > 0
      ? `Card ${currentIndex + 1} of ${deck.length}`
      : `Card 0 of 0`;

  // Centralised nav button visibility
  navButtons.style.display = deck.length > 0 ? "flex" : "none";

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
      <div class="fs-4 fst-italic text-muted d-block">${card.hu_example}</div>
      <div class="fs-4 fst-italic d-block">${card.en_example}</div>
    `;
  } else {
    back.textContent = card.en;
  }
}

function flipCard() {
  flashcard.classList.toggle("flipped");
}

function nextCard() {
  if (deck.length === 0) return;
  flashcard.classList.remove("flipped");
  const flipDuration = 600;
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % deck.length;
    showCard();
  }, flipDuration / 2);
}

function prevCard() {
  if (deck.length === 0) return;
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

// Show/hide My Deck option based on localStorage
function updateMyDeckOption() {
  const myDeckData = JSON.parse(localStorage.getItem("myDeck")) || [];
  let myDeckOption = deckSelect.querySelector('option[value="myDeck"]');

  if (myDeckData.length > 0) {
    if (!myDeckOption) {
      myDeckOption = document.createElement("option");
      myDeckOption.value = "myDeck";
      myDeckOption.textContent = "⭐ My Deck";
      deckSelect.appendChild(myDeckOption);
    }
  } else {
    if (myDeckOption) {
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

function showToast(message, type = "success") {
  const toastEl = document.getElementById("actionToast");
  const toastBody = document.getElementById("toastMessage");

  // Change background based on type
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;

  toastBody.textContent = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}
