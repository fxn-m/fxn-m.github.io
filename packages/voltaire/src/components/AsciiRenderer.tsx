import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo } from "react"

import { AsciiEffect, type AsciiEffectOptions } from "../lib/AsciiEffect"

type AsciiRendererProps = {
  renderIndex?: number
  bgColor?: string
  fgColor?: string
  characters?: string
  invert?: boolean
} & AsciiEffectOptions

export function AsciiRenderer({
  renderIndex = 1,
  bgColor = "black",
  fgColor = "white",
  characters = " .:-+*=%@#",
  invert = true,
  ...effectOptions
}: AsciiRendererProps) {
  const { size, gl, scene, camera } = useThree()
  const effect = useMemo(() => {
    return new AsciiEffect(gl, characters, {
      invert,
      ...effectOptions
    })
  }, [characters, effectOptions, gl, invert])

  useLayoutEffect(() => {
    effect.domElement.style.color = fgColor
    effect.domElement.style.backgroundColor = bgColor
  }, [effect, fgColor, bgColor])

  useEffect(() => {
    const parent = gl.domElement.parentNode
    if (!parent) return

    gl.domElement.style.opacity = "0"
    parent.appendChild(effect.domElement)

    return () => {
      gl.domElement.style.opacity = "1"
      parent.removeChild(effect.domElement)
      effect.domElement.remove()
    }
  }, [effect, gl])

  useLayoutEffect(() => {
    effect.setSize(size.width, size.height)
  }, [effect, size.height, size.width])

  useFrame(() => {
    effect.render(scene, camera)
  }, renderIndex)

  return null
}

export default AsciiRenderer
