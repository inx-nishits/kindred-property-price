import { Link } from 'react-router-dom'

import { BarChart3, Home as HomeIcon, MapPin, FileText, ArrowRight, Phone } from 'lucide-react'

import SEO from '../components/common/SEO'

import JourneyTree from '../assets/images/tree.webp'

import valueThumb from '../assets/images/value-thumb.svg'

import teachYou from '../assets/images/teach-you.svg'

import understandHeart from '../assets/images/understand-heart.svg'

import support from '../assets/images/suppport.svg'



function About() {

  const values = [

    {

      title: 'We value you',

      description:

        "The industry average has more than half of enquiries go unanswered. That is not good enough. We hold ourselves to responding to every enquiry, because you and your time matter.",

      icon: valueThumb,

    },

    {

      title: 'We teach you',

      description:

        'We hold a wealth of knowledge about positioning for success in real estate – and we make it a priority to share it in full, through our team, our resources and the insights inside every report.',

      icon: teachYou,

    },

    {

      title: 'We understand you',

      description:

        'We work hard to understand your unique needs, what matters most to you, and the goals behind every move, so our recommendations and pricing guidance reflect what you actually care about.',

      icon: understandHeart,

    },

    {

      title: 'We support you',

      description:

        'From selling to renting, real estate can feel overwhelming. We pair local specialists with clear, data‑backed insights so you are supported at every step and never left wondering what comes next.',

      icon: support,

    },

  ]



  const features = [

    {

      title: 'Property price estimates',

      description:

        'Instant low, mid and high value estimates powered by live market data, comparable sales and suburb performance – free every time you search.',

      icon: <BarChart3 className="w-8 h-8" strokeWidth={2} />,

    },

    {

      title: 'Comparable sales',

      description:

        'See recent sales for similar properties nearby so you can sense‑check pricing, negotiation ranges and real buyer demand.',

      icon: <HomeIcon className="w-8 h-8" strokeWidth={2} />,

    },

    {

      title: 'Suburb & market insights',

      description:

        'Dive into suburb trends, median prices, growth rates and demand indicators so every address sits inside a clear market story.',

      icon: <MapPin className="w-8 h-8" strokeWidth={2} />,

    },

    {

      title: 'Beautiful, shareable reports',

      description:

        'Unlock clean, easy‑to‑read PDF reports emailed straight to you, with all your estimates, sales and suburb data – ready to share with family, brokers or agents.',

      icon: <FileText className="w-8 h-8" strokeWidth={2} />,

    },

  ]



  const communityHighlights = [

    {

      title: 'Unwrapping compassion',

      description:

        'Kindred regularly collects for local community groups, supporting initiatives that directly help families across Moreton Bay and North Brisbane.',

    },

    {

      title: 'Practical guidance, not hype',

      description:

        'From “sell before you buy” to “renovate or buy new?”, our team focuses on honest advice that fits real‑life situations – not just market headlines.',

    },

    {

      title: 'Locals helping locals',

      description:

        'We live and work where our customers do. That means local context on every street, school catchment and pocket of the community we serve.',

    },

  ]



  return (

    <>

      <SEO

        title="About Us"

        description="Discover Kindred – a local real estate team backed by instant property price estimates, suburb insights and data‑rich reports to help you buy, sell or hold with confidence."

        keywords="about us, kindred, who we are, real estate, property prices, instant estimates, property reports, North Brisbane, Moreton Bay"

      />



      <div className="min-h-screen">

        {/* Intro Section */}

        <section className="section-spacing bg-white">

          <div className="container px-6 lg:px-8 pt-[60px] lg:pt-[120px] max-w-5xl mx-auto text-center">

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">

              About Kindred

            </h1>

            <p className="text-lg md:text-xl text-muted-600 max-w-3xl mx-auto mb-6">

              At Kindred, we started with a simple frustration: too many people feel like they&apos;re being

              <span className="italic"> sold to</span>, not <span className="italic">supported</span>.

            </p>

            <p className="text-sm text-muted-600 max-w-3xl mx-auto">

              So we built something better. A real estate experience grounded in honesty, not hype – where clear

              communication, genuine care and real results come standard, and where our digital tools give you

              bank‑grade clarity on property prices, suburb performance and what it all means for your next move.

            </p>

          </div>

        </section>



        {/* We do things differently */}

        <section className="section-spacing">

          <div className="container px-6 lg:px-8">

            <div className="rounded-3xl px-6 lg:px-8 py-12 md:py-16" style={{ backgroundColor: 'var(--green-900)' }}>

              <div className="text-center mb-10 md:mb-14">

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">

                  We do things{' '}

                  <span className="relative inline-block pb-2 md:pb-3 lg:pb-6">

                    differently

                    <svg

                      className="absolute bottom-0 left-0 w-full h-3 md:h-4 lg:h-5"

                      fill="none"

                      xmlns="http://www.w3.org/2000/svg"

                      viewBox="1.89 4.19 187.49 11.7"

                      preserveAspectRatio="none"

                      style={{ width: '100%', height: 'auto' }}

                    >

                      <path

                        fillRule="evenodd"

                        clipRule="evenodd"

                        d="M95.4142 14.2774C79.2509 12.7025 34.6058 11.6607 11.3734 15.4478C7.66859 16.0517 3.86646 14.398 2.0943 11.0889V11.0889C1.57679 10.1226 2.0935 8.92907 3.16244 8.68626C28.0014 3.04417 80.9272 3.68224 98.5286 5.39729C98.8659 5.43016 98.1906 5.36431 98.5286 5.39729C114.684 6.97382 152.543 8.19785 179.385 6.19142C183.345 5.89535 187.154 7.84824 189.114 11.3025L189.247 11.537C189.593 12.1464 189.232 12.9114 188.538 13.0111C158.795 17.2865 112.931 15.9877 95.4142 14.2774C95.0266 14.2395 95.7994 14.3149 95.4142 14.2774Z"

                        fill="#48D98E"

                      />

                    </svg>

                  </span>

                </h2>

                <p className="text-lg text-white/90 max-w-2xl mx-auto">

                  We live and work by our values, combining local agents, honest advice and modern technology to deliver

                  unmatched service, care and results.

                </p>

              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">

                {values.map((item) => (

                  <div

                    key={item.title}

                    className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-left"

                  >

                    <div className="mb-4">

                      <img

                        src={item.icon}

                        alt={item.title}

                        className="w-[54px] h-[54px] object-contain"

                        loading="lazy"

                      />

                    </div>

                    <h3 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-3">

                      {item.title}

                    </h3>

                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">{item.description}</p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>



        {/* Property insights, built around you – 3-step layout */}

        <section className="section-spacing bg-white">

          <div className="container px-6 lg:px-8">

            <div className="text-center mb-12 md:mb-16 mx-auto">

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">

                Property insights, built around you

              </h2>

              <p className="text-lg text-muted-600">

                Use Kindred&apos;s tools alongside your local agent to go from rough idea to clear, data‑backed property

                plan in just a few simple steps.

              </p>

            </div>



            <div className="max-w-full mx-auto">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                {[

                  {

                    step: '1',

                    title: 'Search any property',

                    description:

                      'Enter an address to instantly surface a property profile, including basic details and location context.',

                    icon: features[0].icon,

                  },

                  {

                    step: '2',

                    title: 'Explore the data',

                    description:

                      'Review price estimates, comparable sales and suburb insights to understand where the property sits in the market.',

                    icon: features[1].icon,

                  },

                  {

                    step: '3',

                    title: 'Unlock your report',

                    description:

                      'Have a full PDF report emailed to you so you can revisit the numbers, share them with others and plan your next move.',

                    icon: features[3].icon,

                  },

                ].map((item) => (

                  <div key={item.step} className="bg-primary-50 rounded-xl shadow-sm p-6 md:p-8 text-left">

                    <div className="w-16 h-16 mb-5 text-primary-600 flex items-center justify-start">

                      {item.icon}

                    </div>

                    <h3 className="text-lg md:text-xl font-heading font-bold text-dark-green mb-3">

                      {item.step}. {item.title}

                    </h3>

                    <p className="text-muted-600 leading-relaxed text-sm md:text-base">{item.description}</p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>



        {/* Kindred in the community */}

        <section className="section-spacing">

          <div className="container px-6 lg:px-8 max-w-6xl mx-auto">

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

              <div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-dark-green mb-4">

                  Kindred in the community

                </h2>

                <p className="text-lg text-muted-600 mb-4">

                  Our community, and every person in it, is at the heart of what we do. Real estate is more than

                  contracts and campaigns – it&apos;s about people, streets, schools and the long‑term health of the area.

                </p>

                <p className="text-base text-muted-600 mb-4">

                  Whether we&apos;re collecting for local groups, sharing practical guidance or simply being present at

                  community events, we&apos;re focused on creating long‑term value for Moreton Bay and North Brisbane

                  residents – both through our service and the digital tools they rely on.

                </p>

                <p className="text-base text-muted-600">

                  When you work with Kindred, you&apos;re not a transaction. You&apos;re part of the community we proudly

                  serve and continue to invest in.

                </p>

              </div>



              <div className="space-y-4">

                {communityHighlights.map((item) => (

                  <div key={item.title} className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-primary-100">

                    <h3 className="font-semibold text-dark-green mb-2">{item.title}</h3>

                    <p className="text-sm md:text-base text-muted-600 leading-relaxed">{item.description}</p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>



        {/* Journey CTA with tree image */}

        <section className="pb-[60px] md:pb-[80px] bg-primary-50">

          <div className="container px-6 lg:px-8 pt-[40px] md:pt-[60px] max-w-6xl mx-auto">

            <div

              className="relative rounded-[40px] md:rounded-[48px]"

              style={{ backgroundColor: 'var(--green-900)' }}

            >

              <div className="px-6 sm:px-10 lg:px-16 pt-12 md:pt-16 pb-32 md:pb-24 text-center text-white">

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold mb-4 text-white">

                  Ready to take the journey with us?

                </h2>

                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">

                  With 15+ years&apos; experience, see why thousands of North Brisbane and Moreton Bay residents continue to

                  choose Kindred – and start your journey with a free, data‑rich property price estimate in just a few clicks.

                </p>



                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                  <a

                    href="https://www.kindred.com.au/property"

                    target="_blank"

                    rel="noopener noreferrer"

                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-[color:var(--green-400)] text-[color:var(--green-900)] hover:bg-[color:var(--green-300)] transition-colors"

                  >

                    Explore our properties

                    <ArrowRight className="w-4 h-4 ml-2" />

                  </a>

                  <Link

                    to="/contact"

                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-white border border-white/50 hover:bg-white/10 transition-colors"

                  >

                    <span className="inline-flex items-center gap-2">

                      <Phone className="w-4 h-4" />

                      Contact our friendly team

                    </span>

                  </Link>

                </div>

              </div>



              <div className="pointer-events-none select-none flex justify-center">

                <img

                  src={JourneyTree}

                  alt="Kindred tree illustration"

                  className="max-w-[260px] sm:max-w-[320px] md:max-w-[380px] w-full object-contain"

                />

              </div>

            </div>

          </div>

        </section>

      </div>

    </>

  )

}



export default About

