'use client'

import { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
    setSuccess(true)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-800 mb-6 text-center">Contact Us</h1>

      <p className="text-center text-slate-600 mb-10">
        Have questions, suggestions, or feedback? We'd love to hear from you! Fill out the form below 
        and we will get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
        >
          Send Message
        </button>

        {success && <p className="text-green-600 mt-2 text-center">Message sent successfully!</p>}
      </form>

      <div className="mt-16 text-center text-slate-600">
        <p>Or reach us at:</p>
        <p>Email: support@yourstore.com</p>
        <p>Phone: +92 300 0000000</p>
        <p>Address: 123 Street, City, Pakistan</p>
      </div>
    </div>
  )
}

export default Contact
