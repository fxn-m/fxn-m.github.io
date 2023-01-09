let output = ''

const print = () => {
    let url = document.getElementById('url').value
    console.log(url)

    fetch('https://sheltered-everglades-04891.herokuapp.com/' + url, {
        method: 'GET'
    })
    .then(response => {
        console.log(response);
        return response.text();
    })
    .then(data => {
        console.log(data)
        const escaped = data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        document.getElementById('print-html-output').innerHTML = escaped;
    })
    .catch(error => {
        console.log(error);
        document.getElementById('print-html-output').innerHTML = error})
}