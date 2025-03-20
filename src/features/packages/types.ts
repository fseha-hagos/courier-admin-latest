export interface Label {
  value: string;
  label: string;
}

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DECLINED = 'DECLINED'
}

export enum PackageStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum LocationType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  WAYPOINT = 'WAYPOINT'
}

export interface Location {
  id: string;
  placeId: string;
  address: string;
  name?: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Delivery {
  id: string;
  packageId: string;
  deliveryPersonId: string;
  vehicleId: string;
  pickupTime?: string;
  deliveryTime?: string;
  estimatedDeliveryTime?: string;
  currentLocationId?: string;
  currentLocation?: Location;
  status: DeliveryStatus;
  createdAt: string;
  deliveryRating?: number;
}

export interface PackagePricing {
  id: string;
  packageId: string;
  basePrice: number;
  distance: number;
  weightCharge: number;
  urgentCharge?: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageTimeline {
  id: string;
  packageId: string;
  created: string;
  assigned?: string;
  pickupReady?: string;
  pickedUp?: string;
  inTransit?: string;
  arriving?: string;
  delivered?: string;
  failed?: string;
  cancelled?: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  customerId: string;
  customer: Customer;
  description: string;
  weight: number;
  pickupLocationId: string;
  deliveryLocationId: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  status: PackageStatus;
  pricing?: PackagePricing;
  timeline?: PackageTimeline;
  delivery?: Delivery;
  labels?: Label[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface PackageResponse {
  success: boolean;
  package: Package;
}

export interface PaginationResponse {
  total: number;
  pages: number;
  page: number;
  limit: number;
} 