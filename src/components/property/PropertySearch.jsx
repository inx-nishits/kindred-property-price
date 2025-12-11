import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchPropertiesByQuery } from '../../services/propertyService'
import { validateAustralianAddress } from '../../utils/helpers'
import { useLocalStorage } from '../../hooks/useLocalStorage'

function PropertySearch({
  onSelectProperty,
  className = '',
  showHelpTagline = true,
  onSearchResultsChange,
  onClear,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useLocalStorage('property_recent_searches', [])
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)
  const inputRef = useRef(null)

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setShowRecentSearches(false)
    setValidationError(null)
    setHasSearched(false)
    if (onSearchResultsChange) {
      onSearchResultsChange([])
    }
    if (onClear) {
      onClear()
    }
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false)
        setShowRecentSearches(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape' && query.length > 0) {
        handleClear()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [query, onSearchResultsChange, onClear])

  useEffect(() => {
    const performSearch = async () => {
      const trimmedQuery = query.trim()
      
      // Show results for any input (real-time search)
      if (trimmedQuery.length < 1) {
        setResults([])
        setShowResults(false)
        setValidationError(null)
        if (onSearchResultsChange) {
          onSearchResultsChange([])
        }
        return
      }

      // For real-time dropdown, don't validate strictly - just search
      // Validation will only show error on form submit
      setValidationError(null)
      setIsLoading(true)
      try {
        const searchResults = await searchPropertiesByQuery(trimmedQuery)
        setResults(searchResults)
        // Show results dropdown immediately when there are matches
        setShowResults(searchResults.length > 0)
        if (onSearchResultsChange) {
          onSearchResultsChange(searchResults)
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
        setShowResults(false)
        if (onSearchResultsChange) {
          onSearchResultsChange([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Ultra-fast debounce for instant real-time feel (30ms for immediate response)
    const debounceTimer = setTimeout(performSearch, 30)
    return () => clearTimeout(debounceTimer)
  }, [query, onSearchResultsChange])

  const handleSelect = (property) => {
    setQuery(property.address)
    setShowResults(false)
    setShowRecentSearches(false)
    
    // Save to recent searches
    const searchTerm = property.address
    const updatedRecentSearches = [
      { term: searchTerm, property: property, timestamp: Date.now() },
      ...recentSearches.filter(s => s.term !== searchTerm)
    ].slice(0, 5) // Keep only last 5 searches
    setRecentSearches(updatedRecentSearches)
    
    onSelectProperty(property)
  }

  const handleRecentSearchClick = (recentSearch) => {
    setQuery(recentSearch.term)
    if (recentSearch.property) {
      handleSelect(recentSearch.property)
    } else {
      inputRef.current?.focus()
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    
    if (!trimmedQuery) {
      setValidationError('Please enter a property address')
      return
    }

    const validation = validateAustralianAddress(trimmedQuery)
    if (!validation.isValid) {
      setValidationError(validation.error)
      return
    }

    setHasSearched(true)
    if (results.length > 0) {
      handleSelect(results[0])
    } else if (trimmedQuery.length >= 3) {
      setValidationError('No properties found. Please try a different address.')
    }
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`flex rounded-lg overflow-hidden border shadow-sm focus-within:ring-2 transition-all ${
            validationError
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200'
              : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-primary-200'
          }`}
        >
          <div className="flex-1 relative">
            {/* Map/Address Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <svg
                className="w-5 h-5 text-muted-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            {/* Clear Button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 text-muted-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setValidationError(null)
                setHasSearched(false)
                // Show suggestions immediately when typing (real-time)
                if (e.target.value.trim().length >= 1) {
                  setShowResults(true)
                  setShowRecentSearches(false)
                } else {
                  setShowResults(false)
                  if (recentSearches.length > 0) {
                    setShowRecentSearches(true)
                  }
                }
              }}
              ref={inputRef}
              onFocus={() => {
                // Show results dropdown when focused if there are results
                if (results.length > 0 && query.trim().length >= 1) {
                  setShowResults(true)
                } else if (query.trim().length === 0 && recentSearches.length > 0) {
                  setShowRecentSearches(true)
                }
              }}
              placeholder="Enter property address, suburb, or postcode"
              className={`w-full text-lg py-4 pl-12 pr-12 bg-white border-0 focus:outline-none focus:ring-0 placeholder:text-muted-500 placeholder:truncate ${
                validationError ? 'text-red-600' : 'text-gray-900'
              }`}
              aria-label="Search Australian property address"
              aria-invalid={validationError ? 'true' : 'false'}
              aria-describedby={validationError ? 'search-error' : 'search-help'}
            />
            {/* Recent Searches Dropdown */}
            <AnimatePresence>
              {showRecentSearches && query.trim().length === 0 && recentSearches.length > 0 && (
                <motion.div
                  ref={resultsRef}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
                      <div className="text-xs font-semibold text-muted-600 uppercase tracking-wide">
                        Recent Searches
                      </div>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <ul className="py-1">
                      {recentSearches.map((recentSearch, index) => (
                        <motion.li
                          key={`${recentSearch.term}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <button
                            type="button"
                            onClick={() => handleRecentSearchClick(recentSearch)}
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                className="w-4 h-4 text-muted-600 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm text-gray-900">{recentSearch.term}</span>
                            </div>
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions Dropdown - positioned relative to input container */}
            <AnimatePresence>
              {showResults && (results.length > 0 || isLoading) && query.trim().length >= 1 && (
                <motion.div
                  ref={resultsRef}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-600">
                      <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2">Searching...</span>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-muted-600 uppercase tracking-wide border-b border-gray-100">
                        Matching Properties ({results.length})
                      </div>
                      <ul className="py-1">
                        {results.map((property, index) => (
                          <motion.li
                            key={property.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelect(property)}
                              className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-dark-green mb-1">
                                    {property.shortAddress}
                                  </div>
                                  <div className="text-sm text-muted-600">
                                    {property.suburb}, {property.state} {property.postcode}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-600">
                                    {property.beds > 0 && (
                                      <span>{property.beds} bed{property.beds !== 1 ? 's' : ''}</span>
                                    )}
                                    {property.baths > 0 && (
                                      <span>{property.baths} bath{property.baths !== 1 ? 's' : ''}</span>
                                    )}
                                    <span className="text-primary-600 font-medium">
                                      {property.propertyType}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm font-semibold text-dark-green">
                                    {new Intl.NumberFormat('en-AU', {
                                      style: 'currency',
                                      currency: 'AUD',
                                      maximumFractionDigits: 0,
                                    }).format(property.priceEstimate.mid)}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ) : query.trim().length >= 1 ? (
                    <div className="p-4 text-center text-muted-600">
                      <p className="text-sm">No properties found matching "{query.trim()}"</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-8 py-4 text-base font-medium whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-2 transition-colors border-l border-primary-600"
            aria-label="Search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {/* Validation Error */}
      {validationError && (
        <motion.div
          id="search-error"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* Help Tagline with Property Suggestions - Always rendered to prevent layout shift */}
      {showHelpTagline && !validationError && (
        <div
          id="search-help"
          className={`mt-4 text-sm text-muted-600 transition-all duration-200 ${
            query.trim().length > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-muted-500 mr-1">Try:</span>
            {[
              { label: '123 Collins Street, Melbourne', type: 'address' },
              { label: 'Bondi Beach', type: 'suburb' },
              { label: '4000', type: 'postcode' },
              { label: 'Surfers Paradise', type: 'suburb' },
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setQuery(suggestion.label)
                  setShowRecentSearches(false)
                  inputRef.current?.focus()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full text-xs font-medium transition-colors border border-gray-200 hover:border-primary-300"
              >
                {suggestion.type === 'address' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {suggestion.type === 'suburb' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {suggestion.type === 'postcode' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                )}
                {suggestion.label}
              </button>
            ))}
          </div>
          <p className="text-center mt-2 text-xs text-muted-500">
            Search Australian properties by address, suburb, or postcode
          </p>
        </div>
      )}

    </div>
  )
}

export default PropertySearch

