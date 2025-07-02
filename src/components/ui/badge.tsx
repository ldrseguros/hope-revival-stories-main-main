import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#4C1D95] focus:ring-offset-2 bg-[#F97316] text-white border-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#F97316] text-white",
        secondary:
          "bg-[#1E3A8A] text-white",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "text-[#4C1D95] border border-[#4C1D95]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
