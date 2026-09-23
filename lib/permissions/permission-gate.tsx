'use client'

import { usePermissions } from "./usePermissions";

export function PermissionGate({resource , action, children, fallback = null}:{
    resource: string;
    action: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}){
    const {isLoading , hasPermission} = usePermissions();
    // if(isLoading) return fallback

    if(!hasPermission(resource, action)){
        return <>{fallback}</>
    }
    return <>{children}</>

}