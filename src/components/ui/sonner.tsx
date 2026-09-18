import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/** shadcn/ui Toaster, pinned to the SMASH dark glass look (the app has no light theme). */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      closeButton
      offset={24}
      mobileOffset={{ bottom: 96 }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !border-white/10 !bg-smash-panel/90 !text-white !shadow-2xl backdrop-blur-2xl !gap-3 !p-4",
          title: "!text-sm !font-semibold !text-white",
          description: "!text-xs !text-smash-text-secondary",
          closeButton:
            "!bg-smash-surface !border-white/10 !text-smash-text-secondary hover:!text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
