import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, maxLength, value, defaultValue, ...props }: React.ComponentProps<"textarea">) {
  const effectiveMaxLength = maxLength ?? 500
  const textValue = value ?? defaultValue ?? ""
  const currentLength = typeof textValue === "string" ? textValue.length : String(textValue).length

  return (
    <div className="w-full">
      <textarea
        data-slot="textarea"
        maxLength={effectiveMaxLength}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
      {typeof effectiveMaxLength === "number" ? (
        <div className="text-muted-foreground mt-1 text-right text-xs">
          {currentLength}/{effectiveMaxLength}
        </div>
      ) : null}
    </div>
  )
}

export { Textarea }
