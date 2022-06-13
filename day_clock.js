const tZero = 1655146653478 - 86400000*3;
const msInDay = 24 * 60 * 60 * 1000;
let day = Math.floor( (new Date().getTime() - tZero) / msInDay );

let clockP = document.getElementById('day-clock');

function updateDayClock() {
    clockP.innerHTML = 'day ' + String(day);
}

window.onload = updateDayClock;
