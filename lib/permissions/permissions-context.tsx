
"use client"

import { data } from "@/app/admin/dashboard/_components/constants/nav-data"
import { createContext, useEffect, useState, useCallback, cache } from "react"
import type { ReactNode } from "react"
import { authClient } from "../authClient"

export type PermissionMap = Record<string, string[]>

export type PermissionsContextValue = {
  permissions: PermissionMap
  hasPermission: (resource: string, action: string) => boolean
//   hasAnyPermission: (perms: PermissionMap) => boolean
  isLoading: boolean
}

export const PermissionsContext = createContext<PermissionsContextValue | null>(
  null
)

const cachedFetchPermissions = cache(async():Promise<PermissionMap> => {
  const res = await fetch("/api/permissions",{
          method:"GET",
          headers:{
            "Content-Type":"application/json"
          }
        })
        const data = await res.json()
        return data.permissions ?? {}
})

export const PermissionProvider = ({children}:{
    children: ReactNode
}) => {
    const [permissions , setPermissions] = useState<PermissionMap>({})
    const [isLoading, setIsLoading]= useState(true)
    const {data: session} = authClient.useSession()
const activeOrgId = session?.session.activeOrganizationId
     useEffect(() => {
    let cancelled = false

    async function fetchPermissions() {
      try {
      

       const data = await cachedFetchPermissions()

        if (!cancelled) {
          setPermissions(data)
      
        }
      } catch {
        if (!cancelled) {
          setPermissions({})
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchPermissions()

    return () => {
      cancelled = true
    }
  }, [activeOrgId])


  const hasPermissions = useCallback((resource:string, action:string)=>{
    const actions = permissions[resource]
    if(!actions) return false;
 if (actions.includes("*")) return true
return actions.includes(action);
  }, [permissions])

    return(
<PermissionsContext.Provider value={{
    permissions,
    hasPermission: hasPermissions,
    isLoading
}}>
    {children}
    </PermissionsContext.Provider>
    )
}

