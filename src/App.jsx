import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy load routes for code splitting
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
// const Contact = lazy(() => import('./pages/Contact')) // Hidden as per requirement
const PropertiesList = lazy(() => import('./pages/PropertiesList'))
const PropertyResult = lazy(() => import('./pages/PropertyResult'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const FAQ = lazy(() => import('./pages/FAQ'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          {/* <Route path="contact" element={<Contact />} /> */}
          <Route path="properties" element={<PropertiesList />} />
          <Route path="property/:id" element={<PropertyResult />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App

