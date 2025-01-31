"use client"

import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: {
    name?: string
    formatted_address?: string
    geometry?: google.maps.places.PlaceGeometry
    place_id?: string
  }) => void
  placeholder: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

export function PlaceAutocomplete({ onPlaceSelect, placeholder, bounds }: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (!inputRef.current) return

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["name", "formatted_address", "geometry", "place_id"],
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.south, bounds.west),
        new google.maps.LatLng(bounds.north, bounds.east),
      ),
      strictBounds: true,
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (place) {
        const selectedPlace = {
          name: place.name,
          formatted_address: place.formatted_address,
          geometry: place.geometry,
          place_id: place.place_id,
        }
        onPlaceSelect(selectedPlace)
      }
    })

    return () => {
      google.maps.event.clearInstanceListeners(autocompleteRef.current!)
    }
  }, [onPlaceSelect, bounds])

  return <Input ref={inputRef} type="text" placeholder={placeholder} />
}

