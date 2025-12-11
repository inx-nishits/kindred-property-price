import { motion } from 'framer-motion'
import ScrollReveal from '../components/animations/ScrollReveal'
import SEO from '../components/common/SEO'
import staticContent from '../data/staticContent.json'

function Terms() {
  const content = staticContent.terms

  return (
    <>
      <SEO
        title="Terms and Conditions"
        description="Terms and Conditions for Property Insights Australia. Read our terms of service and usage policies."
        keywords="terms and conditions, terms of service, legal, usage policies"
      />

      <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-green mb-4">
              {content.title}
            </h1>
            <p className="text-muted-600 mb-8">
              Last Updated: {content.lastUpdated}
            </p>
          </ScrollReveal>

          <div className="prose prose-lg max-w-none">
            {content.sections.map((section, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="mb-8">
                  <h2 className="text-2xl font-heading font-semibold text-dark-green mt-8 mb-4">
                    {section.heading}
                  </h2>
                  <p className="text-muted-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default Terms

