import { PlusIcon, SquarePenIcon, XIcon, TruckIcon, CreditCardIcon, ShieldCheckIcon } from 'lucide-react'
import React, { useState } from 'react'
import AddressModal from './AddressModal'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Protect, useUser, useAuth } from '@clerk/nextjs'
import axios from 'axios'

const OrderSummary = ({ totalPrice, items }) => {
  const {user} = useUser()
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
  const router = useRouter()
  const addressList = useSelector((state) => state.address?.list || [])

  const [paymentMethod, setPaymentMethod] = useState('STRIPE')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [coupon, setCoupon] = useState(null)

  const handleCouponCode = async (event) => {
    event.preventDefault()
    try {
      if (!user) {
        return toast('Please login to proceed')
      }

      const token = await getToken()
      const { data } = await axios.post(
        '/api/coupon',
        { code: couponCodeInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setCoupon(data.coupon)
      toast.success('Coupon Applied')
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    try {
        if(!user){
          return toast('Please login to place an order')
        }
        if(!selectedAddress){
          return toast('Please select an address')
        }
        const token = await getToken();

        const orderData = {
          addressId: selectedAddress.id,
          items,
          paymentMethod
        }

        if(coupon){
          orderData.couponCode = coupon.code
        }
        // create order
        const {data} = await axios.post('/api/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if(paymentMethod === 'STRIPE'){
          window.location.href = data.session.url;
        } else {
          toast.success(data.message)
          router.push('/orders')
          dispatch(fetchCart({getToken}))
        }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
  }

  // Calculate totals
  const discount = coupon ? (coupon.discount / 100) * totalPrice : 0
  const baseTotal = totalPrice - discount
  const nonPlusShipping = 5
  const plusShipping = 0

  return (
    <div className='w-full max-w-lg lg:max-w-[400px] bg-gradient-to-br from-white to-slate-50/80 border border-slate-100 text-slate-700 rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-slate-300/50 transition-all duration-300'>
      {/* Header */}
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Order Summary
        </h2>
        <p className='text-slate-500 text-sm mt-1'>Review your purchase details</p>
      </div>

      {/* Payment Method */}
      <div className='mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm'>
        <div className='flex items-center gap-2 mb-3'>
          <CreditCardIcon className='text-blue-600' size={18} />
          <p className='font-semibold text-slate-700'>Payment Method</p>
        </div>
        <div className='flex flex-col gap-3'>
          <label className='flex items-center gap-3 p-3 border-2 border-blue-500 bg-blue-50/50 rounded-lg cursor-pointer transition-all hover:bg-blue-50'>
            <input
              type='radio'
              id='STRIPE'
              name='payment'
              checked={paymentMethod === 'STRIPE'}
              onChange={() => setPaymentMethod('STRIPE')}
              className='accent-blue-600'
            />
            <div className='flex-1'>
              <p className='font-medium text-slate-800'>Secure Payment</p>
              <p className='text-xs text-slate-600'>Stripe - Credit/Debit Card</p>
            </div>
            <ShieldCheckIcon className='text-green-600' size={18} />
          </label>
        </div>
      </div>

      {/* Address Section */}
      <div className='mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm'>
        <div className='flex items-center gap-2 mb-3'>
          <TruckIcon className='text-blue-600' size={18} />
          <p className='font-semibold text-slate-700'>Delivery Address</p>
        </div>
        
        {selectedAddress ? (
          <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex justify-between items-start'>
              <div className='flex-1'>
                <p className='font-medium text-green-800 text-sm'>{selectedAddress.name}</p>
                <p className='text-xs text-green-700 mt-1'>
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                </p>
              </div>
              <button
                onClick={() => setSelectedAddress(null)}
                className='p-1 hover:bg-green-200 rounded-lg transition-colors'
              >
                <SquarePenIcon className='text-green-600' size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            {addressList.length > 0 ? (
              <div className='relative'>
                <select
                  className='w-full p-3 border border-slate-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm'
                  onChange={(e) => setSelectedAddress(addressList[e.target.value])}
                >
                  <option value=''>Choose a delivery address</option>
                  {addressList.map((address, index) => (
                    <option key={index} value={index}>
                      {address.name}, {address.city}, {address.state}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className='text-center py-4 border-2 border-dashed border-slate-300 rounded-lg'>
                <p className='text-slate-500 text-sm'>No saved addresses found</p>
                <p className='text-slate-400 text-xs mt-1'>Add your delivery address to continue</p>
              </div>
            )}
            
            <button
              className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all font-medium text-sm'
              onClick={() => setShowAddressModal(true)}
            >
              <PlusIcon size={18} /> 
              Add New Address
            </button>
          </div>
        )}
      </div>

      {/* Order Breakdown */}
      <div className='mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm'>
        <h3 className='font-semibold text-slate-700 mb-4'>Price Details</h3>
        
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-slate-600'>Subtotal</span>
            <span className='font-medium'>{currency}{totalPrice.toLocaleString()}</span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-slate-600'>Shipping</span>
            <Protect
              plan='plus'
              fallback={<span className='font-medium'>{currency}{nonPlusShipping.toFixed(2)}</span>}
            >
              <span className='text-green-600 font-medium'>FREE</span>
            </Protect>
          </div>

          {coupon && (
            <div className='flex justify-between items-center text-green-600'>
              <span>Coupon Discount</span>
              <span className='font-medium'>-{currency}{discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Coupon Section */}
        <div className='mt-4 pt-4 border-t border-slate-200'>
          {!coupon ? (
            <form onSubmit={handleCouponCode} className='flex gap-2'>
              <input
                onChange={(e) => setCouponCodeInput(e.target.value)}
                value={couponCodeInput}
                type='text'
                placeholder='Enter coupon code'
                className='flex-1 border border-slate-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm'
              />
              <button
                type='submit'
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 rounded-lg hover:shadow-lg active:scale-95 transition-all font-medium text-sm whitespace-nowrap'
              >
                Apply
              </button>
            </form>
          ) : (
            <div className='flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg'>
              <div className='flex-1'>
                <p className='text-green-800 font-medium text-sm'>{coupon.code}</p>
                <p className='text-green-600 text-xs'>{coupon.description}</p>
              </div>
              <button
                onClick={() => setCoupon(null)}
                className='p-1 hover:bg-green-200 rounded-lg transition-colors'
              >
                <XIcon className='text-green-600' size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className='mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white'>
        <div className='flex justify-between items-center'>
          <span className='text-blue-50 font-semibold'>Total Amount</span>
          <Protect
            fallback={
              <span className='text-white font-bold text-lg'>
                {currency}{(baseTotal + nonPlusShipping).toFixed(2)}
              </span>
            }
          >
            <span className='text-white font-bold text-lg'>
              {currency}{baseTotal.toFixed(2)}
            </span>
          </Protect>
        </div>
        <p className='text-blue-100 text-xs mt-2 text-center'>
          {items.length} item{items.length !== 1 ? 's' : ''} • Secure checkout
        </p>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        className='w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white py-4 rounded-xl hover:shadow-xl active:scale-[0.98] transition-all font-bold text-sm shadow-lg shadow-blue-500/25'
      >
        Place Order Securely
      </button>

      {/* Trust Badges */}
      <div className='flex justify-center items-center gap-4 mt-4 pt-4 border-t border-slate-200'>
        <div className='flex items-center gap-1 text-slate-500 text-xs'>
          <ShieldCheckIcon size={14} />
          <span>Secure</span>
        </div>
        <div className='flex items-center gap-1 text-slate-500 text-xs'>
          <TruckIcon size={14} />
          <span>Fast Delivery</span>
        </div>
        <div className='flex items-center gap-1 text-slate-500 text-xs'>
          <CreditCardIcon size={14} />
          <span>Protected</span>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal setShowAddressModal={setShowAddressModal} />
      )}
    </div>
  )
}

export default OrderSummary