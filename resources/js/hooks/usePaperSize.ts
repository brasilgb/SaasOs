"use client"

import { useEffect, useState } from "react"

export type PaperSize = "58mm" | "80mm"

export function usePaperSize(): PaperSize {
  const [paper, setPaper] = useState<PaperSize>("80mm")

  useEffect(() => {
    if (typeof window === "undefined") return

    const detect = () => {
      const widthPx = window.innerWidth

      /**
       * Aproximação:
       * 58mm ≈ 219px
       * 80mm ≈ 302px
       */

      if (widthPx <= 260) {
        setPaper("58mm")
      } else {
        setPaper("80mm")
      }
    }

    detect()
    window.addEventListener("resize", detect)
    return () => window.removeEventListener("resize", detect)
  }, [])

  return paper
}
