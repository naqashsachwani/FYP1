import React from 'react'
import Title from './Title'

const Newsletter = () => {
    return (
        <div className='flex flex-col items-center mx-4 my-20 lg:my-36'>
            <Title 
                title="Join Our Newsletter" 
                description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week." 
                visibleButton={false} 
            />

            {/* CHANGES:
              1. Increased padding from `p-2` to `p-4` for more breathing room.
              2. Changed `hover:shadow-2xl` to `hover:shadow-xl` for a slightly more subtle hover.
              3. Added `ease-in-out` to the transition for smoother feel.
            */}
            <div className='flex flex-col sm:flex-row gap-4 bg-white/90 backdrop-blur-md text-sm p-4 rounded-3xl w-full max-w-2xl my-8 lg:my-12 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out'>
                
                {/* CHANGES:
                  1. Harmonized focus ring color to `green-500` to match the button.
                  2. Used modern Tailwind opacity syntax `focus:ring-green-500/30`.
                  3. Added `ease-in-out` to the transition.
                */}
                <input 
                    className='flex-1 px-6 py-4 sm:py-3 outline-none bg-transparent placeholder-slate-500 rounded-2xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-300 ease-in-out text-slate-700'
                    type="email" 
                    placeholder='Enter your email address' 
                />
                
                {/* CHANGES:
                  1. Reduced base shadow to `shadow-md` and hover to `shadow-lg`. This creates a better visual hierarchy, as the button is *inside* the `shadow-lg` container.
                  2. Added `active:shadow-md` to pair with the `active:translate-y-0`.
                  3. Standardized transition to `duration-300` and added `ease-in-out`.
                */}
                <button 
                    className='font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 sm:py-3 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg active:shadow-md'
                >
                    Get Updates
                </button>
            </div>
        </div>
    )
}

export default Newsletter