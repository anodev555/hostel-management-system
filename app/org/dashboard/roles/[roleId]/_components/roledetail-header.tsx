'use client'
export default function RoleDetailHeader({
    roleName
}:{
    roleName: string
}){
    return(
        <div>
            <div>
                <h1> {roleName}</h1>
                <p>Edit the role permissions and details</p>
            </div>
            
        </div>
    )

}