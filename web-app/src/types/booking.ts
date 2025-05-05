export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BookingPrice {
  rentalFee: number;
  securityDeposit: number;
  serviceFee: number;
  total: number;
}

export interface Booking {
  id: string;
  listingId: string;
  renterId: string;
  lenderId: string;
  dateRange: DateRange;
  status: BookingStatus;
  price: BookingPrice;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  created: Date;
  updated: Date;
  notes?: string;
}

export interface BookingAvailability {
  listingId: string;
  unavailableDates: DateRange[];
  minimumRentalDays: number;
  maximumRentalDays: number;
  advanceBookingDays: number;
  instantBooking: boolean;
}
