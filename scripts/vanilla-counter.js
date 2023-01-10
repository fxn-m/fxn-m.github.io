let value = 0;
let counter = document.getElementById("count")
const increment = () => {
    counter.innerHTML = ++value;
    counter.style.fontSize = 16 + value;
}

const increment10 = () => {
    value+=10;
    counter.innerHTML = value;
    counter.style.fontSize = 16 + value;
}

const reset = () => {
    counter.style.fontSize = 16;
    let i = value
    setInterval(() => {
        if (i >= 0) {
        counter.innerHTML = i--
    }}, 1500/value)
}