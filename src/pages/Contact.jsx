import { useState } from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/common/SEO'

function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setSubmitted(true)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const serviceAreas = [
    { region: 'Coastal', locations: ['Deception Bay', 'Scarborough', 'Newport', 'Margate', 'Redcliffe'] },
    { region: 'Northern', locations: ['North Lakes', 'Mango Hill', 'Griffin', 'Kallangur', 'Warner', 'Petrie', 'Strathpine'] },
    { region: 'Caboolture Region', locations: ['Caboolture', 'Morayfield', 'Burpengary', 'Narangba'] },
    { region: 'Brisbane North', locations: ['Sandgate', 'Bracken Ridge', 'Aspley', 'Albany Creek'] },
  ]

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      description: 'We respond within 48 hours',
      value: 'customercare@kindred.com.au',
      href: 'mailto:customercare@kindred.com.au',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Call Us',
      description: 'Mon-Fri, 9am to 5pm',
      value: '(07) 3284 0512',
      href: 'tel:0732840512',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Visit Us',
      description: 'Come say hello',
      value: '425 Elizabeth Ave, Kippa-Ring',
      href: 'https://maps.google.com/?q=425+Elizabeth+Avenue+Kippa-Ring+QLD',
    },
  ]

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Property Insights Australia. We'd love to hear from you about your property questions."
        keywords="contact, property questions, support, help, property insights"
      />

      {/* Hero Section - Split Design */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient mesh */}
          <div className="absolute top-0 right-0 w-[70%] h-full bg-gradient-to-bl from-primary-50 via-primary-100/50 to-transparent" />
          
          {/* Decorative circles */}
          <motion.div 
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-primary-200/40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute top-20 right-40 w-64 h-64 rounded-full border border-primary-300/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-primary-100/40 blur-3xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23163B2A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary-700">We're here to help</span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-dark-green mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Let's start a
                <span className="relative inline-block ml-3">
                  <span className="relative z-10">conversation</span>
                  <motion.span
                    className="absolute bottom-2 left-0 w-full h-3 bg-primary-300/50 -z-0"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    style={{ originX: 0 }}
                  />
                </span>
              </motion.h1>

              <motion.p
                className="text-lg text-muted-600 mb-10 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Have a property question or need expert advice? Our friendly team 
                is ready to assist you with all your real estate needs.
              </motion.p>

              {/* Contact Methods */}
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={method.title}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
                    variants={itemVariants}
                    whileHover={{ x: 8 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-dark-green">{method.title}</h3>
                        <span className="text-xs text-muted-400">•</span>
                        <span className="text-xs text-muted-500">{method.description}</span>
                      </div>
                      <p className="text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                        {method.value}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-muted-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Card glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-primary-500/20 rounded-3xl blur-xl opacity-60" />
                
                <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100/80">
                  <div className="mb-8">
                    <h2 className="text-2xl font-heading font-bold text-dark-green mb-2">Send us a message</h2>
                    <p className="text-muted-500">Fill out the form and we'll be in touch soon</p>
                  </div>

                  {submitted ? (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      >
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <h3 className="text-2xl font-heading font-bold text-dark-green mb-3">Message sent!</h3>
                      <p className="text-muted-600 mb-6">We'll get back to you within 48 hours.</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-primary-500 font-medium hover:text-primary-600 transition-colors inline-flex items-center gap-2"
                      >
                        Send another message
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-dark-green mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-dark-green mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                            placeholder="Smith"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-dark-green mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-dark-green mb-2">
                          Phone <span className="text-muted-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                          placeholder="04XX XXX XXX"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-dark-green mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 resize-none"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Send Message
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </span>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-green/5 rounded-full text-sm font-medium text-dark-green mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Our Coverage Area
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark-green mb-4">
              Proudly serving North Brisbane<br className="hidden sm:block" /> & Moreton Bay
            </h2>
            <p className="text-muted-600 max-w-xl mx-auto">
              Your trusted property partner across these communities
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {serviceAreas.map((area) => (
              <motion.div
                key={area.region}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <h3 className="text-lg font-heading font-bold text-dark-green mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full" />
                  {area.region}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {area.locations.map((location) => (
                    <span
                      key={location}
                      className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-muted-600 hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-default"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-dark-green to-secondary-600 relative overflow-hidden">
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <motion.div 
          className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 text-center relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
              Prefer to visit in person?
            </h2>
            <p className="text-white/80 mb-8">
              Our office is located at 425 Elizabeth Avenue, Kippa-Ring QLD 4021
            </p>
            <a
              href="https://maps.google.com/?q=425+Elizabeth+Avenue+Kippa-Ring+QLD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-dark-green font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          </div>
        </motion.div>
      </section>
    </>
  )
}

export default Contact
