const jsonElement = document.getElementById('span-json')
const htmlElement = document.getElementById('span-html')
const typeElement = document.getElementById('type')
const black = "rgba(0,0,0,1)";
const grey = "rgba(19, 18, 18, 0.2)"

let output = ''
let option = 'html'
let url
const speed = 1;

const reset = () => {
    document.getElementById('print-html-output').innerHTML = ''
}

const print = () => {
    url = document.getElementById('url')

    if (option == 'html') {
        fetch('https://sheltered-everglades-04891.herokuapp.com/' + url.value, {
            method: 'GET'
        })
        .then(response => {
            return response.text();
        })
        .then(data => {
            const escaped = '\n' + data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            console.log(escaped)
            reset()
            let i = 0;
            function typeWriter() {
                if (i < escaped.length) {
                    document.getElementById('print-html-output').innerHTML += escaped.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                }
            }
            typeWriter()
        })
        .catch(error => {
            console.log(error);
            document.getElementById('print-html-output').innerHTML = error
        })
    } else { 
        fetch(url.value, {
            method: 'GET'
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            const result = '\n' + JSON.stringify(data, undefined, 2);
            reset()
            let i = 0;
            function typeWriter() {
                if (i < result.length) {
                    document.getElementById('print-html-output').innerHTML += result.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                }
            }
            typeWriter()
        })
        .catch(error => {
            console.log(error);
            document.getElementById('print-html-output').innerHTML = error
        })
    }
}

document.getElementById('url').onkeydown = (e) => {
    if(e.code == "Enter"){
        print()
    }
 };

 const selectType = (selected) => {
    url = document.getElementById('url')
 
    const jsonElement = document.getElementById('span-json')
    const htmlElement = document.getElementById('span-html')
    const typeElement = document.getElementById('type')
    const black = "rgba(0,0,0,1)";
    const grey = "rgba(19, 18, 18, 0.2)"

    if (option == 'html' && selected == 'json') {
        htmlElement.style.color = grey;
        jsonElement.style.color = black;
        typeElement.innerHTML = 'JSON';
        url.placeholder = 'https://jsonplaceholder.typicode.com/posts'
        url.value = 'https://jsonplaceholder.typicode.com/posts'
    } else if (option == 'json' && selected == 'html') {
        jsonElement.style.color = grey
        htmlElement.style.color = black
        typeElement.innerHTML = 'HTML';
        url.placeholder = 'https://example.com'
        url.value = 'https://example.com'
    }
    
    option = selected;
    return option
 }

