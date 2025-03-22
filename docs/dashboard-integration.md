# Dashboard Integration Guide

## API Endpoints

### 1. Dashboard Statistics
**Endpoint:** `GET /api/dashboard/stats`
**Authentication:** Bearer token required
**Response:**
```json
{
  "success": true,
  "stats": {
    "totalActiveDeliveries": number,
    "totalPackagesToday": number,
    "activeDeliveryPersons": number,
    "successRate": number,
    "recentDeliveries": [
      {
        "id": string,
        "customerName": string,
        "customerPhone": string,
        "deliveryStatus": "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
        "updatedAt": string
      }
    ],
    "topDeliveryPersons": [
      {
        "id": string,
        "name": string,
        "phoneNumber": string,
        "status": string,
        "rating": number,
        "completedDeliveries": number,
        "currentLocation": {
          "latitude": number,
          "longitude": number
        } | null,
        "vehicle": {
          "id": string,
          "type": string,
          "plateNumber": string,
          "maxWeight": number
        } | null
      }
    ]
  }
}
```

### 2. Delivery Status Breakdown
**Endpoint:** `GET /api/dashboard/delivery-status`
**Authentication:** Bearer token required
**Query Parameters:**
- `timeRange`: "today" | "week" | "month" (default: "today")
**Response:**
```json
{
  "success": true,
  "breakdown": [
    {
      "status": "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "DECLINED",
      "count": number
    }
  ]
}
```

## WebSocket Features

### Connection Setup
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Subscribe to dashboard updates
socket.emit('subscribe:dashboard');

// Unsubscribe when component unmounts
socket.emit('unsubscribe:dashboard');
```

### Available Events

1. **Dashboard Stats Update**
```typescript
socket.on('dashboard:stats_update', (data) => {
  // data: {
  //   timestamp: Date,
  //   totalActiveDeliveries: number,
  //   totalPackagesToday: number,
  //   activeDeliveryPersons: number,
  //   successRate: number
  // }
});
```

2. **New Delivery Update**
```typescript
socket.on('dashboard:delivery_update', (data) => {
  // data: {
  //   timestamp: Date,
  //   delivery: {
  //     id: string,
  //     customerName: string,
  //     customerPhone: string,
  //     deliveryStatus: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
  //     updatedAt: Date
  //   }
  // }
});
```

3. **Top Delivery Persons Update**
```typescript
socket.on('dashboard:top_delivery_persons_update', (data) => {
  // data: {
  //   timestamp: Date,
  //   deliveryPersons: [
  //     {
  //       id: string,
  //       name: string,
  //       phoneNumber: string,
  //       status: string,
  //       rating: number,
  //       completedDeliveries: number,
  //       currentLocation: {
  //         latitude: number,
  //         longitude: number
  //       } | null,
  //       vehicle: {
  //         id: string,
  //         type: string,
  //         plateNumber: string,
  //         maxWeight: number
  //       } | null
  //     }
  //   ]
  // }
});
```

### Cleanup
```typescript
// When component unmounts
const cleanup = () => {
  socket.emit('unsubscribe:dashboard');
  socket.disconnect();
};
```

## Notes
- All WebSocket events include a `timestamp` field for tracking when the update occurred
- The dashboard stats are automatically updated when there are changes
- Recent deliveries are pushed in real-time as they occur
- Top delivery persons list is updated when performance metrics change
- All endpoints require authentication via Bearer token
- WebSocket connection supports CORS and credentials

Let me know if you need any clarification or have questions about implementing these features! 