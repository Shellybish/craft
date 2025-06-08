import React from 'react'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'

interface BreadcrumbNavItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbNavItem[]
  className?: string
  showHome?: boolean
  maxItems?: number
}

export function BreadcrumbNav({
  items,
  className,
  showHome = true,
  maxItems = 4,
}: BreadcrumbNavProps) {
  // Add home item if requested and not already present
  const allItems = showHome && items[0]?.href !== '/' 
    ? [{ label: 'Home', href: '/' }, ...items]
    : items

  // Truncate items if too many
  const shouldTruncate = allItems.length > maxItems
  const displayItems = shouldTruncate
    ? [
        allItems[0],
        { label: '...', href: undefined },
        ...allItems.slice(-maxItems + 2)
      ]
    : allItems

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {displayItems.map((item, index) => (
          <React.Fragment key={`${item.href}-${index}`}>
            <BreadcrumbItem>
              {item.label === '...' ? (
                <BreadcrumbEllipsis />
              ) : item.href && !item.current ? (
                <BreadcrumbLink 
                  href={item.href}
                  className="flex items-center gap-1"
                >
                  {index === 0 && showHome && (
                    <Home className="h-4 w-4" />
                  )}
                  <span className="truncate max-w-32 sm:max-w-48">
                    {item.label}
                  </span>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && showHome && (
                    <Home className="h-4 w-4" />
                  )}
                  <span className="truncate max-w-32 sm:max-w-48">
                    {item.label}
                  </span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            
            {index < displayItems.length - 1 && (
              <BreadcrumbSeparator />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 