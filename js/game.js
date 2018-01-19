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
Player.prototype.type = "Player";

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
    let rect = wrap.appendChild(elt("div", "actor" + actor.type));
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
