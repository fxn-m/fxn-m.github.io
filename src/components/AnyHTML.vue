<template>
    <div id="content">
        <p>Input any website url and see the corresponding page's HTML below:</p>

        <div style="display: flex; flex-wrap: wrap; justify-content: left; margin:1.5em 0">
            <input type="url" id="url" name="url" placeholder='https://example.com' value='https://example.com'>
            <div style="display: flex">
                <button id="submit">
                    Submit
                </button>
                <div id="loader-container">
                    <div class="loader"></div>
                </div>
            </div>
        </div>
        <pre>
            <code id="print-html-output"></code>
        </pre>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const setupRender = () => {

    let url: any
    let timer: any
    let loader: HTMLDivElement = document.querySelector('.loader')!
    let htmlOutput: HTMLPreElement = document.querySelector('pre')!

    const render = () => {
        url = document.getElementById('url')
        loader.style.opacity = '1'
        htmlOutput.style.opacity = '1'

        setTimeout(() => {
            loader.style.opacity = '0'
        }, 3000)

        fetch('https://fxnm-cors-anywhere-b5bfdd86bf6e.herokuapp.com/' + url.value, {
            method: 'GET'
        })
            .then(response => {
                return response.text();
            })
            .then(data => {
                loader.style.opacity = '0'
                typeWriter(data)
            })
            .catch(error => {
                clearInterval(timer)
                document.getElementById('print-html-output')!.innerHTML = '\n' + error
                loader.style.display = 'none'
            })
    }

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

    const foo = (element: HTMLButtonElement) => {
        element.addEventListener('click', render)
    }

    const bar = (element: HTMLInputElement) => {
        element.addEventListener('keydown', (e) => {
            if (e.code == "Enter") render()
        })
    }

    foo(document.querySelector('#submit')!);
    bar(document.querySelector('#url')!);
}

onMounted(() => {
    setupRender();
})
</script>

<style scoped>
pre {
    opacity: 0;
    padding: 10px 20px;
}

p {
    color: #828282;
    font-size: 0.85em;
}

body.dark p {
    color: #afafaf;
}

button {
    border-radius: 8px;
    border: 1px solid transparent;
    margin: 10px 0px;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background-color .5s ease-in-out, color 1s ease-in-out, border-color .25s ease-in-out;

    &:hover {
        border-color: #646cff;
    }

    &:focus,
    &:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }
}

input {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-size: 1em;
    border-radius: 8px;
    border: 1px solid hsla(231, 66%, 77%, 0.411);
    padding: 0.5em 1em;
    transition: background-color .5s ease-in-out, color 1s ease-in-out;
    margin-right: 30px
}

#loader-container {
    margin: 0px 0px 0px 25px;
    display: flex;
    align-items: middle;
}


.loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #646cff63;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 2s linear infinite;
    margin: auto;
    opacity: 0;
    aspect-ratio: 1/1;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

body.dark input {
    border: 1px solid hsla(231, 66%, 77%, 0.411);
    background-color: #0d121a;
    color: #c3e3f1;
    transition: background-color .5s ease-in-out, color 1s ease-in-out;
}

body.dark button {
    background-color: #0d121a;
    color: #c3e3f1;
    transition: background-color .5s ease-in-out, color 1s ease-in-out, border-color .25s ease-in-out;
}

body.dark pre {
    background-color: #212d4199;
    color: #c3e3f1;
    transition: background-color .5s ease-in-out, color 1s ease-in-out;
}
</style>