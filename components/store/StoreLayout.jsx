'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"

const StoreLayout = ({ children }) => {
    const { getToken } = useAuth()

    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)

    const fetchIsSeller = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/is-seller', { 
                headers: { Authorization: `Bearer ${token}` } 
            })
            setIsSeller(data.isSeller)
            setStoreInfo(data.storeInfo)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIsSeller()
    }, [])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen bg-gray-50">
            <SellerNavbar brandName="DreamSaver" />
            <div className="flex flex-1 h-full overflow-hidden">
                <SellerSidebar storeInfo={storeInfo} />
                <main className="flex-1 h-full p-6 lg:p-12 overflow-y-auto bg-white rounded-tl-3xl shadow-inner">
                    {children}
                </main>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-600 mb-6">🚫 Access Denied</h1>
            <p className="text-gray-500 max-w-md">You are not authorized to access this page. Please go back to the homepage.</p>
            <Link 
                href="/" 
                className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 px-6 rounded-full transition-transform transform hover:scale-105"
            >
                Go to DreamSaver <ArrowRightIcon size={20} />
            </Link>
        </div>
    )
}

export default StoreLayout
