'use client'
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight, Heart } from "lucide-react";

const Footer = () => {
  const FacebookIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform duration-200">
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5a3.5 3.5 0 0 1 3.8-3.9h2.7v3h-1.8a1.1 1.1 0 0 0-1.2 1.2V12H17l-.5 3h-2.7v7A10 10 0 0 0 22 12z" />
    </svg>
  );

  const InstagramIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform duration-200">
      <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7.5A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm4.8-7.9a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform duration-200">
      <path d="M22.46 6c-.77.35-1.6.59-2.46.7a4.15 4.15 0 0 0 1.82-2.28 8.32 8.32 0 0 1-2.64 1A4.12 4.12 0 0 0 11 8.12a11.7 11.7 0 0 1-8.5-4.3A4.13 4.13 0 0 0 3.9 9a4 4 0 0 1-1.86-.52v.05A4.14 4.14 0 0 0 4.1 12a4.08 4.08 0 0 1-1.85.07 4.12 4.12 0 0 0 3.84 2.86A8.27 8.27 0 0 1 2 17.54a11.63 11.63 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.36-.01-.54A8.3 8.3 0 0 0 22.46 6z" />
    </svg>
  );

  const LinkedinIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform duration-200">
      <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-9.34 7.34H7.34v8h2.32v-8zM8.5 7.5a1.33 1.33 0 1 0 0 2.66 1.33 1.33 0 0 0 0-2.66zm7.5 2.84a2.88 2.88 0 0 0-2.6 1.34h-.03V10.34h-2.31v8h2.31v-4.2a1.37 1.37 0 0 1 2.74 0v4.2H18v-4.47a2.9 2.9 0 0 0-2-2.79z" />
    </svg>
  );

  const linkSections = [
    {
      title: "WEBSITE",
      links: [
        { text: "Home", path: "/" },
        { text: "Privacy Policy", path: "/" },
        { text: "Become Plus Member", path: "/pricing" },
        { text: "Create Your Store", path: "/create-store" },
      ],
    },
    {
      title: "CONTACT",
      links: [
        { text: "+92-301-467-7899", path: "/", icon: Phone },
        { text: "contact@dreamsaver.com", path: "/", icon: Mail },
        { text: "ABC Street, 94102", path: "/", icon: MapPin },
      ],
    },
  ];

  const socialIcons = [
    { icon: FacebookIcon, link: "https://www.facebook.com", name: "Facebook" },
    { icon: InstagramIcon, link: "https://www.instagram.com", name: "Instagram" },
    { icon: TwitterIcon, link: "https://twitter.com", name: "Twitter" },
    { icon: LinkedinIcon, link: "https://www.linkedin.com", name: "LinkedIn" },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 mt-20">
      {/* Top Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-green-500 w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16 flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Brand & Newsletter */}
          <div className="flex-1 max-w-md">
            <Link href="/" className="inline-flex items-baseline text-3xl lg:text-4xl font-bold text-slate-800 hover:scale-105 transition-transform duration-200">
              <span className="text-green-600">Dream</span>Saver
              <span className="text-green-600 text-4xl lg:text-5xl">.</span>
            </Link>
            
            <p className="mt-4 text-slate-600 leading-relaxed text-sm lg:text-base">
              Welcome to DreamSaver, where your goals become reality. Join us to unlock savings and premium deals every day.
            </p>

            {/* Newsletter */}
            <div className="mt-6 p-4 bg-white rounded-3xl shadow-md border border-slate-200">
              <p className="text-sm font-semibold text-slate-800 mb-2">Stay Updated</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
                <button className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors duration-200">
                  Join
                </button>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialIcons.map((item, i) => (
                <Link
                  href={item.link}
                  key={i}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="group flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-110 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-green-500 transform transition-all duration-300 border border-slate-200"
                >
                  <item.icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full lg:w-auto">
            {linkSections.map((section, index) => (
              <div key={index} className="min-w-[160px]">
                <h3 className="font-bold text-slate-800 text-lg mb-4 lg:mb-6 pb-2 border-b-2 border-green-500/30 inline-block">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.path}
                        className="group flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:translate-x-1 text-sm lg:text-base"
                      >
                        {link.icon && (
                          <link.icon size={16} className="text-green-500 opacity-80 flex-shrink-0" />
                        )}
                        <span className="group-hover:underline">{link.text}</span>
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-300/50 py-6 lg:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 text-sm flex-wrap justify-center sm:justify-start">
            <span>© 2025 DreamSaver. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart size={14} className="text-red-500" /> for amazing shoppers
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-600 flex-wrap justify-center sm:justify-end">
            <Link href="/privacy" className="hover:text-slate-800 transition-colors hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-slate-800 transition-colors hover:underline">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
