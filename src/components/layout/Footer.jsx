import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import logoImage from '../../assets/images/logo.png'

function Footer() {
  const currentYear = new Date().getFullYear()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <footer
      ref={ref}
      className="bg-gradient-to-b from-white to-gray-50/50 border-t border-gray-200/50 mt-auto relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="mb-6"
            >
              <Link to="/" className="inline-block">
                <img
                  src={logoImage}
                  alt="Kindred Logo"
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </motion.div>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xs">
              Comprehensive property insights and market data for Australian properties. Get accurate estimates and detailed reports.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About' },
                { path: '/faq', label: 'FAQ' },
                { path: '/contact', label: 'Contact' },
              ].map((link, index) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link
                    to={link.path}
                    className="text-lg text-gray-600 hover:text-primary-600 transition-all duration-300 inline-block relative group font-medium"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/privacy', label: 'Privacy Policy' },
                { path: '/terms', label: 'Terms & Conditions' },
              ].map((link, index) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <Link
                    to={link.path}
                    className="text-lg text-gray-600 hover:text-primary-600 transition-all duration-300 inline-block relative group font-medium"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Contact
            </h3>
            <ul className="space-y-4">
              <motion.li
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 group"
              >
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@propertyinsights.com.au"
                  className="text-lg text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  info@propertyinsights.com.au
                </a>
              </motion.li>
              <motion.li
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 group"
              >
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+61280000000"
                  className="text-lg text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  +61 2 8000 0000
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200/50"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-lg text-gray-500 text-center">
            © {currentYear} Kindred. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  )
}

export default Footer

