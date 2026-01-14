'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {
  const displayQuantity = 8
  const products = useSelector((state) => state.product.list)

  const sortedProducts = products
    ?.slice()
    .sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
    .slice(0, displayQuantity)

  return (
    <div className="px-4 sm:px-6 lg:px-8 my-24 max-w-7xl mx-auto">
      <Title
        title="Best Selling"
        description={`Showing ${
          products?.length < displayQuantity ? products.length : displayQuantity
        } of ${products?.length || 0} products`}
        href="/shop"
      />

      {/* Section background accent */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 xl:gap-10">
        {sortedProducts?.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-2 sm:p-4 shadow-md hover:shadow-2xl hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Optional subtle gradient bar below for aesthetics */}
      <div className="mt-12 h-1 w-full max-w-3xl mx-auto rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-30" />
    </div>
  )
}

export default BestSelling
