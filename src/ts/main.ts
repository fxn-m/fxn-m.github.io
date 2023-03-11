// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

import setupRender from './htmlCORS'

// console.log('Hello from main.ts!');

const anyhtml = () => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h3>
    AnyHTML
  </h3>
  <p>
    Input any website url and see the corresponding page's HTML below:
  </p>

  <div style="display: flex;">
  <input type="url" id="url" name="url" placeholder='https://example.com' value='https://example.com' style='margin-right:10px'><br><br>
  <button id="submit">
    Submit
  </button>
  </div>

  <br>
  
  <pre style="
    overflow-x: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;">
      <code id="print-html-output">
      </code>
  </pre>
  `
}

const showAnyhtml = (element: HTMLAnchorElement) => {
  element.addEventListener('click', () => {
    anyhtml();
    setupRender();
    });
  
}

showAnyhtml(document.querySelector('#anyhtml')!);

export {}