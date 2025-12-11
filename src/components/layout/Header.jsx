import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logoImage from '../../assets/images/logo.png'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Close sidebar on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  // Function to close sidebar
  const closeSidebar = () => {
    setIsMenuOpen(false)
  }

  const navLinks = [
    { path: '/', label: 'Home', hasDropdown: false },
    { path: '/about', label: 'About Us', hasDropdown: false },
    { path: '/faq', label: 'FAQ', hasDropdown: false },
    { path: '/contact', label: 'Contact Us', hasDropdown: false },
  ]


  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md border-b border-gray-200'
          : 'bg-white border-b border-gray-100'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <nav className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link to="/" className="flex items-center">
              <img
                src={logoImage}
                alt="Kindred Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation - Right aligned */}
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-lg font-semibold text-gray-400 hover:text-primary-500 transition-colors duration-200 ${
                    isActive ? 'text-primary-900' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-4 lg:hidden">
            {/* View Properties Button - Desktop (Hidden for now, enable when needed)
            <motion.button
              onClick={() => navigate('/properties')}
              className="hidden lg:flex items-center px-6 py-2.5 bg-primary-500 text-white text-base font-medium rounded-full hover:bg-primary-600 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Properties
            </motion.button>
            */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 md:p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeSidebar}
              />

              {/* Sidebar */}
              <motion.div
                className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ 
                  type: 'spring', 
                  damping: 25, 
                  stiffness: 200 
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-14 md:h-20 px-4 md:px-6 border-b border-gray-200">
                  <Link 
                    to="/" 
                    onClick={closeSidebar}
                    className="flex items-center"
                  >
                    <img
                      src={logoImage}
                      alt="Kindred Logo"
                      className="h-8 md:h-10 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={closeSidebar}
                    className="p-1.5 md:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex flex-col p-4 md:p-6 gap-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink
                        to={link.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-2.5 md:py-3 text-base md:text-lg font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'text-primary-800 bg-primary-50 border-l-4 border-primary-800'
                              : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                          }`
                        }
                      >
                        <span>{link.label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                  
                  {/* View Properties Button - Mobile (Hidden for now, enable when needed)
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    className="pt-4 mt-4 border-t border-gray-200"
                  >
                    <button
                      onClick={() => {
                        navigate('/properties')
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-6 py-3 bg-primary-500 text-white text-base font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
                    >
                      View Properties
                    </button>
                  </motion.div>
                  */}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}

export default Header

