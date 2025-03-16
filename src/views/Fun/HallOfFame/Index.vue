<template>
  <div id="game-container">
    <div class="card-display">
      <div v-for="(card, index) in displayedCards" :key="index" class="card">
        {{ cardValueMap[card.value] || card.value }}
        <span class="suit">{{ card.suit }}</span>
      </div>
      <div v-if="unknownCard" class="card unknown-card">?</div>
    </div>
    <div class="user-input">
      <div v-if="gameOver">
        <button @click="startNewGame">New Game</button>
      </div>
      <div v-else>
        <div v-if="currentStage === 1">
          <button @click="makeGuess('RED')" style="color: red">Red</button>
          <button @click="makeGuess('BLACK')">Black</button>
        </div>
        <div v-else-if="currentStage === 2">
          <button @click="makeGuess('ABOVE')">👆</button>
          <button @click="makeGuess('BELOW')">👇</button>
        </div>
        <div v-else-if="currentStage === 3">
          <button @click="makeGuess('BETWEEN')">👉 👈</button>
          <button @click="makeGuess('OUTSIDE')">👈 👉</button>
        </div>
        <div v-else-if="currentStage === 4">
          <button v-for="suit in suits" :key="suit" @click="makeGuess(suit)">
            <span class="suit">{{ suit }}</span>
          </button>
        </div>
        <div v-else-if="currentStage === 5" class="final-stage-inputs">
          <select v-model="finalGuessValue" class="value">
            <option v-for="value in 13" :key="value" :value="value">
              {{ cardValueMap[value] || value }}
            </option>
          </select>
          <select v-model="finalGuessSuit" class="suit">
            <option v-for="suit in suits" :key="suit" :value="suit">
              {{ suit }}
            </option>
          </select>
          <button @click="makeFinalGuess">Make Final Guess</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="Object.values(scores).reduce((a, b) => a + b, 0) > 0" class="data">
    <div class="game-log">
      <div>
        <div class="log-header">
          <h3>Attempts: {{ Object.values(scores).reduce((a, b) => a + b, 0) }}</h3>
          <h3>{{ scores[5] ? `Wins ${scores[5]} 🏆` : "" }}</h3>
        </div>
        <p v-for="(log, index) in gameLogs" :key="index" v-html="log"></p>
      </div>
      <div class="data-footer">
        <button @click="resetScores">
          <FontAwesomeIcon icon="fa-solid fa-arrows-rotate" />
          Reset Scores
        </button>
      </div>
    </div>

    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from "vue"
  import { theme } from "@/components/theme/themeState"
  import { Bar } from "vue-chartjs"
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js"
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
  import JSConfetti from "js-confetti"

  enum Suit {
    HEARTS = "\u2665\uFE0F", // Red Heart
    DIAMONDS = "\u2666\uFE0F", // Red Diamond
    CLUBS = "\u2663\uFE0F", // Black Club
    SPADES = "\u2660\uFE0F" // Black Spade
  }

  enum Color {
    RED = "RED",
    BLACK = "BLACK"
  }

  const cardValueMap: { [key: number]: string } = {
    1: "A",
    11: "J",
    12: "Q",
    13: "K"
  }

  class Card {
    constructor(public value: number, public suit: Suit) {}

    get color(): Color {
      return this.suit === Suit.HEARTS || this.suit === Suit.DIAMONDS ? Color.RED : Color.BLACK
    }
  }

  class Deck {
    cards: Card[] = []

    constructor() {
      for (let value = 1; value <= 13; value++) {
        for (const suit of Object.values(Suit)) {
          this.cards.push(new Card(value, suit as Suit))
        }
      }
      this.shuffle()
    }

    shuffle() {
      for (let i = this.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
      }
    }

    draw(): Card | undefined {
      return this.cards.pop()
    }
  }

  const correctHTML = "<span style='color:green'>Correct!</span>"
  const incorrectHTML = "<span style='color:red'>Incorrect.</span>"

  const attempts = ref(0)
  const currentStage = ref(1)
  const deck = ref(new Deck())
  const cards = ref<Card[]>([])
  const displayedCards = ref<Card[]>([])
  const gameLogs = ref<string[]>([])
  const finalGuessValue = ref<number | null>(null)
  const finalGuessSuit = ref<Suit | null>(null)
  const unknownCard = ref<boolean>(true)
  const gameOver = ref<boolean>(false)
  const scores = ref<number[]>([0, 0, 0, 0, 0, 0])

  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

  const isDarkTheme = ref(theme.value === "dark" || (theme.value === "system" && prefersDarkScheme.matches))

  watch(
    () => theme.value,
    (newTheme) => {
      isDarkTheme.value = newTheme === "dark" || (newTheme === "system" && prefersDarkScheme.matches)
    }
  )

  prefersDarkScheme.addEventListener("change", (e) => {
    if (theme.value === "system") {
      isDarkTheme.value = e.matches
    }
  })

  const suits = Object.values(Suit)

  function startNewGame() {
    gameOver.value = false
    attempts.value++
    currentStage.value = 1
    deck.value = new Deck()
    cards.value = []
    displayedCards.value = []
    gameLogs.value = []
    for (let i = 0; i < 5; i++) {
      const card = deck.value.draw()
      if (card) cards.value.push(card)
    }

    while (cards.value[1].value === cards.value[0].value) {
      cards.value[1] = deck.value.draw()!
    }
    while (cards.value[2].value === cards.value[1].value || cards.value[2].value === cards.value[0].value) {
      cards.value[2] = deck.value.draw()!
    }

    unknownCard.value = true
  }

  function revealCard() {
    unknownCard.value = false
    displayedCards.value.push(cards.value[currentStage.value - 1])
  }

  function makeGuess(guess: string) {
    revealCard()
    switch (currentStage.value) {
      case 1:
        handleColorGuess(guess as Color)
        break
      case 2:
        handleAboveBelowGuess(guess as "ABOVE" | "BELOW")
        break
      case 3:
        handleBetweenOutsideGuess(guess as "BETWEEN" | "OUTSIDE")
        break
      case 4:
        handleSuitGuess(guess as Suit)
        break
    }
    if (currentStage.value <= 5 && !gameOver.value) {
      unknownCard.value = true
    }
  }

  function handleColorGuess(guess: Color) {
    const result = guess === cards.value[0].color
    gameLogs.value.push(`Stage 1: You guessed ${guess}... ${result ? correctHTML : incorrectHTML}`)
    if (result) {
      currentStage.value++
    } else {
      endGame()
    }
  }

  function handleAboveBelowGuess(guess: "ABOVE" | "BELOW") {
    const result = (guess === "ABOVE" && cards.value[1].value > cards.value[0].value) || (guess === "BELOW" && cards.value[1].value < cards.value[0].value)
    gameLogs.value.push(`Stage 2: You guessed ${guess}... ${result ? correctHTML : incorrectHTML}`)
    if (result) {
      currentStage.value++
    } else {
      endGame()
    }
  }

  function handleBetweenOutsideGuess(guess: "BETWEEN" | "OUTSIDE") {
    const [min, max] = [Math.min(cards.value[0].value, cards.value[1].value), Math.max(cards.value[0].value, cards.value[1].value)]
    const isBetween = cards.value[2].value > min && cards.value[2].value < max
    const result = (guess === "BETWEEN" && isBetween) || (guess === "OUTSIDE" && !isBetween)
    gameLogs.value.push(`Stage 3: You guessed ${guess}... ${result ? correctHTML : incorrectHTML}`)
    if (result) {
      currentStage.value++
    } else {
      endGame()
    }
  }

  function handleSuitGuess(guess: Suit) {
    const result = guess === cards.value[3].suit
    gameLogs.value.push(`Stage 4: You guessed <span class="suit">${guess}</span>... ${result ? correctHTML : incorrectHTML}`)
    if (result) {
      currentStage.value++
    } else {
      endGame()
    }
  }

  function makeFinalGuess() {
    if (finalGuessValue.value === null || finalGuessSuit.value === null) {
      gameLogs.value.push("Please select both a value and a suit for your final guess.")
      return
    }
    const result = finalGuessValue.value === cards.value[4].value && finalGuessSuit.value === cards.value[4].suit
    gameLogs.value.push(`Final guess: ${cardValueMap[finalGuessValue.value] || finalGuessValue.value} <span class="suit">${finalGuessSuit.value}</span>.`)
    gameLogs.value.push(`Actual card: ${cardValueMap[cards.value[4].value] || cards.value[4].value} <span class="suit">${cards.value[4].suit}</span>.`)
    revealCard()

    if (result) {
      gameLogs.value.push("Congratulations! You won the game! 🎉🎉🎉")
      scores.value[currentStage.value]++
      saveScores()
      const jsConfetti = new JSConfetti()
      jsConfetti.addConfetti({
        emojis: ["♣️", "♦️", "♠️", "♥️"],
        emojiSize: 50,
        confettiNumber: 100
      })
    }
    endGame()
  }

  function loadScores() {
    const savedScores = localStorage.getItem("cardGameScores")
    if (savedScores) {
      scores.value = JSON.parse(savedScores)
    }
  }

  function saveScores() {
    localStorage.setItem("cardGameScores", JSON.stringify(scores.value))
  }

  function resetScores() {
    localStorage.removeItem("cardGameScores")
    scores.value = [0, 0, 0, 0, 0, 0]
  }

  function endGame() {
    unknownCard.value = false
    gameLogs.value.push("Game over.")
    gameOver.value = true

    scores.value[currentStage.value - 1]++
    saveScores()
    loadScores()
  }

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

  const chartData = computed(() => {
    const lightModeColors = ["rgba(255, 99, 132, .5)", "rgba(54, 162, 235, .5)", "rgba(255, 206, 86, .5)", "rgba(75, 192, 192, .5)", "rgba(153, 102, 255, .5)"]

    const darkModeColors = ["rgba(255, 99, 132, .8)", "rgba(54, 162, 235, .8)", "rgba(255, 206, 86, .8)", "rgba(75, 192, 192, .8)", "rgba(153, 102, 255, .8)"]

    return {
      labels: ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"],
      datasets: [
        {
          label: "Times Reached",
          backgroundColor: isDarkTheme.value ? darkModeColors : lightModeColors,
          data: scores.value
        }
      ]
    }
  })

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: "Stages Reached"
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDarkTheme.value ? "#c3e3f1" : "#555"
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    datasets: {
      bar: {
        maxBarThickness: 30
      }
    }
  }))

  onMounted(() => {
    loadScores()
    startNewGame()
  })
