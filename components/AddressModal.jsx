'use client' // Marks this as a Client Component in Next.js (App Router)

// Importing required icons, hooks, and libraries
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { addAddress } from "@/lib/features/address/addressSlice"

// Address Modal Component
const AddressModal = ({ setShowAddressModal }) => {

    // Get authentication token from Clerk
    const { getToken } = useAuth()

    // Redux dispatcher to update global state
    const dispatch = useDispatch()

    // Local state to store address form data
    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })

    // Handle input changes dynamically using input "name"
    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value // Update specific field
        })
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault() // Prevent page reload

        try {
            // Get JWT token from Clerk
            const token = await getToken()

            // Send address data to backend API
            const { data } = await axios.post(
                '/api/address',
                { address },
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Secure request
                    }
                }
            )

            // Save address in Redux store
            dispatch(addAddress(data.newAddress))

            // Show success toast
            toast.success(data.message || 'Address added successfully!')

            // Close modal after success
            setShowAddressModal(false)

        } catch (error) {
            // Log error for debugging
            console.error(error)

            // Show error toast
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    return (
        // Modal overlay with blur background
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 sm:px-0">

            {/* Form container */}
            <form
                // Show loading toast while address is being added
                onSubmit={(e) =>
                    toast.promise(handleSubmit(e), {
                        loading: 'Adding Address...'
                    })
                }
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-fadeIn"
            >

                {/* Close button */}
                <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition"
                >
                    <XIcon size={28} />
                </button>

                {/* Modal Heading */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-6">
                    Add New <span className="text-slate-800">Address</span>
                </h2>

                {/* Input fields */}
                <div className="flex flex-col gap-4">

                    {/* Full Name */}
                    <input
                        name="name"
                        value={address.name}
                        onChange={handleAddressChange}
                        type="text"
                        placeholder="Enter your full name"
                        required
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />

                    {/* Email */}
                    <input
                        name="email"
                        value={address.email}
                        onChange={handleAddressChange}
                        type="email"
                        placeholder="Email address"
                        required
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />

                    {/* Street Address */}
                    <input
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        type="text"
                        placeholder="Street / Apartment / Building"
                        required
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />

                    {/* City & State */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            type="text"
                            placeholder="City"
                            required
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />

                        <input
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            type="text"
                            placeholder="State / Province"
                            required
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Zip Code & Country */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            name="zip"
                            value={address.zip}
                            onChange={handleAddressChange}
                            type="number"
                            placeholder="Zip Code"
                            required
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />

                        <input
                            name="country"
                            value={address.country}
                            onChange={handleAddressChange}
                            type="text"
                            placeholder="Country"
                            required
                            className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Phone Number */}
                    <input
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        type="text"
                        placeholder="Phone Number"
                        required
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 shadow-md transition-all"
                >
                    SAVE ADDRESS
                </button>

                {/* Footer Branding */}
                <p className="text-center text-xs sm:text-sm text-slate-400 mt-4">
                    Powered by <span className="font-semibold text-blue-700">DreamSaver</span>
                </p>
            </form>
        </div>
    )
}

export default AddressModal
