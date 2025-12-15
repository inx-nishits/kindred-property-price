import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageTransition from '../animations/PageTransition'

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}

export default Layout

