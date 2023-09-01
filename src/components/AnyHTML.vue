<script setup lang="ts">
import { onMounted } from 'vue';

const setupRender = () => {

    let url: any
    let timer: any
    let loader: HTMLDivElement = document.querySelector('.loader')!

    const render = () => {
        url = document.getElementById('url')
        // start loading animation
        loader.style.display = 'block'

        setTimeout(() => {
            loader.style.display = 'none'
        }, 3000)

        fetch('https://fxnm-server-9b7ca19f81f3.herokuapp.com/' + url.value, {
            method: 'GET'
        })
            .then(response => {
                return response.text();
            })
            .then(data => {
                // stop loading animation
                loader.style.display = 'none'
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
            console.log(e)
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

<template>
    <div id="content">
        <p>
            My first 'web app'...
        </p>
        <p>
            Input any website url and see the corresponding page's HTML below:
        </p>

        <div style="display: flex; flex-wrap: wrap; justify-content: left;">
            <input type="url" id="url" name="url" placeholder='https://example.com' value='https://example.com'>
            <button id="submit">
                Submit
            </button>
            <div id="loader-container">
                <div class="loader"></div>
            </div>
        </div>

        <br>

        <pre>
    <code id="print-html-output"></code>
  </pre>
    </div>
</template>

<style scoped>
#content {
    margin-top: 30px;
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

pre {
    overflow-x: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    background-color: #e5e9eb93;
    padding: 0px 10px;
    border-radius: 10px;
    transition: background-color .5s ease-in-out, color 1s ease-in-out;
}

.loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #646cff63;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 2s linear infinite;
    margin: auto;
    display: none;
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