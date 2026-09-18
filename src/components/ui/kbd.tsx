import * as React from "react"
import { cn } from "@/src/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-smash-text-secondary",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
