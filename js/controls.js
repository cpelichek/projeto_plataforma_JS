let botaoFullscreen = document.getElementById("fullscreenBtn");
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

botaoFullscreen.addEventListener("click", toggleFullscreen);
