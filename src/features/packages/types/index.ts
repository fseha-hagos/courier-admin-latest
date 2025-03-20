// Type for Label, matching the Prisma schema for PackageLabel
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

// Type for Delivery, based on the Prisma schema
export interface Delivery {
    id: string;
    packageId: string;
    deliveryPersonId: string;
    vehicleId: string;
    status: DeliveryStatus;
    pickupTime?: string;
    deliveryTime?: string;
    currentLocationId?: string;
    currentLocation?: string;
    deliveryPerson?: {
        id: string;
        name: string;
        phoneNumber: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: string;
        updatedAt: string;
        phoneNumberVerified: boolean;
        role: string;
        banned: boolean;
        banReason: string | null;
        banExpires: string | null;
        status: string;
        averageRating: number;
        completedDeliveries: number;
        failedDeliveries: number;
    };
}
