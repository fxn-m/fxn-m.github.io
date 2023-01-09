let output = ''

const print = () => {
    let url = document.getElementById('url').value
    console.log(url)

    fetch(url)
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(data => {
        document.getElementById('print-html-output').innerHTML = JSON.stringify(data, undefined, 2);;
    })
    .catch(error => {
        console.log(error);
        document.getElementById('print-html-output').innerHTML = error})
}