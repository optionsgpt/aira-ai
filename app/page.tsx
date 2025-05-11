import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Aira AI - Intelligent Assistant",
  description: "An advanced AI assistant that can process files, clone repositories, and analyze code",
}

export default function Home() {
  return <Dashboard />
}
