'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND_CONFIG } from '@/config/report.config'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileExpandedSections, setMobileExpandedSections] = useState([])

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
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          setIsMenuOpen(false)
        }
        if (activeDropdown) {
          setActiveDropdown(null)
        }
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen, activeDropdown])

  const closeSidebar = () => {
    setIsMenuOpen(false)
    setMobileExpandedSections([]) // Reset expanded sections when closing
  }

  const toggleMobileSection = (menuId) => {
    setMobileExpandedSections(prev =>
      prev.includes(menuId)
        ? [] // Close if already open
        : [menuId] // Open only this section, close others
    )
  }

  // Menu structure matching Kindred's design
  const menuItems = [
    {
      id: 'buy-sell',
      label: 'Buy & Sell',
      hasDropdown: true,
      items: [
        {
          title: 'Buying with Kindred',
          link: 'https://www.kindred.com.au/buying',
          description: 'Learn more'
        },
        {
          title: 'Selling with Kindred',
          link: 'https://www.kindred.com.au/selling',
          description: 'Learn more'
        }
      ]
    },
    {
      id: 'rent-manage',
      label: 'Rent & Manage',
      hasDropdown: true,
      items: [
        {
          title: 'Browse rentals',
          link: 'https://www.kindred.com.au/property?type=Rental&status=current',
          description: 'Learn more'
        },
        {
          title: 'Property Management with Kindred',
          link: 'https://www.kindred.com.au/property-management',
          description: 'Learn more'
        }
      ]
    },
    {
      id: 'about',
      label: 'About',
      hasDropdown: true,
      items: [
        {
          title: 'About us',
          link: '/about',
          description: 'Learn more',
          isInternal: true
        },
        {
          title: 'Careers',
          link: 'https://www.kindred.com.au/careers',
          description: 'Learn more'
        },
        {
          title: 'News & Insights',
          link: 'https://www.kindred.com.au/news-insights',
          description: 'Learn more'
        },
        {
          title: 'Contact',
          link: 'https://www.kindred.com.au/contact-us',
          description: 'Learn more'
        }
      ]
    },
    {
      id: 'sales-appraisal',
      label: 'Sales Appraisal',
      hasDropdown: true,
      items: [
        {
          title: 'Free Sales Appraisal',
          link: 'https://www.kindred.com.au/sales-property-appraisal',
          description: 'Learn more'
        },
        {
          title: 'Instant Price Update',
          link: '/',
          description: 'Learn more',
          isInternal: true
        }
      ]
    }
  ]

  const handleMouseEnter = (menuId) => {
    setActiveDropdown(menuId)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <motion.header
      className={`sticky top-0 z-50 nav-shadow bg-white transition-all duration-300 ${isScrolled ? 'border-b border-gray-200' : 'border-b border-gray-100'
        }`}
    >
      <nav className="container px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px] lg:h-[100px] gap-4">
          {/* Logo - left aligned */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt="Kindred Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center nav - Dropdown menus */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-8">
            {menuItems.map((menu) => (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(menu.id)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center gap-1.5 py-2 text-[14px] xl:text-[18px] font-semibold tracking-tight transition-colors"
                  style={{ color: 'var(--green-900)' }}
                  aria-expanded={activeDropdown === menu.id}
                >
                  {menu.label}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === menu.id ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === menu.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 min-w-[320px]"
                      style={{ top: 'calc(100% + 2px)' }}
                    >
                      <div className="bg-white p-[9px]" style={{ borderRadius: '20px', boxShadow: 'rgba(0, 0, 0, 0.08) -12px -2px 16px 4px, rgba(0, 0, 0, 0.03) 2px 3px 6px 4px' }}>
                        {menu.items.map((item, index) => (
                          item.isInternal ? (
                            <Link
                              key={index}
                              href={item.link}
                              className="group block p-[18px] transition-colors"
                              style={{ borderRadius: '18px' }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[20px] font-semibold mb-0.5" style={{ color: '#000000' }}>
                                    {item.title}
                                  </div>
                                  <div className="text-[18px] font-medium flex items-center gap-3" style={{ color: '#167242' }}>
                                    {item.description}
                                    <svg
                                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0.5 20 20"
                                    >
                                      <g clipPath="url(#clip0_4614_2154)">
                                        <path
                                          d="M16.9384 10.3727L2.92256 10.373"
                                          stroke="#167242"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M12.8013 14.5401C14.616 13.0409 15.5222 12.1276 16.9345 10.3733C15.508 8.63044 14.5945 7.7245 12.7676 6.24007"
                                          stroke="#167242"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_4614_2154">
                                          <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <a
                              key={index}
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block p-[18px] transition-colors"
                              style={{ borderRadius: '18px' }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[20px] font-semibold mb-0.5" style={{ color: '#000000' }}>
                                    {item.title}
                                  </div>
                                  <div className="text-[18px] font-medium flex items-center gap-3" style={{ color: '#167242' }}>
                                    {item.description}
                                    <svg
                                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0.5 20 20"
                                    >
                                      <g clipPath="url(#clip0_4614_2154_ext)">
                                        <path
                                          d="M16.9384 10.3727L2.92256 10.373"
                                          stroke="#167242"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M12.8013 14.5401C14.616 13.0409 15.5222 12.1276 16.9345 10.3733C15.508 8.63044 14.5945 7.7245 12.7676 6.24007"
                                          stroke="#167242"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_4614_2154_ext">
                                          <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </a>
                          )
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right: View Properties link + Contact button + mobile menu */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Divider - Desktop only */}
            <div
              className="hidden lg:block navbar_divider"
              style={{
                backgroundColor: 'var(--green-500)',
                width: '2px',
                height: '1.5rem',
                marginRight: '.5rem'
              }}
            ></div>

            {/* View Properties Link - Desktop only */}
            <a
              href="https://www.kindred.com.au/property"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex text-[14px] xl:text-[18px] font-semibold tracking-tight transition-colors text-[color:var(--green-900)] opacity-80 hover:opacity-100"
            >
              View properties
            </a>

            {/* Desktop Contact Us button */}
            <a
              href="https://www.kindred.com.au/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 lg:px-6 py-2 lg:py-[0.875rem] text-[14px] lg:text-[18px] font-semibold whitespace-nowrap rounded-full transition-colors bg-[color:var(--green-900)] text-[color:var(--white)] hover:bg-[color:var(--green-700)]"
            >
              Contact us
            </a>

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
                className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 lg:hidden flex flex-col"
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
                {/* Sidebar Header - Sticky */}
                <div className="flex-shrink-0 flex items-center justify-between h-[64px] md:h-20 px-4 md:px-6 border-b border-gray-200 bg-white">
                  <Link
                    href="/"
                    onClick={closeSidebar}
                    className="flex items-center"
                  >
                    <img
                      src={BRAND_CONFIG.logoUrl}
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

                {/* Sidebar Navigation Links - Scrollable */}
                <nav className="flex-1 overflow-y-auto flex flex-col p-4 md:p-6 gap-2">
                  {/* Menu Items with Accordion Dropdowns */}
                  {menuItems.map((menu, menuIndex) => {
                    const isExpanded = mobileExpandedSections.includes(menu.id)

                    return (
                      <motion.div
                        key={menu.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuIndex * 0.08 }}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {/* Accordion Header */}
                        <button
                          onClick={() => toggleMobileSection(menu.id)}
                          className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
                          aria-expanded={isExpanded}
                        >
                          <span className="text-[18px] md:text-[20px] font-bold" style={{ color: 'var(--green-900)' }}>
                            {menu.label}
                          </span>
                          <svg
                            className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''
                              }`}
                            fill="none"
                            stroke="var(--green-900)"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Accordion Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-3 space-y-1">
                                {menu.items.map((item, itemIndex) => (
                                  item.isInternal ? (
                                    <Link
                                      key={itemIndex}
                                      href={item.link}
                                      onClick={closeSidebar}
                                      className="group flex items-start justify-between px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                                    >
                                      <div className="flex-1">
                                        <div className="text-[17px] md:text-[18px] font-semibold mb-1" style={{ color: '#000000' }}>
                                          {item.title}
                                        </div>
                                        <div className="text-[15px] md:text-[16px] font-medium flex items-center gap-2" style={{ color: '#167242' }}>
                                          {item.description}
                                          <svg
                                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0.5 20 20"
                                          >
                                            <path
                                              d="M16.9384 10.3727L2.92256 10.373"
                                              stroke="#167242"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <path
                                              d="M12.8013 14.5401C14.616 13.0409 15.5222 12.1276 16.9345 10.3733C15.508 8.63044 14.5945 7.7245 12.7676 6.24007"
                                              stroke="#167242"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    </Link>
                                  ) : (
                                    <a
                                      key={itemIndex}
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={closeSidebar}
                                      className="group flex items-start justify-between px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                                    >
                                      <div className="flex-1">
                                        <div className="text-[17px] md:text-[18px] font-semibold mb-1" style={{ color: '#000000' }}>
                                          {item.title}
                                        </div>
                                        <div className="text-[15px] md:text-[16px] font-medium flex items-center gap-2" style={{ color: '#167242' }}>
                                          {item.description}
                                          <svg
                                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0.5 20 20"
                                          >
                                            <path
                                              d="M16.9384 10.3727L2.92256 10.373"
                                              stroke="#167242"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <path
                                              d="M12.8013 14.5401C14.616 13.0409 15.5222 12.1276 16.9345 10.3733C15.508 8.63044 14.5945 7.7245 12.7676 6.24007"
                                              stroke="#167242"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    </a>
                                  )
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}

                  {/* View Properties Link */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.08 }}
                    className="pt-2"
                  >
                    <a
                      href="https://www.kindred.com.au/property"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeSidebar}
                      className="flex items-center px-4 py-4 text-[18px] md:text-[20px] font-bold transition-all duration-200 hover:bg-gray-50"
                      style={{ color: 'var(--green-900)' }}
                    >
                      View properties
                    </a>
                  </motion.div>
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
