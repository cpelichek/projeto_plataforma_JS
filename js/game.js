/*
Jogo de Plataforma

Jogo simples e minimalista de plataforma, em que um jogador deve mover-se
horizontalmente e saltar, evitando obstáculos letais (lava) para coletar
moedas. Colete todas as moedas para vencer!

autor: Caio Pelichek Gonçalves
18/01/18
contato: cpelichek@gmail.com
*/

//variáveis globais:
let scale = 20; //determina a escala dos objetos do jogo, em pixels

//arrays:
let simpleLevelPlan = [ //array usado para construir o nível
  "                      ",
  "                      ",
  "  x              = x  ",
  "  x            o o x  ",
  "  x @        xxxxx x  ",
  "  xxxxx            x  ",
  "      x!!!!!!!!!!!!x  ",
  "      xxxxxxxxxxxxxx  ",
  "                      "
];

//objetos:
function Level(plan) { //construtor do objeto level
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];

  for (let y = 0; y < this.height; y++) {
    let line = plan[y],
      gridLine = [];
    for (let x = 0; x < this.width; x++) {
      let ch = line[x],
        fieldType = null;
      let Actor = actorChars[ch];
      if (Actor) {
        this.actors.push(new Actor(new Vector(x, y), ch));
      } else if (ch == "x") {
        fieldType = "wall";
      } else if (ch == "!") {
        fieldType = "lava";
      }
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  this.player = this.actors.filter(function(actor) {
    return actor.type === "player";
  })[0];
  //console.log(this.actors);
  //console.log(this.player);
  this.status = this.finishDelay = null;
};

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};

function Vector(x, y) { //construtor do objeto vetor
  this.x = x, this.y = y;
};

Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

let actorChars = { //objeto caracteres que equivalem a atores do jogo
  "@": Player,
  "o": Coin,
  "=": Lava, //lava que se move na horizontal
  "|": Lava, //lava que se move na vertical
  "v": Lava //lava que cai e depois pula para a posicao inicial
};

function Player(pos) { //construtor do objeto personagem jogador
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
};
Player.prototype.type = "player";

function Lava(pos, ch) { //construtor do objeto lava
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch === "=") {
    this.speed = new Vector(2, 0);
  } else if (ch === "|") {
    this.speed = new Vector(0, 2);
  } else if (ch === "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos; //volta para a posição inicial
  }
};
Lava.prototype.type = "lava";

function Coin(pos) { //construtor do objeto moeda
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2; //moeda vai para cima e para baixo
};
Coin.prototype.type = "coin";

let simpleLevel = new Level(simpleLevelPlan);
console.log("Dimensões do nível: " + simpleLevel.width + " por " + simpleLevel.height);

let elt = function(name, className) { //cria um element tag, que coloca <div> e, onde precisar, <class>
  let elt = document.createElement(name);
  if (className) {
    elt.className = className;
  }
  return elt;
};

function DOMDisplay(parent, level) { //construtor do objeto DOMDisplay, desenha
  this.wrap = parent.appendChild(elt("div", "game")); //wrap é atributo de DOMDisplay
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
};

DOMDisplay.prototype.drawBackground = function() {
  let table = elt("table", "background"); //nosso background será uma <table>
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr")); //linha da tabela: <tr>
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type)); //celula da tabela: <td>
    });
  });
  return table;
};

