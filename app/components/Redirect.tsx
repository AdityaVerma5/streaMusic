"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import { useEffect } from "react"

export function Redirect() {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        // if user is logged in, redirect to dashboard
        if(session?.data?.user){
            router.push("/dashboard");
        }
    },[session]) //useEffect will trigger when session changes as session is in dependency array
    return null
}
