import type { Camera, Scene, WebGLRenderer } from "three"

type ResolutionSetting = "low" | "medium" | "high"

export type AsciiEffectOptions = {
  resolution?: number
  scale?: number
  color?: boolean
  alpha?: boolean
  block?: boolean
  invert?: boolean
  strResolution?: ResolutionSetting
}

/**
 * Lightweight fork of three-stdlib's AsciiEffect with a single change:
 * the internal canvas requests `willReadFrequently` so Chrome won't warn
 * when the ASCII renderer repeatedly calls `getImageData`.
 */
export class AsciiEffect {
  public readonly domElement: HTMLDivElement

  private readonly renderer: WebGLRenderer
  private readonly oAscii: HTMLTableElement
  private readonly oCanvasImg: HTMLCanvasElement
  private readonly oCanvas: HTMLCanvasElement
  private readonly oCtx: CanvasRenderingContext2D

  private readonly charSet: string
  private readonly options: Required<AsciiEffectOptions>
  private width = 0
  private height = 0
  private iWidth = 0
  private iHeight = 0
  private letterSpacing = 0
  private fontSize = 0
  private lineHeight = 0

  constructor(
    renderer: WebGLRenderer,
    charSet = " .:-=+*#%@",
    options: AsciiEffectOptions = {}
  ) {
    this.renderer = renderer
    this.options = {
      resolution: options.resolution ?? 0.15,
      scale: options.scale ?? 1,
      color: options.color ?? false,
      alpha: options.alpha ?? false,
      block: options.block ?? false,
      invert: options.invert ?? false,
      strResolution: options.strResolution ?? "low"
    }

    this.charSet = charSet
    this.oCanvasImg = renderer.domElement
    this.oCanvas = document.createElement("canvas")
    const context = this.oCanvas.getContext("2d", { willReadFrequently: true })
    if (!context) {
      throw new Error("Failed to create 2D context for AsciiEffect")
    }
    this.oCtx = context

    this.domElement = document.createElement("div")
    this.domElement.style.cursor = "default"
    this.domElement.style.position = "absolute"
    this.domElement.style.top = "0px"
    this.domElement.style.left = "0px"
    this.domElement.style.pointerEvents = "none"

    this.oAscii = document.createElement("table")
    this.domElement.appendChild(this.oAscii)

    this.updateFontMetrics()
  }

  public setSize(width: number, height: number) {
    this.width = width
    this.height = height
    this.renderer.setSize(width, height)
    this.initAsciiSize()
  }

  public render(scene: Scene, camera: Camera) {
    this.renderer.render(scene, camera)
    this.asciifyImage()
  }

  private initAsciiSize() {
    this.iWidth = Math.floor(this.width * this.options.resolution)
    this.iHeight = Math.floor(this.height * this.options.resolution)

    this.oCanvas.width = this.iWidth
    this.oCanvas.height = this.iHeight

    const style = this.oAscii.style
    style.whiteSpace = "pre"
    style.margin = "0px"
    style.padding = "0px"
    style.letterSpacing = `${this.letterSpacing}px`
    style.fontFamily = "courier new, monospace"
    style.fontSize = `${this.fontSize}px`
    style.lineHeight = `${this.lineHeight}px`
    style.textAlign = "left"
    style.textDecoration = "none"

    this.oAscii.cellSpacing = "0"
    this.oAscii.cellPadding = "0"
  }

  private asciifyImage() {
    this.oCtx.clearRect(0, 0, this.iWidth, this.iHeight)
    this.oCtx.drawImage(this.oCanvasImg, 0, 0, this.iWidth, this.iHeight)
    const data = this.oCtx.getImageData(0, 0, this.iWidth, this.iHeight).data

    const chars: string[] = []
    const charList = this.getCharList()

    for (let y = 0; y < this.iHeight; y += 2) {
      for (let x = 0; x < this.iWidth; x++) {
        const offset = (y * this.iWidth + x) * 4
        const r = data[offset]
        const g = data[offset + 1]
        const b = data[offset + 2]
        const a = data[offset + 3]

        let brightness = (0.3 * r + 0.59 * g + 0.11 * b) / 255
        if (a === 0) brightness = 1

        let idx = Math.floor((1 - brightness) * (charList.length - 1))
        if (this.options.invert) {
          idx = charList.length - idx - 1
        }

        let char = charList[idx] ?? "&nbsp;"

        if (this.options.color) {
          const block = this.options.block
            ? `background-color:rgb(${r},${g},${b});`
            : ""
          const alpha = this.options.alpha ? `opacity:${a / 255};` : ""
          chars.push(
            `<span style='color:rgb(${r},${g},${b});${block}${alpha}'>${char}</span>`
          )
        } else {
          if (char === " ") char = "&nbsp;"
          chars.push(char)
        }
      }
      chars.push("<br/>")
    }

    this.oAscii.innerHTML = `<tr><td style="display:block;width:${this.width}px;height:${this.height}px;overflow:hidden">${chars.join("" )}</td></tr>`
  }

  private getCharList() {
    if (this.charSet) {
      return Array.from(this.charSet)
    }

    const defaultList = this.options.color
      ? Array.from(" CGO08@")
      : Array.from(" .,:;i1tfLCG08@")

    return defaultList
  }

  private updateFontMetrics() {
    this.fontSize = (2 / this.options.resolution) * this.options.scale
    this.lineHeight = (2 / this.options.resolution) * this.options.scale
    this.letterSpacing = this.computeLetterSpacing(
      this.options.scale,
      this.options.strResolution
    )
  }

  private computeLetterSpacing(scale: number, resolution: ResolutionSetting) {
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
    }

    if (resolution === "medium") {
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
    }

    if (resolution === "high") {
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
