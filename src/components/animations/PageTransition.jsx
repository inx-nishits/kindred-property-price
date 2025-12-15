/**
 * PageTransition - Simple wrapper component (animations removed)
 * Just renders children normally
 */
function PageTransition({ children }) {
  return <div style={{ width: '100%' }}>{children}</div>
}

export default PageTransition

