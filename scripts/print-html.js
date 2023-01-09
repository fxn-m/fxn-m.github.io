let output = ''

const print = () => {
    let html = document.getElementById('url').value
    console.log(html)

    fetch(html)
    .then(response => response.text())
    .then(data => {
        document.getElementById('print-html-output').innerHTML = data;
    })
    .catch(error => console.log(error))
}