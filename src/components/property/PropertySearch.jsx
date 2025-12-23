import { useState, useEffect, useRef } from 'react'
import { MapPin, X, Clock, Loader2, Home as HomeIcon, Building2, AlertCircle, Hash } from 'lucide-react'
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
  const [maxDropdownHeight, setMaxDropdownHeight] = useState(400)
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

  // Dynamic height calculation
  useEffect(() => {
    const calculateMaxHeight = () => {
      if (typeof window === 'undefined' || !searchRef.current) return

      const searchRect = searchRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const searchBottom = searchRect.bottom
      const searchTop = searchRect.top

      // Check if search box is in the lower part of viewport (likely footer)
      const isNearBottom = searchBottom > viewportHeight * 0.7

      // Calculate available space below the search input
      // Reserve space for: dropdown padding (20px), footer (40px), and bottom margin (68px)
      const reservedSpace = 128
      const availableHeight = viewportHeight - searchBottom - reservedSpace

      // Set min height of 200px and max based on position
      // Footer searches get smaller max height to prevent page scroll
      const maxHeight = isNearBottom ? 300 : 500
      const calculatedHeight = Math.max(200, Math.min(availableHeight, maxHeight))

      setMaxDropdownHeight(calculatedHeight)
    }

    // Calculate on mount and when results change
    calculateMaxHeight()

    // Recalculate on window resize
    window.addEventListener('resize', calculateMaxHeight)
    return () => window.removeEventListener('resize', calculateMaxHeight)
  }, [showResults, results.length])

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
          className={`flex md:flex-row flex-col rounded-lg overflow-hidden transition-all ${validationError
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200'
            : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-primary-200'
            }`}
        >
          <div className="flex-1 relative">
            {/* Map/Address Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <MapPin className="w-5 h-5 text-muted-600" strokeWidth={1.5} />
            </div>
            {/* Clear Button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 text-muted-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
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
              placeholder="Start typing to find your address..."
              className={`w-full h-12 text-sm pl-12 pr-12 bg-white border-0 focus:outline-none focus:ring-0 placeholder:text-muted-500 placeholder:truncate ${validationError ? 'text-red-600' : 'text-gray-900'
                }`}
              aria-label="Search Australian property address"
              aria-invalid={validationError ? 'true' : 'false'}
              aria-describedby={validationError ? 'search-error' : 'search-help'}
            />
          </div>
          <div
            onClick={handleSubmit}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-4 h-12 text-base font-medium whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            aria-label="Get Instant Property Estimate"
          >
            <span>Get Instant Property Estimate</span>
          </div>
        </div>
      </form>

      {/* Recent Searches Dropdown - Outside flex container */}
      {showRecentSearches && query.trim().length === 0 && recentSearches.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 top-full left-0 right-0 mt-[6px] bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
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
                <li key={`${recentSearch.term}-${index}`}>
                  <button
                    type="button"
                    onClick={() => handleRecentSearchClick(recentSearch)}
                    className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-600 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-sm text-gray-900">{recentSearch.term}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown - Outside flex container */}
      {showResults &&
        (results.length > 0 || isLoading) &&
        query.trim().length >= 1 && (
          <div
            ref={resultsRef}
            className="absolute z-50 top-full left-0 right-0 mt-[6px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center text-muted-600 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div>
                {/* Header with building icon and count - Light gray background */}
                <div className="px-3 py-1.5 bg-gray-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-dark-green" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-dark-green">
                    {results.length} {results.length === 1 ? 'Property' : 'Properties'} Found
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="ml-auto text-xs text-muted-500 hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" strokeWidth={1.5} />
                    Clear
                  </button>
                </div>
                {/* Results list with dividers */}
                <ul
                  className="divide-y divide-gray-100 overflow-y-auto min-h-[100px]"
                  style={{ maxHeight: `${maxDropdownHeight}px` }}
                >
                  {results.map((property, index) => (
                    <li key={property.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(property)}
                        className="w-full text-left px-3 py-1.5 landscape:py-1 md:landscape:py-1.5 hover:bg-primary-50/60 transition-colors group flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-dark-green truncate group-hover:text-primary-600 transition-colors mb-0.5">
                            {property.shortAddress}
                          </div>
                          <div className="text-[11px] text-muted-500 truncate">
                            {property.suburb}, {property.state} {property.postcode}
                          </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors ml-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                {/* Footer text */}
                {results.length > 5 && (
                  <div className="px-4 py-2 text-center text-xs text-muted-400 bg-white">
                    Scroll to see more results
                  </div>
                )}
              </div>
            ) : query.trim().length >= 1 ? (
              <div className="p-4 text-center text-muted-600">
                <p className="text-sm">No properties found matching "{query.trim()}"</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : null}
          </div>
        )}


      {/* Validation Error */}
      {validationError && (
        <div
          id="search-error"
          className="mt-1.5 inline-flex items-center gap-1 text-xs text-red-600 bg-white px-2 py-1 rounded shadow-sm"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
          <span>{validationError}</span>
        </div>
      )}

    </div>
  )
}

export default PropertySearch

