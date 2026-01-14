'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {
  const displayQuantity = 4
  const products = useSelector((state) => state.product.list || [])

  // Sort products by createdAt descending
  const latestProducts = products
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, displayQuantity)

  return (
    <div className="px-4 sm:px-6 lg:px-8 my-24 max-w-7xl mx-auto">
      <Title
        title="Latest from DreamSaver"
        description={`Showing ${latestProducts.length} of ${products.length} new arrivals`}
        href="/shop"
      />
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 xl:gap-10">
        {latestProducts.map((product, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default LatestProducts
