import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '../animations/ScrollReveal'

function FAQ({ 
  faqContent, 
  showHeader = true, 
  showHelpSection = true,
  variant = 'default' // 'default' or 'compact'
}) {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState(0)

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const isCompact = variant === 'compact'
  const sectionClass = isCompact 
    ? 'py-12 md:py-16 bg-white'
    : 'py-16 md:py-24 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden'

  return (
    <section className={sectionClass}>
      {/* Decorative Background Elements - Only for default variant */}
      {!isCompact && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        </div>
      )}

      <div className={`container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 ${!isCompact ? 'relative z-10' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {showHeader && (
            <ScrollReveal>
              <div className={`text-center ${isCompact ? 'mb-8 md:mb-12' : 'mb-16 md:mb-20'}`}>
                {!isCompact && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block mb-4"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Got Questions?
                    </span>
                  </motion.div>
                )}
                <h2 className={`${isCompact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-heading font-extrabold text-dark-green mb-6 leading-tight`}>
                  {isCompact ? (
                    faqContent.title
                  ) : (
                    <span className="bg-gradient-to-r from-dark-green via-primary-600 to-primary-500 bg-clip-text text-transparent">
                      {faqContent.title}
                    </span>
                  )}
                </h2>
                <p className={`${isCompact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} text-muted-600 max-w-2xl mx-auto leading-relaxed`}>
                  Find answers to common questions about our property insights
                  platform.
                </p>
              </div>
            </ScrollReveal>
          )}

          <div className="space-y-5">
            {faqContent.questions.map((item, index) => (
              <ScrollReveal key={index} delay={index * 0.08}>
                <motion.div
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div
                    className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-500 overflow-hidden ${
                      openIndex === index
                        ? 'border-primary-500 shadow-2xl shadow-primary-500/20'
                        : 'border-primary-100/50 hover:border-primary-300 hover:shadow-xl'
                    }`}
                  >
                    {/* Gradient Overlay when Open */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 transition-all duration-500 ${
                        openIndex === index
                          ? 'from-primary-50/50 to-primary-100/30'
                          : ''
                      }`}
                    />

                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <button
                      onClick={() => toggleQuestion(index)}
                      className={`w-full text-left ${isCompact ? 'p-5 md:p-6' : 'p-6 md:p-8'} flex justify-between items-start gap-4 relative z-10`}
                      aria-expanded={openIndex === index}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Question Number Badge */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            openIndex === index
                              ? 'bg-primary-500 text-white shadow-lg scale-110'
                              : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Question Text */}
                        <div className="flex-1">
                          <h3
                            className={`${isCompact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-heading font-bold pr-4 transition-colors duration-300 ${
                              openIndex === index
                                ? 'text-primary-700'
                                : 'text-dark-green group-hover:text-primary-600'
                            }`}
                          >
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      {/* Icon Container */}
                      <motion.div
                        className="flex-shrink-0"
                        animate={{
                          rotate: openIndex === index ? 180 : 0,
                          scale: openIndex === index ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3, type: 'spring' }}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            openIndex === index
                              ? 'bg-primary-500 text-white shadow-lg'
                              : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
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
                        </div>
                      </motion.div>
                    </button>

                    {/* Answer Content */}
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className={`${isCompact ? 'px-5 md:px-6 pb-5 md:pb-6' : 'px-6 md:px-8 pb-6 md:pb-8'} relative z-10`}>
                            <div className="ml-14 border-l-2 border-primary-300 pl-6">
                              <motion.p
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`text-muted-700 leading-relaxed ${isCompact ? 'text-base' : 'text-base md:text-lg'}`}
                              >
                                {item.answer}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Corner Accents */}
                    <div
                      className={`absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 rounded-tr-2xl transition-opacity duration-500 ${
                        openIndex === index
                          ? 'border-primary-300 opacity-100'
                          : 'border-primary-200/50 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                    <div
                      className={`absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 rounded-bl-2xl transition-opacity duration-500 ${
                        openIndex === index
                          ? 'border-primary-300 opacity-100'
                          : 'border-primary-200/50 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Additional Help Section */}
          {showHelpSection && (
            <ScrollReveal delay={0.5}>
              <motion.div
                className={`${isCompact ? 'mt-8 md:mt-10' : 'mt-12 md:mt-16'} text-center`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className={`inline-block ${isCompact ? 'p-5 md:p-6' : 'p-6 md:p-8'} bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-200/50 shadow-lg`}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className={`${isCompact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-heading font-bold text-dark-green`}>
                      Still have questions?
                    </h3>
                  </div>
                  <p className={`text-muted-600 mb-4 ${isCompact ? 'text-sm' : 'text-base'}`}>
                    Can't find the answer you're looking for? Please reach out
                    to our friendly team.
                  </p>
                  <motion.button
                    onClick={() => navigate('/contact')}
                    className={`btn btn-primary ${isCompact ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-base'} font-semibold inline-flex items-center gap-2 shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact Us
                  </motion.button>
                </div>
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}

export default FAQ

