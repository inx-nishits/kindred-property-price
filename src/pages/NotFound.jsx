import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'

function NotFound() {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
      />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl md:text-8xl font-heading font-bold text-primary-500 mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-dark-green mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFound

