import React from 'react'
import { MapPin, Bed, Bath, Car, Home, Maximize, Building2 } from 'lucide-react'

const PropertyHeader = ({ property, isUnlocked, formatLandSize }) => {
    return (
        <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" />
                Property report for
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#163331] mb-6">
                {property.address}
            </h1>
            <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-700 ${!isUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                {property.beds > 0 && (
                    <div className="flex items-center gap-2" title="Bedrooms">
                        <Bed className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                        <span className="font-medium">{property.beds} Bed</span>
                    </div>
                )}
                {property.baths > 0 && (
                    <div className="flex items-center gap-2" title="Bathrooms">
                        <Bath className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                        <span className="font-medium">{property.baths} Bath</span>
                    </div>
                )}
                {(property.parking > 0 || property.cars > 0) && (
                    <div className="flex items-center gap-2" title="Car Spaces">
                        <Car className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                        <span className="font-medium">{property.parking || property.cars} Car</span>
                    </div>
                )}
                {property.propertyType && (
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <Home className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <span>{property.propertyType}</span>
                    </div>
                )}
                {property.landSize > 0 && (
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <Maximize className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <span>{formatLandSize ? formatLandSize(property.landSize) : property.landSize}</span>
                    </div>
                )}
                {property.buildingSize > 0 && (
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <Building2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <span>{property.buildingSize} m²</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertyHeader
