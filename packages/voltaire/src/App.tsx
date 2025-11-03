import { useEffect, useRef } from "react"
import type { Group } from "three"
import { Canvas } from "@react-three/fiber"
import {
  AsciiRenderer,
  OrbitControls,
  Preload,
  useAnimations,
  useGLTF
} from "@react-three/drei"
import "./App.css"

function PlantModel() {
  const group = useRef<Group>(null)

  const { scene, animations } = useGLTF("/plant.glb")
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    if (!actions) return
    const actionKeys = Object.keys(actions)
    if (actionKeys.length === 0) return

    const first = actions[actionKeys[0]]
    first?.reset().fadeIn(0.5).play()

    return () => {
      first?.fadeOut(0.5)
    }
  }, [actions])

  return (
    <primitive
      ref={group}
      object={scene}
      scale={1.5}
      position={[0, -1, 0]}
      castShadow
      receiveShadow
    />
  )
}

useGLTF.preload("/plant.glb")

function App() {
  return (
    <div className="viewport cursor-grab">
      <Canvas shadows camera={{ position: [2, 2, 4], fov: 40 }}>
        <fog attach="fog" args={["#020817", 6, 18]} />

        <ambientLight intensity={2.0} />
        <directionalLight
          position={[7, 8, 4]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <group position={[-0.2, -0.7, 0]} rotation={[0, 4, 0]}>
          <PlantModel />
        </group>

        <OrbitControls enableZoom={false} enableDamping dampingFactor={0.04} />
        <AsciiRenderer
          fgColor="green"
          bgColor="transparent"
          characters=" .:-+*=%@#"
          invert={false}
          renderIndex={1}
        />
        <Preload all />
      </Canvas>
    </div>
  )
}

useGLTF.preload("/plant.glb")

export default App
