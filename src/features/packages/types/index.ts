// Type for Label, matching the Prisma schema for PackageLabel
export interface Label {
    value: string;
    label: string;
}

// Type for Delivery, based on the Prisma schema
export interface Delivery {
    id: string;
    packageId: string;
    deliveryPersonId: string;
    vehicleId: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'DECLINED'; // Enum type as a union of string literals
    pickupTime?: string; // Use string for date here, could also use Date depending on how you handle it
    deliveryTime?: string;
    currentLocationId?: string;
    currentLocation?: string; // Assuming a simplified version here, you can expand based on your actual Location type
}
