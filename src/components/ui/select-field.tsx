import * as React from "react"
import { cn } from "@/src/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

// Radix Select reserves "" for "no value", so empty option values are mapped through a sentinel.
const EMPTY = "__smash_empty__"
const toItem = (v: string | number | undefined) => (v === undefined ? undefined : v === "" ? EMPTY : String(v))
const fromItem = (v: string) => (v === EMPTY ? "" : v)

export interface SelectOption {
  value: string | number
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectFieldProps {
  options: SelectOption[]
  value?: string | number
  defaultValue?: string | number
  onValueChange?: (value: string) => void
  placeholder?: React.ReactNode
  disabled?: boolean
  size?: "sm" | "default"
  className?: string
  contentClassName?: string
  "aria-label"?: string
  title?: string
}

/** shadcn Select driven by an options array — the drop-in for a native <select>. */
function SelectField({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  size = "default",
  className,
  contentClassName,
  ...rest
}: SelectFieldProps) {
  return (
    <Select
      value={toItem(value)}
      defaultValue={toItem(defaultValue)}
      onValueChange={(v) => onValueChange?.(fromItem(v))}
      disabled={disabled}
    >
      <SelectTrigger size={size} className={cn("w-full", className)} {...rest}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" className={cn("max-h-72", contentClassName)}>
        {options.map((o) => (
          <SelectItem key={String(o.value)} value={toItem(o.value)!} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { SelectField }