DOMDisplay.prototype.drawActors = function() {
  let wrap = elt("div");
  this.level.actors.forEach(function(actor) {
    let rect = wrap.appendChild(elt("div", "actor " + actor.type));
    //console.log(actor.type);
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer) {
    this.wrap.removeChild(this.actorLayer);
  }
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game" + (this.level.status || "");
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  let width = this.wrap.clientWidth;
  let height = this.wrap.clientHeight;
  let margin = width / 3;

  //viewport
  let left = this.wrap.scrollLeft;
  let right = left + width;
  let top = this.wrap.scrollTop;
  let bottom = top + height;

  let player = this.level.player;
  console.log(player);
  let center = player.pos.plus(player.size.times(0.5)).times(scale);

  if (center.x < left + margin) {
    this.wrap.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    this.wrap.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    this.wrap.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    this.wrap.scrollTop = center.y + margin - height;
  }
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

let display = new DOMDisplay(document.body, simpleLevel);


//animacao
//
// Level.prototype.obstacleAt = function(pos, size) {
//   var xStart = Math.floor(pos.x);
//   var xEnd = Math.ceil(pos.x + size.x);
//   var yStart = Math.floor(pos.y);
//   var yEnd = Math.ceil(pos.y + size.y);
//
//   if (xStart < 0 || xEnd > this.width || yStart < 0)
//     return "wall";
//   if (yEnd > this.height)
//     return "lava";
//   for (var y = yStart; y < yEnd; y++) {
//     for (var x = xStart; x < xEnd; x++) {
//       var fieldType = this.grid[y][x];
//       if (fieldType) return fieldType;
//     }
//   }
// };
//
// Level.prototype.actorAt = function(actor) {
//   for (var i = 0; i < this.actors.length; i++) {
//     var other = this.actors[i];
//     if (other != actor &&
//       actor.pos.x + actor.size.x > other.pos.x &&
//       actor.pos.x < other.pos.x + other.size.x &&
//       actor.pos.y + actor.size.y > other.pos.y &&
//       actor.pos.y < other.pos.y + other.size.y)
//       return other;
//   }
// };
//
// var maxStep = 0.05;
//
// Level.prototype.animate = function(step, keys) {
//   if (this.status != null)
//     this.finishDelay -= step;
//
//   while (step > 0) {
//     var thisStep = Math.min(step, maxStep);
//     this.actors.forEach(function(actor) {
//       actor.act(thisStep, this, keys);
//     }, this);
//     step -= thisStep;
//   }
// };
//
// Lava.prototype.act = function(step, level) {
//   var newPos = this.pos.plus(this.speed.times(step));
//   if (!level.obstacleAt(newPos, this.size))
//     this.pos = newPos;
//   else if (this.repeatPos)
//     this.pos = this.repeatPos;
//   else
//     this.speed = this.speed.times(-1);
// };
//
// var wobbleSpeed = 8,
//   wobbleDist = 0.07;
//
// Coin.prototype.act = function(step) {
//   this.wobble += step * wobbleSpeed;
//   var wobblePos = Math.sin(this.wobble) * wobbleDist;
//   this.pos = this.basePos.plus(new Vector(0, wobblePos));
// };
//
// var playerXSpeed = 7;
//
// Player.prototype.moveX = function(step, level, keys) {
//   this.speed.x = 0;
//   if (keys.left) this.speed.x -= playerXSpeed;
//   if (keys.right) this.speed.x += playerXSpeed;
//
//   var motion = new Vector(this.speed.x * step, 0);
//   var newPos = this.pos.plus(motion);
//   var obstacle = level.obstacleAt(newPos, this.size);
//   if (obstacle)
//     level.playerTouched(obstacle);
//   else
//     this.pos = newPos;
// };
//
// var gravity = 30;
// var jumpSpeed = 17;
//
// Player.prototype.moveY = function(step, level, keys) {
//   this.speed.y += step * gravity;
//   var motion = new Vector(0, this.speed.y * step);
//   var newPos = this.pos.plus(motion);
//   var obstacle = level.obstacleAt(newPos, this.size);
//   if (obstacle) {
//     level.playerTouched(obstacle);
//     if (keys.up && this.speed.y > 0)
//       this.speed.y = -jumpSpeed;
//     else
//       this.speed.y = 0;
//   } else {
//     this.pos = newPos;
//   }
// };
//
// Player.prototype.act = function(step, level, keys) {
//   this.moveX(step, level, keys);
//   this.moveY(step, level, keys);
//
//   var otherActor = level.actorAt(this);
//   if (otherActor)
//     level.playerTouched(otherActor.type, otherActor);
//
//   // Losing animation
//   if (level.status == "lost") {
//     this.pos.y += step;
//     this.size.y -= step;
//   }
// };
//
// Level.prototype.playerTouched = function(type, actor) {
//   if (type == "lava" && this.status == null) {
//     this.status = "lost";
//     this.finishDelay = 1;
//   } else if (type == "coin") {
//     this.actors = this.actors.filter(function(other) {
//       return other != actor;
//     });
//     if (!this.actors.some(function(actor) {
//         return actor.type == "coin";
//       })) {
//       this.status = "won";
//       this.finishDelay = 1;
//     }
//   }
// };
//
// var arrowCodes = {
//   37: "left",
//   38: "up",
//   39: "right"
// };
//
// function trackKeys(codes) {
//   var pressed = Object.create(null);
//
//   function handler(event) {
//     if (codes.hasOwnProperty(event.keyCode)) {
//       var down = event.type == "keydown";
//       pressed[codes[event.keyCode]] = down;
//       event.preventDefault();
//     }
//   }
//   addEventListener("keydown", handler);
//   addEventListener("keyup", handler);
//   return pressed;
// }
//
// function runAnimation(frameFunc) {
//   var lastTime = null;
//
//   function frame(time) {
//     var stop = false;
//     if (lastTime != null) {
//       var timeStep = Math.min(time - lastTime, 100) / 1000;
//       stop = frameFunc(timeStep) === false;
//     }
//     lastTime = time;
//     if (!stop)
//       requestAnimationFrame(frame);
//   }
//   requestAnimationFrame(frame);
// }
//
// var arrows = trackKeys(arrowCodes);
//
// function runLevel(level, Display, andThen) {
//   var display = new Display(document.body, level);
//   runAnimation(function(step) {
//     level.animate(step, arrows);
//     display.drawFrame(step);
//     if (level.isFinished()) {
//       display.clear();
//       if (andThen) {
//         andThen(level.status);
//       }
//       return false;
//     }
//   });
// }
//
// function runGame(plans, Display) {
//   function startLevel(n) {
//     runLevel(new Level(plans[n]), Display, function(status) {
//       if (status == "lost") {
//         startLevel(n);
//       }
//       else if (n < plans.length - 1) {
//         startLevel(n + 1);
//       }
//       else {
//         console.log("You win!");
//       }
//     });
//   }
//   startLevel(0);
// }
