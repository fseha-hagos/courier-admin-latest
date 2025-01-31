"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Location {
  lat: number
  lng: number
  address: string
}

interface DirectionsDisplayProps {
  pickupLocation: Location | null
  deliveryLocation: Location | null
  directions: google.maps.DirectionsResult | null
}

export function DirectionsDisplay({ pickupLocation, deliveryLocation, directions }: DirectionsDisplayProps) {
  if (!pickupLocation && !deliveryLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Click on the map to select pickup and delivery locations.</p>
        </CardContent>
      </Card>
    )
  }

  if (!directions) {
    return null
  }

  const { distance, duration } = directions.routes[0].legs[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold">Total Distance: {distance?.text}</p>
        <p className="font-semibold">Estimated Time: {duration?.text}</p>
      </CardContent>
    </Card>
  )
}

