(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const t of r.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&l(t)}).observe(document,{childList:!0,subtree:!0});function i(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(e){if(e.ep)return;e.ep=!0;const r=i(e);fetch(e.href,r)}})();const u=()=>{let o,n;const i=t=>{let c=document.getElementById("print-html-output");n&&clearInterval(n),c.innerHTML=`
`;let s=0;n=setInterval(()=>{s<t.length?(c.innerHTML+=t.charAt(s),s++):clearInterval(n)},.5)},l=()=>{o=document.getElementById("url"),fetch("https://sheltered-everglades-04891.herokuapp.com/"+o.value,{method:"GET"}).then(t=>t.text()).then(t=>{i(t)}).catch(t=>{clearInterval(n),document.getElementById("print-html-output").innerHTML=`
`+t})},e=t=>{t.addEventListener("click",l)},r=t=>{t.addEventListener("keydown",c=>{console.log(c),c.code=="Enter"&&l()})};e(document.querySelector("#submit")),r(document.querySelector("#url"))},p=()=>{document.querySelector("#app").innerHTML=`
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
  `},d=o=>{o.addEventListener("click",()=>{p(),u()})};d(document.querySelector("#anyhtml"));
