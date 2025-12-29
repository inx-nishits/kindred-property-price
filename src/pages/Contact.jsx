import { useState } from 'react'


import { Mail, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react'

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



  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Email Us',
      description: 'We respond within 48 hours',
      value: 'customercare@kindred.com.au',
      href: 'mailto:customercare@kindred.com.au',
    },
    {
      icon: <Phone className="w-6 h-6" strokeWidth={1.5} />,
      title: 'Call Us',
      description: 'Mon-Fri, 9am to 5pm',
      value: '(07) 3284 0512',
      href: 'tel:0732840512',
    },
    {
      icon: <MapPin className="w-6 h-6" strokeWidth={1.5} />,
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

        <div className="relative container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-16">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left - Content */}

            <div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-md mb-6">

                <span className="w-2 h-2 bg-primary-500 rounded-full" />

                <span className="text-sm font-medium text-primary-700">We're here to help</span>

              </div>



              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-dark-green mb-6 leading-tight">

                Let's start a conversation

              </h1>



              <p className="text-lg text-muted-600 mb-10 max-w-lg leading-relaxed">

                Have a property question or need expert advice? Our friendly team

                is ready to assist you with all your real estate needs.

              </p>



              {/* Contact Methods */}

              <div className="space-y-4">

                {contactMethods.map((method) => (

                  <a

                    key={method.title}

                    href={method.href}

                    target={method.href.startsWith('http') ? '_blank' : undefined}

                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}

                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-shadow duration-200"

                  >

                    <div className="w-12 h-12 rounded-md bg-primary-500 flex items-center justify-center text-white">

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

                    <ArrowRight className="w-5 h-5 text-muted-300 group-hover:text-primary-500 transition-colors" strokeWidth={1.5} />

                  </a>

                ))}

              </div>

            </div>



            {/* Right - Form Card */}

            <div>

              <div className="bg-white rounded-md p-8 md:p-10 shadow-md border border-gray-200">

                <div className="mb-8">

                  <h2 className="text-2xl font-heading font-bold text-dark-green mb-2">Send us a message</h2>

                  <p className="text-muted-500">Fill out the form and we'll be in touch soon</p>

                </div>



                {submitted ? (

                  <div className="text-center py-12">

                    <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">

                      <CheckCircle className="w-10 h-10 text-white" strokeWidth={2} />

                    </div>

                    <h3 className="text-2xl font-heading font-bold text-dark-green mb-3">Message sent!</h3>

                    <p className="text-muted-600 mb-6">We'll get back to you within 48 hours.</p>

                    <button

                      onClick={() => setSubmitted(false)}

                      className="text-primary-500 font-medium hover:text-primary-600 transition-colors inline-flex items-center gap-2"

                    >

                      Send another message

                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />

                    </button>

                  </div>

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

                          className="w-full px-4 py-3.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"

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

                          className="w-full px-4 py-3.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"

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



                    <button

                      type="submit"

                      disabled={isSubmitting}

                      className="w-full py-4 bg-primary-500 text-white font-semibold rounded-full shadow-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"

                    >

                      {isSubmitting ? (

                        <span className="flex items-center justify-center gap-2">

                          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                          Sending...

                        </span>

                      ) : (

                        <span className="flex items-center justify-center gap-2">

                          Send Message

                          <svg

                            className="w-5 h-5 transform rotate-45"

                            fill="none"

                            viewBox="0 0 24 24"

                            stroke="currentColor"

                          >

                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />

                          </svg>

                        </span>

                      )}

                    </button>

                  </form>

                )}

              </div>

            </div>

          </div>

        </div>

      </section>

    </>

  )

}



export default Contact

