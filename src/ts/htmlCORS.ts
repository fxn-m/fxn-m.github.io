const setupRender = () => {

let url: any
let timer: any
const typeWriter = (data: any) => {
    let output: any = document.getElementById('print-html-output')
    if (timer) {
        clearInterval(timer)
    }
    output.innerHTML = '\n'
    let i = 0
    timer = setInterval(() => {
        if (i < data.length) {
            output.innerHTML += data.charAt(i);
            i++
        } else {
            clearInterval(timer)
        }
    }, .5)
}

const render = () => {
    url = document.getElementById('url')

    fetch('https://sheltered-everglades-04891.herokuapp.com/' + url.value, {
        method: 'GET'
    })
        .then(response => {
            return response.text();
        })
        .then(data => {
            // typeWriter(data)
            document.getElementById('print-html-output')!.innerHTML = data.repeat(40)
        })
        .catch(error => {
            clearInterval(timer)
            document.getElementById('print-html-output')!.innerHTML = '\n' + error
        })
}

const foo = (element: HTMLButtonElement) => {
    element.addEventListener('click', render)
}

const bar = (element: HTMLInputElement) => {
    element.addEventListener('keydown', (e) => {
        console.log(e)
        if (e.code == "Enter") render()
    })
}

foo(document.querySelector('#submit')!);
bar(document.querySelector('#url')!);

} 

export default setupRender