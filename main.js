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

class Laser extends Sprite {
  constructor(...args) {
    super(...args)
    this.symbol = '|'
  }
}

class Game {
  constructor(width=30, height=10, enemyShift=3) {
    this.width = width
    this.height = height
    this.score = 0
    this.isRunning = false

    // empty grid of height = this.height and width = this.width
    this.grid = Array(this.height).fill(null).map(row => Array(this.width).fill(null));

    this.enemies = []
    this.lasers = []
    this.player = null

    this.enemyShift = enemyShift
    this.enemySpan = null
    this.enemyDirection = 1

    this.addEnemies()
    this.addPlayer()
  }

  addEnemies() {
    for (let x = 0; x < 1; x++) {
      for (let y = this.enemyShift; y < (this.width - this.enemyShift); y += 2) {
        let enemy = new Invader(x, y)
        this.enemies.push(enemy)
        this.addSpriteToGrid(enemy)
      }
    }
    this.enemySpan = this.enemies.length
  }

  addPlayer() {
    let player = new Player(this.height-1, this.enemyShift)
    this.player = player
    this.addSpriteToGrid(player)
  }

  shootLaser(x, y) {
    let laser = new Laser(x, y)
    this.lasers.push(laser)
    this.addSpriteToGrid(laser)
  }

  gameIsRunning() {
    return this.isRunning
  }

  gameOver() {
    // killed all enemies!
    if (this.enemies.length == 0) {
      return true
    }
    // enemies have descended on the player
    else if (this.enemies[this.enemies.length - 1].x >= this.height-1) {
      return true
    }
    return false
  }

  addSpriteToGrid(sprite) {
    this.grid[sprite.x][sprite.y] = sprite
    this.draw()
  }

  removeSpriteFromGrid(sprite) {
    this.clearGridSpace(sprite.x, sprite.y)
    this.draw()
  }

  moveSprite(sprite, toX, toY) {
    this.removeSpriteFromGrid(sprite)
    sprite.x = toX
    sprite.y = toY
    this.addSpriteToGrid(sprite)

    this.draw()
  }

  removeSpriteFromArray(sprite, arr) {
    let i = arr.findIndex(el => {
      return el.x == sprite.x && el.y == sprite.y
    })
    arr.splice(i, 1)
  }

  clearGridSpace(x, y) {
    this.grid[x][y] = null
  }

  getSprite(x, y) {
    return game.grid[x][y]
  }

  draw() {
    if (this.gameOver()) {
      let message = "game over ):"

      if (this.enemies.length == 0) {
        message = "win! "
      }
      message += `<br><br>score: ${this.score}`

      document.getElementById('page').innerHTML = message
    }
    else if (this.gameIsRunning()) {
      document.getElementById('game').innerHTML = spriteArrayToDOM(this.grid)
    }
  }

}


// Initialise game
// let game = new Game(20, 4)
let game = new Game()


// First draw when page loads
document.addEventListener("DOMContentLoaded", function(e) {
  game.isRunning = true
});

// Move player with arrows
function handleKeyboardInput(e) {
  let player = game.player

  switch (e.keyCode) {
    // left arrow
    case 37:
      (player.y > 0) ? game.moveSprite(player, player.x, player.y-1) : null;
      break
    // spacebar
    case 32:
    // up arrow
    case 38:
      game.shootLaser(player.x-1, player.y)
      break
    // right arrow
    case 39:
      (player.y < game.width-1) ?game.moveSprite(player, player.x, player.y+1) : null;
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
    game.moveSprite(enemy, enemy.x, enemy.y + game.enemyDirection)
  })
  game.enemyShift += game.enemyDirection

  if (game.enemyShift + (enemySpan*2-1) >= width || game.enemyShift == 0) {
    game.enemyDirection *= -1
    enemies.forEach(enemy => {
      game.moveSprite(enemy, enemy.x+1, enemy.y)
    })
  }
}

let moveLasersTimer = window.setInterval(moveLasers, 100)

function moveLasers() {
  if (game.gameOver()) {
    window.clearInterval(moveLasersTimer)
  }

  game.lasers = game.lasers.reduce((lasers, laser) => {
    if (laser.x > 0) {
      let toX = laser.x-1
      let toY = laser.y
      let spriteInNextSpace = game.getSprite(toX, toY)
      if (spriteInNextSpace != null && spriteInNextSpace instanceof Invader) {
        game.removeSpriteFromGrid(spriteInNextSpace)
        game.removeSpriteFromGrid(laser)
        game.removeSpriteFromArray(spriteInNextSpace, game.enemies)
        game.score++
      }
      else {
        game.moveSprite(laser, laser.x-1, laser.y)
        lasers.push(laser)
      }
    }
    else {
      game.removeSpriteFromGrid(laser)
    }
    return lasers
  }, [])
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

function spriteArrayToDOM(arr) {
  return arr.reduce((acc, row) => {
    return acc + row.reduce((acc, sprite) => {
      return (sprite == null) ? acc + '&nbsp;' : acc + sprite.symbol
    }, '') + '<br />'
  }, '')
}