</script>

<style scoped>
  #game-container {
    margin: 3rem auto;
    padding: 20px;
}

.card-display {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
    min-height: 80px;
}

.card {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    transition: all 0.5s;
}

.user-input {
    margin-bottom: 20px;
    height: 60px;
}

.user-input div {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.user-input button {
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    height: 50px;
}

.data {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.game-log {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
    padding: 10px;
    font-size: small;
    width: 40%;
}

.log-header {
    display: flex;
    justify-content: space-between;
}

.unknown-card {
    background-color: #ddd;
    color: #888;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
}

:deep(.suit) {
    text-decoration: none;
    font-weight: normal;
    font-family:
        "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol",
        sans-serif;
}

.chart-container {
    flex-grow: 1;
    height: 300px;
    width: 50%;
    margin: 0 auto;
    margin-top: 20px;
}

.data h3 {
    margin-bottom: 1.8em;
}

.final-stage-inputs {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
}

.final-stage-inputs input,
.final-stage-inputs select {
    margin: 10px 0px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.data-footer {
    color: #6e6e6e;
    display: flex;
    align-items: center;
}

.data-footer button {
    display: flex;
    align-items: center;
    cursor: pointer;
    font: inherit;
    margin: 0;
    gap: 10px;
}

.data-footer button:focus {
    outline: none;
}

@media (max-width: 768px) {
    #game-container {
        margin: 32px 0 16px 0;
    }

    .data {
        flex-direction: column;
        margin: 0 auto 32px auto;
        width: 80%;
    }

    .chart-container {
        width: 100%;
    }

    .game-log {
        min-height: 300px;
        width: 100%;
    }
}

body.dark .card {
    background-color: #33333300;
    border: 1px solid #aaaaaa;
    color: #fff;
    transition: all 0.5s;
}

body.dark .unknown-card {
    background-color: #33333350;
    color: #fff;
}

body.dark .final-stage-inputs > * {
    background-color: #00000000;
    color: #fff;
}
</style>
