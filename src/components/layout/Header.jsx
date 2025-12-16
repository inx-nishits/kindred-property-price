import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logoImage from '../../assets/images/logo.png'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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

  const closeSidebar = () => {
    setIsMenuOpen(false)
  }

  // Keep your original routes/content, only tweak layout/styling
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact Us' },
  ]

  const mainLinks = navLinks.slice(0, 3)
  const contactLink = navLinks[3]

  return (
    <motion.header
      className={`sticky top-0 z-50 nav-shadow bg-white transition-all duration-300 ${
        isScrolled ? 'border-b border-gray-200' : 'border-b border-gray-100'
      }`}
    >
      <nav className="container px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px] lg:h-[100px] gap-4">
          {/* Logo - left aligned */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logoImage}
                alt="Kindred Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center nav - three items, Kindred-like colours and 18px semi-bold font */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
            {mainLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-[18px] font-semibold tracking-tight transition-colors text-[color:var(--green-900)] ${
                    isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Contact button + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Desktop Contact Us button aligned to right */}
            {contactLink && (
              <NavLink
                to={contactLink.path}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center px-4 lg:px-6 py-2 lg:py-[0.875rem] text-[14px] lg:text-[18px] font-semibold whitespace-nowrap rounded-full transition-colors bg-[color:var(--green-900)] text-[color:var(--white)] hover:bg-[color:var(--green-700)]`
                }
              >
                {contactLink.label}
              </NavLink>
            )}

            {/* Mobile menu toggle */}
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
                  stiffness: 200,
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
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <NavLink
                        to={link.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-2.5 md:py-3 rounded-lg text-[18px] font-semibold transition-all duration-200 text-[color:var(--green-900)] ${
                            isActive
                              ? 'bg-[color:var(--green-100)] border-l-4 border-[color:var(--green-900)]'
                              : 'opacity-80 hover:opacity-100 hover:bg-[color:var(--green-100)]'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
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
