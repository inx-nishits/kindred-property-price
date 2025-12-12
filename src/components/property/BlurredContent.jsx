/**
 * Component that blurs content until unlocked
 * Now shows only blurred content without individual "View More" buttons
 * The form is handled centrally via a common modal
 */
function BlurredContent({ isLocked, children, className = '' }) {
  if (!isLocked) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="blur-md select-none pointer-events-none opacity-50">
        {children}
      </div>

      {/* Simple overlay without button - form is handled centrally */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
    </div>
  )
}

export default BlurredContent

