'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { BRAND_CONFIG, CONTACT_CONFIG } from '@/config/report.config'

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
              <Link href="https://www.kindred.com.au/" className="inline-block" target="_blank">
                <img
                  src="/footer-logo.webp"
                  alt="Kindred Logo"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>
            {/* <p className="text-base text-gray-600 leading-relaxed max-w-xs">
              Real estate, recreated.
            </p> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { path: 'https://www.kindred.com.au/', label: 'Home' },
                { path: 'https://www.kindred.com.au/who-we-are', label: 'About' },
                { path: 'https://www.kindred.com.au/faqs', label: 'FAQ' },
                { path: 'https://www.kindred.com.au/contact-us', label: 'Contact' },
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-heading font-bold text-dark-green mb-6 text-2xl">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { path: 'https://www.kindred.com.au/legal/privacy-policy', label: 'Privacy Policy' },
                { path: 'https://www.kindred.com.au/resources', label: 'Resources' },
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </a>
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
                  href="mailto:customercare@kindred.com.au"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium break-all"
                >
                  customercare@kindred.com.au
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href={`tel:${CONTACT_CONFIG.phone.replace(/\s+/g, '')}`}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium"
                >
                  {CONTACT_CONFIG.phone}
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
