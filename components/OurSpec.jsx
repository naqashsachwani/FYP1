import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'

const OurSpecs = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 my-24 max-w-7xl mx-auto">
      <Title
        visibleButton={false}
        title="Our Specifications"
        description="We deliver premium-quality service and convenience — making every shopping experience smooth, secure, and stress-free."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        {ourSpecsData.map((spec, index) => (
          <div
            key={index}
            className="relative bg-white border border-slate-200 rounded-3xl shadow-md hover:shadow-2xl transition-transform duration-300 p-8 text-center group hover:-translate-y-2"
          >
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center rounded-full shadow-lg text-white bg-gradient-to-r from-green-400 to-emerald-500 group-hover:scale-110 transition-transform duration-300"
            >
              <spec.icon size={24} />
            </div>

            <h3 className="mt-10 font-semibold text-xl text-slate-800">{spec.title}</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              {spec.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OurSpecs
