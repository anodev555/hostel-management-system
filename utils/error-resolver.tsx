import { AuthActionError } from "@/lib/withAuth"
import UnauthorizedPage from "./unauthorized-page"
import ForbiddenPage from "./forbidden-page"
import BadRequestPage from "./badrequest-page"
import ErrorPage from "./error-page"

export function ErrorResolver({ error }: { error: unknown }) {
  const fallbackMessage = "An unknown error occurred"
  if (error instanceof AuthActionError) {
    if (error instanceof AuthActionError) {
      switch (error.code) {
        case "UNAUTHORIZED":
          return <UnauthorizedPage />
        case "FORBIDDEN":
          return <ForbiddenPage description={error.message} />
        case "BAD_REQUEST":
          return <BadRequestPage description={error.message} />
      }
    }
  }
  return (
    <ErrorPage
      message={error instanceof Error ? error.message : fallbackMessage}
    />
  )
}
