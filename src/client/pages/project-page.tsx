import { useParams } from "react-router-dom"

import TabOverflow from "@/client/pages/tab-overflow"

const components = {
  "tab-overflow": TabOverflow
}

export default function ProjectPage() {
  const { name } = useParams()

  if (!name || !(name in components)) {
    return null
  }

  const SelectedComponent = components[name as keyof typeof components]

  return (
    <div className="mt-8">
      <SelectedComponent />
    </div>
  )
}
