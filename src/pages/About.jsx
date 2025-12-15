import { Link } from 'react-router-dom'
import ScrollReveal from '../components/animations/ScrollReveal'
import NumberCounter from '../components/animations/NumberCounter'
import SEO from '../components/common/SEO'

function About() {
  // Australian cities coverage
  const australianCities = [
    { name: 'Sydney', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop&q=80', description: 'NSW' },
    { name: 'Melbourne', image: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400&h=300&fit=crop&q=80', description: 'VIC' },
    { name: 'Brisbane', image: 'https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=400&h=300&fit=crop&q=80', description: 'QLD' },
    { name: 'Perth', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', description: 'WA' },
    { name: 'Adelaide', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80', description: 'SA' },
    { name: 'Gold Coast', image: 'https://images.unsplash.com/photo-1571366343168-631c5bcca7a4?w=400&h=300&fit=crop&q=80', description: 'QLD' },
  ]

  // Core values
  const coreValues = [
    {
      title: 'Accuracy First',
      description: 'Our property data is sourced from official records and verified to ensure you get the most accurate estimates possible.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: 'Privacy Protected',
      description: 'Your personal information is never shared with third parties. We use bank-level encryption to keep your data safe.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Transparency',
      description: 'We believe in complete transparency. See exactly how we calculate estimates and where our data comes from.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: 'Innovation',
      description: 'We continuously improve our algorithms and data sources to provide you with cutting-edge property insights.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ]

  // Statistics - These align with Home page stats
  const stats = [
    { value: 500, suffix: 'K+', label: 'Properties Covered', description: 'Across Australia' },
    { value: 98, suffix: '%', label: 'Data Accuracy', description: 'Verified information' },
    { value: 6, suffix: '+', label: 'Major Cities', description: 'Nationwide coverage' },
    { value: 100, suffix: '%', label: 'Free Reports', description: 'No hidden costs' },
  ]

  // Team expertise
  const expertise = [
    {
      title: 'Market Analysis',
      description: 'Deep expertise in Australian property markets with real-time data analysis.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Data Science',
      description: 'Advanced algorithms powered by machine learning for accurate valuations.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Real Estate',
      description: 'Decades of combined experience in Australian real estate industry.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Technology',
      description: 'State-of-the-art platform built for speed, reliability, and security.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Property Insights Australia - your trusted source for comprehensive property data and market insights across Australia."
        keywords="about us, property insights, Australian property data, property platform, real estate insights"
      />

      {/* Hero Section with Australian Property Background */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523688471150-efdd09f0f312?w=1920&h=1080&fit=crop"
            alt="Australian cityscape with modern architecture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-green/95 via-dark-green/85 to-dark-green/70" />
          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10 py-12 md:py-16">
          <div className="max-w-3xl">
            <div
            >
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500/20 backdrop-blur-sm text-primary-300 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-primary-500/30">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Australia's Trusted Property Platform
              </span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-white mb-4 sm:mb-6 leading-tight">
                Empowering Your
                <span className="block text-primary-400">Property Decisions</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed">
                We provide comprehensive property insights to help Australians make confident, informed decisions about their most valuable asset.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/"
                  className="btn btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Properties
                </Link>
                <Link
                  to="/contact"
                  className="btn px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="hidden lg:block absolute right-8 xl:right-12 top-1/2 -translate-y-1/2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500K+</p>
                <p className="text-gray-300 text-sm">Properties Analyzed</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-gray-300 text-sm">Data Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Grid */}
            <ScrollReveal>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-4">
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl h-40 sm:h-48">
                    <img
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
                      alt="Modern Australian home"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl h-52 sm:h-64">
                    <img
                      src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=400&fit=crop"
                      alt="Luxury property interior"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl h-52 sm:h-64">
                    <img
                      src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=400&fit=crop"
                      alt="Suburban Australian home"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl h-40 sm:h-48">
                    <img
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop"
                      alt="Australian property exterior"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Floating Badge */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Trusted by Australians
                </div>
              </div>
            </ScrollReveal>

            {/* Content */}
            <ScrollReveal delay={0.2}>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Our Story
                </span>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-dark-green mb-6 leading-tight">
                  Making Property Data
                  <span className="text-primary-500"> Accessible to All</span>
                </h2>
                
                <div className="space-y-4 text-lg text-muted-600 leading-relaxed">
                  <p>
                    Kindred was built with a simple mission: to democratize access to property information across Australia. We believe everyone deserves transparent, reliable data when making one of life's most significant financial decisions.
                  </p>
                  <p>
                    Our platform combines advanced technology with comprehensive data sources to deliver accurate property estimates and insights that help Australians make confident property decisions.
                  </p>
                  <p>
                    Whether you're a first-home buyer researching your dream suburb, a homeowner curious about your property's value, or an investor analysing market trends—our platform provides the insights you need, completely free.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                  <div>
                    <p className="text-3xl font-bold text-primary-500">6+</p>
                    <p className="text-sm text-muted-600">Major Cities</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary-500">24/7</p>
                    <p className="text-sm text-muted-600">Data Updates</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary-500">Free</p>
                    <p className="text-sm text-muted-600">Property Reports</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-primary-50/50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Our Purpose
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-dark-green mb-6">
                Mission & Vision
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission Card */}
            <ScrollReveal delay={0.1}>
              <div
                className="relative group h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl h-full">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-4">Our Mission</h3>
                  <p className="text-lg text-muted-600 leading-relaxed">
                    To democratize access to property information, empowering every Australian with transparent, reliable data to make confident property decisions. We break down barriers between complex market data and everyday people.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Vision Card */}
            <ScrollReveal delay={0.2}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-dark-green to-deepest-green rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
                <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl h-full">
                  <div className="w-16 h-16 bg-dark-green/10 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-4">Our Vision</h3>
                  <p className="text-lg text-muted-600 leading-relaxed">
                    To become Australia's most trusted property insights platform, where cutting-edge technology meets comprehensive data to transform how Australians interact with the property market for generations to come.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-dark-green relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2310b981' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-white mb-4">
                Trusted by Australians
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Our numbers speak for themselves. Join thousands who trust us for their property insights.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-400 mb-2">
                    <NumberCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      decimals={0}
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{stat.label}</h3>
                  <p className="text-gray-400 text-sm">{stat.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                What Drives Us
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-dark-green mb-6">
                Our Core Values
              </h2>
              <p className="text-lg text-muted-600 max-w-2xl mx-auto">
                These principles guide every decision we make and every feature we build.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {coreValues.map((value, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="group relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-5 text-primary-600 group-hover:scale-110 transition-transform">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-dark-green mb-3">{value.title}</h3>
                    <p className="text-muted-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Australian Cities Coverage */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coverage Area
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-dark-green mb-6">
                Serving All Major Australian Cities
              </h2>
              <p className="text-lg text-muted-600 max-w-2xl mx-auto">
                From Sydney to Perth, we cover properties across Australia's most populous metropolitan areas and regional centers.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {australianCities.map((city, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div
                  className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                >
                  <div className="aspect-[4/3] relative bg-gray-200">
                    <img
                      src={city.image}
                      alt={`${city.name} skyline`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&q=80`
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-green/90 via-dark-green/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold mb-1">{city.name}</h3>
                    <p className="text-primary-300 text-sm font-medium">{city.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Expertise */}
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <ScrollReveal>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Our Expertise
                </span>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-dark-green mb-6 leading-tight">
                  Built by Experts,
                  <span className="text-primary-500"> For Everyone</span>
                </h2>
                
                <p className="text-lg text-muted-600 mb-8 leading-relaxed">
                  Our platform is built by a diverse team of industry veterans, data scientists, and technologists who share a passion for making property data accessible.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {expertise.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-green mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Image */}
            <ScrollReveal delay={0.2}>
              <div
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
                    alt="Modern Australian architecture"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-green/20 to-transparent" />
                </div>
                {/* Floating Card */}
                <div
                  className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 md:-left-12 bg-white rounded-2xl p-4 sm:p-6 shadow-xl max-w-xs"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-dark-green">Verified Data</p>
                      <p className="text-sm text-muted-600">From official sources</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-600 mt-2">98% Data Accuracy</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-dark-green relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-white mb-6">
                Ready to Discover Your Property's Value?
              </h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Join Australians who trust Kindred for their property research. Get instant access to comprehensive property data and market insights—completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="btn px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 bg-white text-dark-green hover:bg-gray-100 transition-colors rounded-full shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Searching Now
                </Link>
                <Link
                  to="/contact"
                  className="btn px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 hover:bg-white/10 transition-colors rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}

export default About
