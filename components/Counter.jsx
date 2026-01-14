'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId }) => {
    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId }))
    }

    return (
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1 rounded-lg border border-gray-300 bg-white shadow-sm sm:text-base text-sm text-gray-700">
            {/* Minus Button */}
            <button
                onClick={removeFromCartHandler}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all select-none"
            >
                -
            </button>

            {/* Quantity Display */}
            <p className="px-2 sm:px-3 font-medium">{cartItems[productId] || 0}</p>

            {/* Plus Button */}
            <button
                onClick={addToCartHandler}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white active:scale-95 transition-all select-none"
            >
                +
            </button>
        </div>
    )
}

export default Counter
