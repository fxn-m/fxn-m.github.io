const tZero = 1655146600000;
const msInDay = 24 * 60 * 60 * 1000;
let day = Math.floor( (new Date().getTime() - tZero) / msInDay );

let clockP = document.getElementById('day-clock');

function updateDayClock() {
    clockP.innerHTML = String(day);
}

function colorChange() {
    clockP.style.color = '#' + Math.random().toString(16).slice(-6);
}

window.onload = updateDayClock;

// setInterval(setTimeOut(colorChange, 100), 1000)
setInterval(colorChange, 500)
