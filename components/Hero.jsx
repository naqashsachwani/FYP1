'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Hero = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rs'
  const router = useRouter()

  const goToShop = () => {
    router.push('/shop')
  }

  return (
    <div className='mx-4 sm:mx-6'>
      <div className='flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto my-8 lg:my-12'>

        {/* Main Banner */}
        <div className='relative flex-1 rounded-3xl overflow-hidden group min-h-[360px] xl:min-h-[420px] shadow-lg'>
          {/* Full-cover hero image */}
          <div className='absolute inset-0'>
            <Image
              src={assets.hero_model_img}
              alt='DreamSaver featured lifestyle'
              fill
              sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
              className='object-cover object-center transform transition-transform duration-700 group-hover:scale-105'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none' />
          </div>

          {/* Content */}
          <div className='relative z-20 p-6 sm:p-12 lg:p-16 flex items-start h-full'>
            <div className='max-w-lg w-full'> 
              
              {/* --- UPDATED ATTRACTIVE BADGE --- */}
              <div className='inline-flex items-center gap-3 bg-white rounded-full p-1 pr-4 shadow-lg mb-6 animate-fade-in-up border border-white/20 backdrop-blur-sm'>
                <span className='bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-md shrink-0'>
                  News
                </span>
                <span className='text-xs sm:text-sm font-semibold text-slate-800 truncate'>
                  Free Shipping on Orders Above {currency} 5000!
                </span>
              </div>
              {/* -------------------------------- */}

              <h2 className='text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg'>
                Saving Goals for<br />
                <span className='bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent'>
                  Smarter Shoppers
                </span>
              </h2>

              <p className='text-white/90 text-lg sm:text-xl mt-4 font-medium drop-shadow-md'>
                Exclusive offers only at DreamSaver
              </p>

              {/* SHOP NOW Button */}
              <div className='mt-8 lg:mt-10'>
                <button
                  onClick={goToShop}
                  className='inline-flex items-center justify-center bg-white text-slate-900 text-base font-bold py-4 px-10 rounded-xl shadow-2xl hover:bg-slate-100 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 hover:scale-105'
                >
                  SHOP NOW
                  <ArrowRightIcon className='ml-2' size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className='absolute left-6 bottom-6 w-40 h-40 rounded-3xl bg-white/20 blur-[18px] pointer-events-none'></div>
        </div>

        {/* Side Banners */}
        <div className='flex flex-col sm:flex-row xl:flex-col gap-4 lg:gap-6 w-full xl:w-96'>

          {/* Side Banner 1 */}
          <div className='relative flex-1 rounded-3xl overflow-hidden group min-h-[180px] sm:min-h-[200px] shadow-lg'>
            <Image
              src={assets.hero_product_img1}
              alt='DreamSaver picks'
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 100vw"
              className='object-cover object-center transform transition-transform duration-500 group-hover:scale-110'
            />
            <div className='absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent pointer-events-none' />
            <div className='relative z-20 p-6 lg:p-8 flex items-center justify-between h-full'>
              <div className='text-white'>
                <p className='text-2xl lg:text-3xl font-bold leading-tight drop-shadow-lg'>DreamSaver Picks</p>
                <p
                  onClick={goToShop}
                  className='mt-3 text-white/90 font-semibold inline-flex items-center gap-2 group-hover:text-white transition-colors cursor-pointer'
                >
                  View more
                  <ArrowRightIcon className='group-hover:translate-x-1.5 transition-transform' size={18} />
                </p>
              </div>

              <div className='w-24 lg:w-28 h-24 lg:h-28 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0 border border-white/30'>
                <Image
                  src={assets.hero_product_img1}
                  alt='product thumbnail'
                  width={160}
                  height={160}
                  className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-500'
                />
              </div>
            </div>
          </div>

          {/* Side Banner 2 */}
          <div className='relative flex-1 rounded-3xl overflow-hidden group min-h-[180px] sm:min-h-[200px] shadow-lg'>
            <Image
              src={assets.hero_product_img2}
              alt='20% off deals'
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 100vw"
              className='object-cover object-center transform transition-transform duration-500 group-hover:scale-110'
            />
            <div className='absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent pointer-events-none' />
            <div className='relative z-20 p-6 lg:p-8 flex items-center justify-between h-full'>
              <div className='text-white'>
                <p className='text-2xl lg:text-3xl font-bold leading-tight drop-shadow-lg'>20% Off Deals</p>
                <p
                  onClick={goToShop}
                  className='mt-3 text-white/90 font-semibold inline-flex items-center gap-2 group-hover:text-white transition-colors cursor-pointer'
                >
                  View more
                  <ArrowRightIcon className='group-hover:translate-x-1.5 transition-transform' size={18} />
                </p>
              </div>

              <div className='w-24 lg:w-28 h-24 lg:h-28 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0 border border-white/30'>
                <Image
                  src={assets.hero_product_img2}
                  alt='deal thumbnail'
                  width={160}
                  height={160}
                  className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-500'
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Hero