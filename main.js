class Sprite {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.symbol = 'O'
  }
}

class Player extends Sprite {
  constructor(...args) {
    super(...args)
    this.symbol = '@'
  }
}

class Invader extends Sprite {
  constructor(...args) {
    super(...args)
    this.symbol = 'X'
  }
}

class Game {
  constructor(width=10, height=4, enemyShift=3) {
    this.width = width
    this.height = height

    this.sprites = []
    this.enemies = []
    this.player = new Player(height-1, enemyShift)
    this.addPlayer()

    this.enemyShift = enemyShift
    this.enemySpan = null
    this.enemyDirection = 1

    this.addEnemies()
  }

  addEnemies() {
    for (let x = 0; x < 1; x++) {
      for (let y = this.enemyShift; y < (this.width - this.enemyShift); y += 2) {
        let enemy = new Invader(x, y)
        this.sprites.push(enemy)
        this.enemies.push(enemy)
      }
    }
    this.enemySpan = this.enemies.length
  }

  addPlayer() {
    this.sprites.push(this.player)
  }

  gameOver() {
    if (this.enemies[this.enemies.length - 1].x >= this.height-1) {
      return true
    }
    return false
  }

  draw() {
    if (this.gameOver()) {
      document.getElementById('page').innerHTML = 'game over ):'
    }
    else {
      var grid = Array(this.height).fill(null).map(row => Array(this.width).fill(null));

      this.sprites.forEach(sprite => {
        grid[sprite.x][sprite.y] = sprite.symbol
      })

      document.getElementById('game').innerHTML = arrayToDOM(grid)
    }
  }

}


// Initialise game
let game = new Game(30, 10)


// First draw when page loads
document.addEventListener("DOMContentLoaded", function(e) {
  game.draw()
});

// Move player with arrows
function handleKeyboardInput(e) {
  let player = game.player

  switch (e.keyCode) {
    // left arrow
    case 37:
      (player.y > 0) ? player.y-- : null;
      break
    // right arrow
    case 39:
      (player.y < game.width-1) ? player.y++ : null;
      break
  }
  game.draw()
}

document.addEventListener("keydown", function (e) {
    throttle(handleKeyboardInput, e);
}, false);

let moveEnemiesTimer = window.setInterval(moveEnemies, 1000)

function moveEnemies() {
  if (game.gameOver()) {
    window.clearInterval(moveEnemiesTimer)
  }

  const {enemySpan, width, enemies} = game;

  enemies.forEach(enemy => {
    enemy.y += game.enemyDirection
  })
  game.enemyShift += game.enemyDirection

  game.draw()

  if (game.enemyShift + (enemySpan*2-1) >= width || game.enemyShift == 0) {
    game.enemyDirection *= -1
    enemies.forEach(enemy => {
      enemy.x += 1
    })
  }
}


/* helpers */

let throttle = (function () {
  let timeWindow = 90; // time in ms
  let lastExecution = new Date((new Date()).getTime() - timeWindow);

  return function (fn, e) {
    if ((lastExecution.getTime() + timeWindow) <= (new Date()).getTime()) {
      lastExecution = new Date();
      fn(e)
    }
  };
}());

function arrayToDOM(arr) {
  return arr.reduce((acc, row) => {
    return acc + row.reduce((acc, val) => {
      return (val == null) ? acc + '&nbsp;' : acc + val
    }, '') + '<br />'
  }, '')
}
