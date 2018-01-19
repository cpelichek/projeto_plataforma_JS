let botaoFullscreen = document.getElementById("fullscreenBtn");
let botaoDiminuir = document.getElementById("zoomOutBtn");
let botaoAumentar = document.getElementById("zoomInBtn");
let isFullscreen = false;

let toggleFullscreen = function () {
  let _gameWindow = document.getElementById("gameWindow");
  if (!isFullscreen) {
    _gameWindow.classList.add("enterFullscreen");
    isFullscreen = true;
  }

  else {
    _gameWindow.classList.remove("enterFullscreen");
    isFullscreen = false;
  }
}
//
// let zoomIn = function () {
//   let _gameWindow = document.getElementById("gameWindow");
//   _gameWindow.offsetWidth = _gameWindow * 1.1;
// }
//
// let zoomOut = function () {
//   let _gameWindow = document.getElementById("gameWindow");
//   _gameWindow.offsetWidth = _gameWindow * 0.9;
//
// }

botaoFullscreen.addEventListener("click", toggleFullscreen);
// botaoDiminuir.addEventListener("click", zoomOut);
// botaoAumentar.addEventListener("click", zoomIn);
