// Import our custom CSS
import '../scss/styles.scss';
import setupRender from './htmlCORS'

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
  <div class="loader"></div>
  </div>

  <br>
  
  <pre>
    <code id="print-html-output"></code>
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