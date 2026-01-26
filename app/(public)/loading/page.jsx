'use client'

import Loading from "@/components/Loading"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoadingPage() {
    const router = useRouter()
    
    const searchParams = useSearchParams()
    
    // 1. STATE MANAGEMENT
    // every second to update the UI number (8, 7, 6...).
    const [count, setCount] = useState(8)

    useEffect(() => {
        const url = searchParams.get('nextUrl')

        // 2. SECURITY CHECK: "Open Redirect" Prevention
        if (url && url.startsWith('/')) {
            
            // 3. TIMER LOGIC: setInterval vs setTimeout
            // SetInterval because we need to run an action repeatedly (every second)
            // to update the UI, rather than just once at the end.
            const interval = setInterval(() => {
                
                // 4. FUNCTIONAL STATE UPDATE
                // Closures in useEffect capture the initial state. By using the 
                // functional update pattern (prev => ...), we ensure we are always 
                // modifying the most current value of the state, not the stale one.
                setCount((prev) => {
                    if (prev <= 1) {
                        // Time is up: Clean up and Navigate
                        clearInterval(interval)
                        router.push(url)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            // 5. CLEANUP FUNCTION
            // If the user clicks 'Back' or closes 
            // the component before the 8 seconds are up, this runs. It clears the interval 
            // to prevent memory leaks and ensures the app doesn't try to redirect a user 
            // who has already left the page."
            return () => clearInterval(interval)
        }
    }, [router, searchParams])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loading />
            {/* Visual Feedback: Enhances UX by showing system status */}
            <p className="text-slate-600 font-medium animate-pulse">
                Redirecting you in {count} seconds...
            </p>
        </div>
    )
}