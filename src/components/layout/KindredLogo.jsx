import { motion } from 'framer-motion'

function KindredLogo({ className = '' }) {
  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Tree Icon - Organic deciduous tree silhouette */}
      <motion.svg
        width="42"
        height="42"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tree Trunk - wider at base, tapering upward */}
        <path
          d="M17.5 26H22.5V32C22.5 33.1046 21.6046 34 21 34H19C18.3954 34 17.5 33.1046 17.5 32V26Z"
          fill="#10b981"
        />
        {/* Main Tree Canopy - wide, full, organic shape */}
        <path
          d="M6 16C6 12.5 9 10 12.5 10C13.8 10 15 10.4 16 11C17 10.4 18.2 10 19.5 10C23 10 26 12.5 26 16C26 19.5 23 22 19.5 22C18.2 22 17 21.6 16 21C15 21.6 13.8 22 12.5 22C9 22 6 19.5 6 16Z"
          fill="#10b981"
        />
        {/* Top center canopy */}
        <path
          d="M14 8C14 6.5 15.2 5.5 16.5 5.5C17.8 5.5 19 6.5 19 8C19 9.5 17.8 10.5 16.5 10.5C15.2 10.5 14 9.5 14 8Z"
          fill="#10b981"
        />
        {/* Top left canopy extension */}
        <path
          d="M5 12C5 10.5 6.2 9.5 7.5 9.5C8.8 9.5 10 10.5 10 12C10 13.5 8.8 14.5 7.5 14.5C6.2 14.5 5 13.5 5 12Z"
          fill="#10b981"
        />
        {/* Top right canopy extension */}
        <path
          d="M30 12C30 10.5 31.2 9.5 32.5 9.5C33.8 9.5 35 10.5 35 12C35 13.5 33.8 14.5 32.5 14.5C31.2 14.5 30 13.5 30 12Z"
          fill="#10b981"
        />
        {/* Left side canopy extension */}
        <path
          d="M3 16C3 14.5 4.2 13.5 5.5 13.5C6.8 13.5 8 14.5 8 16C8 17.5 6.8 18.5 5.5 18.5C4.2 18.5 3 17.5 3 16Z"
          fill="#10b981"
        />
        {/* Right side canopy extension */}
        <path
          d="M32 16C32 14.5 33.2 13.5 34.5 13.5C35.8 13.5 37 14.5 37 16C37 17.5 35.8 18.5 34.5 18.5C33.2 18.5 32 17.5 32 16Z"
          fill="#10b981"
        />
        {/* Bottom left canopy extension */}
        <path
          d="M4 20C4 18.5 5.2 17.5 6.5 17.5C7.8 17.5 9 18.5 9 20C9 21.5 7.8 22.5 6.5 22.5C5.2 22.5 4 21.5 4 20Z"
          fill="#10b981"
        />
        {/* Bottom right canopy extension */}
        <path
          d="M31 20C31 18.5 32.2 17.5 33.5 17.5C34.8 17.5 36 18.5 36 20C36 21.5 34.8 22.5 33.5 22.5C32.2 22.5 31 21.5 31 20Z"
          fill="#10b981"
        />
      </motion.svg>

      {/* Kindred Text */}
      <motion.span
        className="text-2xl font-bold text-primary-500 tracking-tight"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Kindred
      </motion.span>
    </motion.div>
  )
}

export default KindredLogo

