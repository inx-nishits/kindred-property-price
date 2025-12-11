import { motion } from 'framer-motion'

/**
 * Component that blurs content until unlocked
 */
function BlurredContent({ isLocked, onUnlock, children, className = '' }) {
  if (!isLocked) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative min-h-[200px] ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm select-none pointer-events-none opacity-60 min-h-[200px]">
        {children}
      </div>

      {/* Overlay with view more button - Fixed position */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-lg min-h-[200px]">
        <motion.button
          onClick={onUnlock}
          className="flex flex-col items-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-xl shadow-lg hover:bg-primary-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="font-semibold text-sm">View More</span>
        </motion.button>
      </div>
    </div>
  )
}

export default BlurredContent

