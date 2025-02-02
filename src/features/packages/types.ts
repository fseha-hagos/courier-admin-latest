export interface Location {
  id: string;
  placeId: string;
  address: string;
  name?: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum LocationType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  WAYPOINT = 'WAYPOINT'
}

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DECLINED = 'DECLINED'
}

export interface PackageLabel {
  id: string;
  value: string;
  label: string;
}

export interface LocationHistory {
  id: string;
  packageId: string;
  locationId: string;
  timestamp: Date;
  status: string;
  currentLat?: number;
  currentLng?: number;
}

export interface Package {
  id: string;
  customerId: string;
  description: string;
  weight: number;
  pickupLocationId: string;
  deliveryLocationId: string;
  createdAt: Date;
  updatedAt: Date;
  pickupLocation: Location;
  deliveryLocation: Location;
  delivery?: {
    id: string;
    status: DeliveryStatus;
    deliveryPersonId: string;
    pickupTime?: Date;
    deliveryTime?: Date;
  };
  labels: PackageLabel[];
  locationHistory: LocationHistory[];
}

export interface PaginationResponse {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
} 