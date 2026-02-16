'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import ScrollReveal from '../animations/ScrollReveal'

function FAQ({
  items,
  faqContent,
  showHeader = true,
  variant = 'default' // 'default' or 'compact'
}) {
  const [openIndex, setOpenIndex] = useState(0)

  // Use items if provided, otherwise use faqContent
  const content = items || faqContent || { title: 'FAQ', questions: [] }

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const isCompact = variant === 'compact'
  const sectionClass = isCompact
    ? 'section-spacing bg-white'
    : 'section-spacing bg-white'

  return (
    <section className={sectionClass}>
      {/* Decorative Background Elements - Only for default variant */}
      {!isCompact && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        </div>
      )}

      <div className={`container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-[60px] lg:pt-[120px] ${!isCompact ? 'relative z-10' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {showHeader && (
            <ScrollReveal>
              <div className={`hidden text-center ${isCompact ? 'mb-8 md:mb-10' : 'mb-10 md:mb-10'}`}>
                {!isCompact && (
                  <div className="inline-block mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-md text-sm font-semibold">
                      <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
                      Got Questions?
                    </span>
                  </div>
                )}
                <h2 className={`${isCompact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-heading font-semibold text-dark-green mb-6 leading-tight`}>
                  {isCompact ? (
                    faqContent.title
                  ) : (
                    <span className="text-dark-green">
                      {content.title}
                    </span>
                  )}
                </h2>
                <p className={`${isCompact ? 'text-base' : 'text-base'} text-muted-600 max-w-2xl mx-auto leading-relaxed`}>
                  Find answers to common questions about our property insights
                  platform.
                </p>
              </div>
            </ScrollReveal>
          )}

          <div className="space-y-5">
            {content.questions.map((item, index) => (
              <ScrollReveal key={index} delay={index * 0.08}>
                <div className="group">
                  <div
                    className={`relative bg-white rounded-md shadow-sm border transition-all duration-200 overflow-hidden ${openIndex === index
                      ? 'border-primary-500 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                      }`}
                  >

                    <button
                      onClick={() => toggleQuestion(index)}
                      className={`w-full text-left ${isCompact ? 'p-5 md:p-6' : 'p-6 md:p-8'} flex justify-between items-start gap-4 relative z-10`}
                      aria-expanded={openIndex === index}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Question Number Badge */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm transition-colors duration-200 ${openIndex === index
                            ? 'bg-primary-500 text-white shadow-lg scale-110'
                            : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                            }`}
                        >
                          {index + 1}
                        </div>

                        {/* Question Text */}
                        <div className="flex-1">
                          <h3
                            className={`${isCompact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-heading font-bold pr-4 transition-colors duration-300 ${openIndex === index
                              ? 'text-primary-700'
                              : 'text-dark-green group-hover:text-primary-600'
                              }`}
                          >
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      {/* Icon Container */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 ${openIndex === index
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                            }`}
                        >
                          {openIndex === index ? (
                            <ChevronUp className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Answer Content */}
                    {openIndex === index && (
                      <div className="overflow-hidden">
                        <div className={`${isCompact ? 'px-5 md:px-6 pb-5 md:pb-6' : 'px-6 md:px-8 pb-6 md:pb-8'} relative z-10`}>
                          <div className="ml-14 border-l-2 border-primary-300 pl-6">
                            <p className={`text-muted-700 leading-relaxed ${isCompact ? 'text-base' : 'text-base md:text-base'}`}>
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Corner Accents */}
                    <div
                      className={`absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 rounded-tr-2xl transition-opacity duration-500 ${openIndex === index
                        ? 'border-primary-300 opacity-100'
                        : 'border-primary-200/50 opacity-0 group-hover:opacity-100'
                        }`}
                    />
                    <div
                      className={`absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 rounded-bl-2xl transition-opacity duration-500 ${openIndex === index
                        ? 'border-primary-300 opacity-100'
                        : 'border-primary-200/50 opacity-0 group-hover:opacity-100'
                        }`}
                    />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
