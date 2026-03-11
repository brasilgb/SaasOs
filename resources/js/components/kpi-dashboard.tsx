import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@inertiajs/react"
import { LinkIcon } from "lucide-react"
import { ReactNode } from "react"

interface KpiDashboardProps {
  title: string
  value?: number | null
  icon: ReactNode
  description: string
  link?: string
  valuedays?: number
}

export function KpiDashboard({
  title,
  value,
  icon,
  description,
  link,
  valuedays,
}: KpiDashboardProps) {
  return (
    <Card>

      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>

          <CardTitle className="text-3xl font-bold tabular-nums">
            {value}
          </CardTitle>
        </div>

        <CardAction className="text-muted-foreground">
          {icon}
        </CardAction>
      </CardHeader>

      <CardFooter className="flex items-center justify-between text-sm">

        <div className="flex items-center gap-2 text-muted-foreground">
          {description}

          {valuedays && (
            <Badge variant="secondary">
              {valuedays} dias
            </Badge>
          )}
        </div>

        {link && (
          <Link
            href={link}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <LinkIcon className="w-4 h-4" />
          </Link>
        )}

      </CardFooter>

    </Card>
  )
}