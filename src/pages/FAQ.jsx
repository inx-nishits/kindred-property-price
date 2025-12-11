import FAQ from '../components/common/FAQ'
import SEO from '../components/common/SEO'
import staticContent from '../data/staticContent.json'

function FAQPage() {
  const content = staticContent.faq

  return (
    <>
      <SEO
        title="Frequently Asked Questions"
        description="Frequently asked questions about Property Insights Australia. Find answers about property estimates, data accuracy, and our services."
        keywords="FAQ, frequently asked questions, property estimates, data accuracy, help, support"
      />

      <FAQ 
        faqContent={content} 
        showHeader={true} 
        showHelpSection={true} 
        variant="default" 
      />
    </>
  )
}

export default FAQPage

