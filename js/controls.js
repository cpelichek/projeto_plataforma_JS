let botaoFullscreen = document.getElementById("fullscreenBtn");

let toggleFullscreen = function () {
  document.getElementById("gameWindow").className += " fullscreen";
}

botaoFullscreen.addEventListener("click", toggleFullscreen);
