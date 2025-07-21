"use client"

import { Badge } from "@/components/ui/badge"
import { Category } from "@/lib/supabase"

interface CategoryBadgeProps {
  category?: Category
  size?: "sm" | "md" | "lg"
}

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  if (!category) return null

  return (
    <Badge 
      variant="secondary"
      className="inline-flex items-center gap-1 text-white border-0"
      style={{ 
        backgroundColor: category.color,
        fontSize: size === "sm" ? "0.75rem" : size === "md" ? "0.875rem" : "1rem"
      }}
    >
      <div 
        className="w-2 h-2 rounded-full bg-white opacity-80"
        aria-hidden="true"
      />
      {category.name}
    </Badge>
  )
}