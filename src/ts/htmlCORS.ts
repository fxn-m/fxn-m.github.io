const setupRender = () => {

  let url: any
  let timer: any
  let loader: HTMLDivElement = document.querySelector('.loader')!

  const render = () => {
    url = document.getElementById('url')
    // start loading animation
    loader.style.display = 'block'


    fetch('https://sheltered-everglades-04891.herokuapp.com/' + url.value, {
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

export default setupRender