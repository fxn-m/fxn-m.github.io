// Import our custom CSS
import '../scss/styles.scss';
import setupRender from './htmlCORS'
import TypeIt from 'typeit';

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

// TypeIt
const intro = [['Hi there! '], ['I\'m Felix.'], ['<br>Engineer ⚙️'], ['<br>/Designer 📐'], ['<br>/Runner 👟']];
// @ts-ignore
new TypeIt("#typed", {
  speed: 100,
  waitUntilVisible: true,
  lifeLike: true,

  afterComplete: (instance: any) => {
    instance.destroy();
  }
})
  .pause(2000)
  .type(intro[0])
  .pause(1000)
  .type(intro[1])
  .pause(500)
  .move(-10)
  .pause(500)
  .type('👋 ')
  .pause(1000)
  .move(11)
  .pause(500)
  .type(intro[2])
  .pause(1000)
  .type(intro[3])
  .pause(1000)
  .type(intro[4])
  .go();
export {}