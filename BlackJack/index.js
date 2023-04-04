let gameData = {
  currentState: "start",
  currentBet: 0,
  bank: 1000,
  playerHand: [],
  dealerHand: [],
  deck: [],
  callback: (currentStateName) => {
    console.log(currentStateName);
  },
};
let states = [
  {
    name: "start",
    next: (data) => {
      // setting current state to deal
      data.currentState = "bet";
      data.deck = createDeck();
    },
  },
  {
    name: "bet",
    next: (data, { bet }) => {
      data.currentState = "dealerDeal";
      data.currentBet = bet;
      data.bank -= bet;
    },
  },
  {
    name: "dealerDeal",
    next: (data) => {
      data.currentState = "playerDeal";
      deal(data.dealerHand, data.deck, true);
    },
  },
  {
    name: "playerDeal",
    next: (data) => {
      data.currentState = "compareHands";
      deal(data.playerHand, data.deck);
    },
  },
  {
    name: "playerOption",
    next: (data, { hit }) => {
      if (hit) {
        data.currentState = "playerDeal";
      } else {
        data.currentState = "compareHands";
      }
    },
  },
  {
    name: "dealerOption",
    next: (data, { hit }) => {
      if (hit) {
        data.currentState = "playerDeal";
      } else {
        data.currentState = "compareHands";
      }
    },
  },
  {
    name: "compareHands",
    next: (data) => {
      let playerScore = scoreHand(data.playerHand);
      let dealerScore = scoreHand(data.dealerHand);
      if (playerScore === 21 && playerScore === dealerScore) {
        // natral blackjack
        data.currentState = "push";
      } else if (dealerScore > 21 && playerScore <= 21) {
        //dealer bust player wins
        data.currentState = "playerWin";
        data.bank += data.currentBet;
        data.currentBet = 0;
      } else if (playerScore > 21 && dealerScore <= 21) {
        //player bust dealer wins
        data.currentState = "dealerWin";
        data.currentBet = 0;
      } else if (dealerScore <= 17) {
        //dealer hits
        data.currentState = "dealerDeal";
      } else {
        //player opition
        data.currentState = "playerOption";
      }
      if (playerScore === 21 && data.currentState !== "push") {
        data.bank += data.currentBet * 1.5;
        data.currentBet = 0;
        data.currentState = "playerWin";
      }
    },
  },
  {
    name: "push",
    next: (data) => {
      data.currentState = "start";
    },
  },
  {
    name: "playerWin",
    next: (data) => {
      data.currentState = "start";
    },
  },
  {
    name: "dealerWin",
    next: (data) => {
      data.currentState = "start";
    },
  },
];

function createDeck() {
  let deck = [];
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const values = ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King"];

  // Create a deck of cards
  for (let i = 0; i < suits.length; i++) {
    for (let x = 0; x < values.length; x++) {
      let card = { Value: values[x], Suit: suits[i], hidden: true };
      deck.push(card);
    }
  }

  console.log(deck);

  // shuffle the cards
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

function deal(hand, deck, isDealer = false) {
  if (hand.length === 0) {
    hand.push(...deck.splice(0, 1));
    hand.push(...deck.splice(0, 1));
    if (isDealer) {
      hand[1].hidden = false;
    }
  } else {
    hand.push(...deck.splice(0, 1));
    if (isDealer) {
      hand[hand.length - 1].hidden = false;
    }
  }
}

function scoreHand(hand) {
  let total = 0;
  for (let i = 0; i < hand.length; i++) {
    let card = hand[i];
    if (typeof card.Value === "number") {
      total += card.Value;
    } else {
      if (card.Value === "Ace") {
        let aceValue = total >= 10 ? 1 : 11;
        total += aceValue;
      } else {
        total += 10;
      }
    }
  }
  return total;
}

function updateView(gameData){
  const startAreaEl = document.getElementById('start-game')
  const betAreaEl = document.getElementById('bet')
  const gameAreaEl = document.getElementById('game-board')
  
  startAreaEl.style.display = 'none'
  betAreaEl.style.display = "none"
  gameAreaEl.style.display = "none"
  
  
  let {currentState} = gameData
  if (currentState === 'start'){
   startAreaEl.style.display = 'block'
  }else if (currentState === 'bet'){
    betAreaEl.style.display = 'block'
  }else if (currentState === 'dealerDeal'){
    gameAreaEl.style.display = "block"

  }else if (currentState === 'playerDeal'){
    gameAreaEl.style.display = "block"

  }else if (currentState === 'playerOption'){
    gameAreaEl.style.display = "block"

  }else if (currentState === 'compareHands'){
    gameAreaEl.style.display = "block"

  }else if (currentState === 'push'){
    gameAreaEl.style.display = "block"

  }else if (currentState === 'playerWin'){

  }else if (currentState === 'dealerWin'){
  }
}

let stateMechine = {
  currentStateName: states[0].name,
  nextState: function (actions = {}) {
    let stateName = this.currentStateName;
    let currentStateObject = states.find((state) => state.name === stateName);
    currentStateObject.next(gameData, actions);
    gameData.callback(gameData.currentState);
    this.currentStateName = gameData.currentState;
  },
};

// adding even listenr

document.addEventListener("DOMContentLoaded", function(){
  const hitButton = document.getElementById('hit-button');
  const standButton = document.getElementById('stand-button');
  const betButton = document.getElementById('bet-button');
  const startButton = document.getElementById('start-game');

  updateView(gameData) 
  

  startButton.addEventListener('click', function(){
    stateMechine.nextState();
    updateView(gameData);
  })
  betButton.addEventListener('click', function(){
    const  betAmount = document.getElementById('bet-amount')
    const bet = betAmount.value
    stateMechine.nextState({ bet });

    updateView(gameData);
  })

  hitButton.addEventListener('click', function(){

  })
 
  standButton.addEventListener('click', function(){

  })
  
 
})



