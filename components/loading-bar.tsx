import { Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle } from "./ui/card"

export default function LoadingBar({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="m-2 flex w-full items-center justify-center">
      <Card className="w-full max-w-sm border-dashed">
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">Loading {title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {description ? description : `Fetching ${title} list…`}
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
