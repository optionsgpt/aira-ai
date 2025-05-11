import { Suspense } from "react"
import V0StyleDashboard from "@/components/v0-style-dashboard"
import FallbackPage from "./fallback-page"

export default function Home() {
  return (
    <Suspense fallback={<FallbackPage />}>
      <V0StyleDashboard />
    </Suspense>
  )
}
