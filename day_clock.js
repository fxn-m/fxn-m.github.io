const tZero = 1655146600000;
const msInDay = 24 * 60 * 60 * 1000;

let clockP = document.getElementById('day-clock');

function updateDayClock() {
    let day = Math.floor( (new Date().getTime() - tZero) / msInDay );
    clockP.innerHTML = String(day);
}

function colorChange() {
    clockP.style.color = '#' + Math.random().toString(16).slice(-6);
}

window.onload = updateDayClock;
setInterval(colorChange, 500)


// fake the date
var fake_date = new Date("November 30, 2022 06:00:00");

// overriding date function
Date = function(){return fake_date;};
var new_date = new Date();
alert(new_date);

setInterval(updateDayClock, 100)
