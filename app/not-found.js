export const metadata = {
    title: 'Page Not Found | Property Insights Australia',
    description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center px-6">
                <h1 className="text-6xl font-bold text-dark-green mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    )
}
