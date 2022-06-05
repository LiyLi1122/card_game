//------------- initial variable -----------
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png",       //黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png",    //愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", //方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png"        //梅花
]

const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}

const cardPanel = document.querySelector('#cards')

const utility = {
  getRenderNumberCards(count) {
    const numbers = Array.from((Array(count).keys()))
    for (let index = numbers.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1)) 
        ;[numbers[index], numbers[randomIndex]] = [numbers[randomIndex], numbers[index]] 
    }
    return numbers
  }
}


const controller = {
  currentState: GAME_STATE.FirstCardAwaits, 
  generateCards() {
    view.renderCards(utility.getRenderNumberCards(52))
  },
  dispatchCardAction(card) { 
    if (!card.classList.contains('back')) return
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) 
        model.revealedCards.push(card) 
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷配對是否成功
        //配對成功
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched //改變狀態
          view.pairCards(...model.revealedCards) 
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
          //配對失敗
        } else {
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break


    }
    console.log('this.currentState', this.currentState)
    console.log('revealCards', model.revealedCards.map(revealedCard => revealedCard.dataset.index)) //map for->[dataset1, dataset2]

  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

}


//model/////////////////////////////////////////
const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

//view/////////////////////////////////////////
const view = {
  //render 卡片
  renderCards(indexes) {
    cardPanel.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  getCardElement(index) {
    return ` 
      <div class="card back" data-index="${index}">
      </div>
    `
  },
  getCardContent(index) { 
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return ` 
        <p>${number}</p>
        <img src="${symbol}" alt="">
        <p>${number}</p>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1: return "A"

      case 11: return "J"

      case 12: return "Q"

      case 13: return "K"

      default: return number
    }
  },
  flipCards(...cards) {
    //轉正面
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //轉背面
      card.innerHTML = null 
      card.classList.add('back')
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', function onCardAnimationClicked(event) {
        event.target.classList.remove('wrong'), { once: true } //用完就卸載
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


controller.generateCards()
cardPanel.addEventListener('click', function onCardsPanelClicked(event) {
  if (!event.target.matches('.card')) return

  const card = event.target
  controller.dispatchCardAction(card)

})



















