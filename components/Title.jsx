'use client' 
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

/**
 * REUSABLE UI COMPONENT: Title
 * This component is designed to be used across multiple pages (Home, Shop).
 * Instead of rewriting the header logic every time, we pass data as "Props".
 */
const Title = ({ 
    title,              // The main heading text
    description,       
    visibleButton = true, // Default: The button is shown unless we explicitly pass false
    href = ''          
}) => {

    return (
        // Layout: Flexbox Column to center items vertically
        <div className='flex flex-col items-center'>
            
            {/* Main Heading */}
            <h2 className='text-2xl font-semibold text-slate-800'>{title}</h2>
            
            {/* 3. NAVIGATION WRAPPER (Next.js Link)
               wrap both the text and the button in a Link tag.
            */}
            <Link href={href} className='flex items-center gap-5 text-sm text-slate-600 mt-2'>
                
                {/* Description Text with a max-width to prevent it from stretching too wide */}
                <p className='max-w-lg text-center'>{description}</p>
                
                {/* CONDITIONAL RENDERING (Logical AND &&)
                   If 'visibleButton' is true, the code after && runs.
                   If 'visibleButton' is false, React ignores the code after &&.
                */}
                {visibleButton && (
                    <button className='text-green-500 flex items-center gap-1'>
                        View more <ArrowRight size={14} />
                    </button>
                )}
            </Link>
        </div>
    )
}

export default Title