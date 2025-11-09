import type { Camera, Scene, WebGLRenderer } from "three"

export type AsciiEffectOptions = {
  resolution?: number
  scale?: number
  color?: boolean
  alpha?: boolean
  block?: boolean
  invert?: boolean
  strResolution?: "low" | "medium" | "high"
}

export class AsciiEffect {
  public domElement: HTMLDivElement

  private readonly renderer: WebGLRenderer
  private readonly oAscii: HTMLTableElement
  private readonly oCanvasImg: HTMLCanvasElement
  private readonly oCanvas: HTMLCanvasElement
  private readonly oCtx: CanvasRenderingContext2D

  private fResolution: number
  private iScale: number
  private bColor: boolean
  private bAlpha: boolean
  private bBlock: boolean
  private bInvert: boolean
  private strResolution: "low" | "medium" | "high"
  private aCharList: string[]
  private fFontSize: number
  private fLineHeight: number
  private fLetterSpacing = 0
  private width = 0
  private height = 0
  private iWidth = 0
  private iHeight = 0

  constructor(
    renderer: WebGLRenderer,
    charSet: string | string[] = " .:-=+*#%@",
    options: AsciiEffectOptions = {}
  ) {
    this.renderer = renderer
    this.fResolution = options.resolution ?? 0.15
    this.iScale = options.scale ?? 1
    this.bColor = options.color ?? false
    this.bAlpha = options.alpha ?? false
    this.bBlock = options.block ?? false
    this.bInvert = options.invert ?? false
    this.strResolution = options.strResolution ?? "low"

    const aDefaultCharList = " .,:;i1tfLCG08@".split("")
    const aDefaultColorCharList = " CGO08@".split("")

    this.aCharList = this.bColor ? aDefaultColorCharList : aDefaultCharList
    if (charSet) {
      this.aCharList = Array.isArray(charSet) ? charSet : charSet.split("")
    }

    this.fFontSize = (2 / this.fResolution) * this.iScale
    this.fLineHeight = (2 / this.fResolution) * this.iScale
    this.fLetterSpacing = this.computeLetterSpacing(
      this.iScale,
      this.strResolution
    )

    this.domElement = document.createElement("div")
    this.domElement.style.cursor = "default"
    this.domElement.style.position = "absolute"
    this.domElement.style.top = "0px"
    this.domElement.style.left = "0px"
    this.domElement.style.pointerEvents = "none"

    this.oAscii = document.createElement("table")
    this.domElement.appendChild(this.oAscii)

    this.oCanvasImg = renderer.domElement
    this.oCanvas = document.createElement("canvas")

    const context = this.oCanvas.getContext("2d", { willReadFrequently: true })
    if (!context) {
      throw new Error("Unable to create 2D context for AsciiEffect")
    }
    this.oCtx = context
  }

  public setSize(width: number, height: number) {
    this.width = width
    this.height = height
    this.renderer.setSize(width, height)
    this.initAsciiSize()
  }

  public render(scene: Scene, camera: Camera) {
    this.renderer.render(scene, camera)
    if (this.iWidth === 0 || this.iHeight === 0) return
    this.asciifyImage()
  }

  private initAsciiSize() {
    this.iWidth = Math.floor(this.width * this.fResolution)
    this.iHeight = Math.floor(this.height * this.fResolution)
    this.oCanvas.width = this.iWidth
    this.oCanvas.height = this.iHeight

    this.oAscii.cellSpacing = "0"
    this.oAscii.cellPadding = "0"
    const style = this.oAscii.style
    style.whiteSpace = "pre"
    style.margin = "0px"
    style.padding = "0px"
    style.letterSpacing = `${this.fLetterSpacing}px`
    style.fontFamily = "courier new, monospace"
    style.fontSize = `${this.fFontSize}px`
    style.lineHeight = `${this.fLineHeight}px`
    style.textAlign = "left"
    style.textDecoration = "none"
  }

  private asciifyImage() {
    this.oCtx.clearRect(0, 0, this.iWidth, this.iHeight)
    this.oCtx.drawImage(this.oCanvasImg, 0, 0, this.iWidth, this.iHeight)
    const data = this.oCtx.getImageData(0, 0, this.iWidth, this.iHeight).data

    let strChars = ""
    const charList = this.aCharList

    for (let y = 0; y < this.iHeight; y += 2) {
      for (let x = 0; x < this.iWidth; x++) {
        const offset = (y * this.iWidth + x) * 4
        const red = data[offset]
        const green = data[offset + 1]
        const blue = data[offset + 2]
        const alpha = data[offset + 3]

        let brightness = (0.3 * red + 0.59 * green + 0.11 * blue) / 255
        if (alpha === 0) brightness = 1

        let idx = Math.floor((1 - brightness) * (charList.length - 1))
        if (this.bInvert) {
          idx = charList.length - idx - 1
        }

        let char = charList[idx]
        if (char === undefined || char === " ") {
          char = "&nbsp;"
        }

        if (this.bColor) {
          const block = this.bBlock
            ? `background-color:rgb(${red},${green},${blue});`
            : ""
          const alphaStyle = this.bAlpha ? `opacity:${alpha / 255};` : ""
          strChars += `<span style='color:rgb(${red},${green},${blue});${block}${alphaStyle}'>${char}</span>`
        } else {
          strChars += char
        }
      }
      strChars += "<br/>"
    }

    this.oAscii.innerHTML = `<tr><td style="display:block;width:${this.width}px;height:${this.height}px;overflow:hidden">${strChars}</td></tr>`
  }

  private computeLetterSpacing(
    scale: number,
    resolution: "low" | "medium" | "high"
  ) {
    if (resolution === "low") {
      switch (scale) {
        case 1:
          return -1
        case 2:
        case 3:
          return -2.1
        case 4:
          return -3.1
        case 5:
          return -4.15
      }
    } else if (resolution === "medium") {
      switch (scale) {
        case 1:
          return 0
        case 2:
          return -1
        case 3:
          return -1.04
        case 4:
        case 5:
          return -2.1
      }
    } else {
      switch (scale) {
        case 1:
        case 2:
          return 0
        case 3:
        case 4:
        case 5:
          return -1
      }
    }

    return 0
  }
}
