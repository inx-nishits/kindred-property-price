'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import logoImage from '@/assets/images/logo.png'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="bg-white border-t border-gray-200 mt-auto relative"
    >

      <div className="container px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <img
                  src={logoImage.src}
                  alt="Kindred Logo"
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-xs">
              Comprehensive property insights and market data for Australian properties. Get accurate estimates and detailed reports.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About' },
                { path: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-lg text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.kindred.com.au/contact-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.kindred.com.au/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Privacy Policy
                </a>
              </li>
              {[
                { path: '/terms', label: 'Terms & Conditions' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-lg text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:info@propertyinsights.com.au"
                  className="text-lg text-gray-600 hover:text-primary-600 transition-colors font-medium break-all"
                >
                  info@propertyinsights.com.au
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href="tel:+61280000000"
                  className="text-lg text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  +61 2 8000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-lg text-gray-500 text-center">
            © {currentYear} Kindred. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
