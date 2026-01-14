'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import axios from "axios"
import { toast } from "react-hot-toast"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStoreData = async () => {
        try {
            const { data } = await axios.get(`/api/store/data?username=${username}`)
            setStoreInfo(data.store)
            setProducts(data.store.Product)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStoreData()
    }, [])

    return !loading ? (
        <div className="min-h-[80vh] bg-gray-50 px-4 sm:px-8 py-10">

            {/* ===== Store Info Section ===== */}
            {storeInfo && (
                <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg border border-gray-200"
                        width={160}
                        height={160}
                    />
                    <div className="text-center md:text-left w-full">
                        <h1 className="text-3xl font-semibold text-gray-800">{storeInfo.name}</h1>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-2xl mx-auto md:mx-0">
                            {storeInfo.description || "Welcome to DreamSaver — your trusted online store."}
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-gray-500">
                            <div className="flex items-center justify-center md:justify-start">
                                <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start">
                                <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Product Section ===== */}
            <div className="max-w-6xl mx-auto mt-14 mb-20">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                        Explore <span className="text-blue-600 font-bold">DreamSaver</span> Products
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        High-quality products curated just for you.
                    </p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <h3 className="text-xl sm:text-2xl font-medium mb-2">No Products Found</h3>
                        <p className="text-gray-400">Check back soon for more from DreamSaver.</p>
                    </div>
                )}
            </div>
        </div>
    ) : <Loading />
}
