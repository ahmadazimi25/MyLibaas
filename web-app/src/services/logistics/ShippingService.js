import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp, getDocs, query, where } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class ShippingService {
  static SHIPPING_METHODS = {
    STANDARD: 'standard',
    EXPRESS: 'express',
    OVERNIGHT: 'overnight'
  };

  static CARRIERS = {
    FEDEX: 'fedex',
    UPS: 'ups',
    USPS: 'usps'
  };

  static SHIPMENT_STATUS = {
    PENDING: 'pending',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    RETURNED: 'returned'
  };

  static async createShipment(data) {
    try {
      const { rentalId, from, to, items, method = this.SHIPPING_METHODS.STANDARD, carrier = this.CARRIERS.FEDEX } = data;

      // Validate addresses
      await this.validateAddresses([from, to]);

      // Calculate shipping details
      const shippingDetails = await this.calculateShipping(from, to, items, method);
      const shipmentId = `SHIP_${Date.now()}`;
      const shipment = {
        id: shipmentId,
        rentalId,
        from,
        to,
        items,
        method,
        carrier,
        status: this.SHIPMENT_STATUS.PENDING,
        tracking: null,
        cost: shippingDetails.cost,
        estimatedDelivery: shippingDetails.estimatedDelivery,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        events: []
      };

      // Create shipping label
      const label = await this.generateShippingLabel(shipment);
      shipment.label = label;

      // Store shipment
      await setDoc(doc(db, 'shipments', shipmentId), shipment);

      // Notify parties
      await this.notifyShipmentCreated(shipment);

      return shipment;
    } catch (error) {
      console.error('Failed to create shipment:', error);
      throw new Error('Failed to create shipment');
    }
  }

  static async updateShipmentStatus(shipmentId, status, details = {}) {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      const update = {
        status,
        ...details,
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'shipments', shipmentId), update, { merge: true });

      // Update rental status if needed
      if (status === this.SHIPMENT_STATUS.DELIVERED) {
        await this.updateRentalStatus(shipment.rentalId, 'delivered');
      } else if (status === this.SHIPMENT_STATUS.RETURNED) {
        await this.updateRentalStatus(shipment.rentalId, 'returned');
      }

      return true;
    } catch (error) {
      console.error('Failed to update shipment status:', error);
      throw new Error('Failed to update shipment status');
    }
  }

  static async trackShipment(shipmentId) {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      if (!shipment.tracking) {
        throw new Error('No tracking information available');
      }

      const trackingInfo = await this.getCarrierTracking(shipment.carrier, shipment.tracking);

      // Update shipment if there are new events
      if (this.hasNewEvents(shipment, trackingInfo)) {
        await this.updateShipmentWithTracking(shipment, trackingInfo);
      }

      return trackingInfo;
    } catch (error) {
      console.error('Failed to track shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  static async calculateShipping(from, to, items, method) {
    // Mock shipping calculation
    const baseRate = method === this.SHIPPING_METHODS.STANDARD ? 10 : 
      method === this.SHIPPING_METHODS.EXPRESS ? 20 : 30;
    
    const itemCount = items.length;
    const cost = baseRate * itemCount;
    
    const deliveryDays = method === this.SHIPPING_METHODS.STANDARD ? 5 : 
      method === this.SHIPPING_METHODS.EXPRESS ? 2 : 1;
    
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

    return {
      cost,
      estimatedDelivery: Timestamp.fromDate(estimatedDelivery)
    };
  }

  static async handleReturn(rentalId) {
    try {
      const rental = await this.getRental(rentalId);
      if (!rental) {
        throw new Error('Rental not found');
      }

      // Create return shipment
      const returnShipment = await this.createShipment({
        rentalId,
        from: rental.shippingAddress,
        to: rental.returnAddress,
        items: rental.items,
        method: this.SHIPPING_METHODS.STANDARD,
        carrier: this.CARRIERS.FEDEX
      });

      // Update rental status
      await this.updateRentalStatus(rentalId, 'returning', {
        returnShipmentId: returnShipment.id
      });

      return returnShipment;
    } catch (error) {
      console.error('Failed to handle return:', error);
      throw new Error('Failed to handle return');
    }
  }

  static async validateAddresses(addresses) {
    // Mock address validation
    const invalidAddresses = addresses.filter(addr => 
      !addr.street || !addr.city || !addr.state || !addr.zip
    );

    if (invalidAddresses.length > 0) {
      throw new Error('Invalid addresses detected');
    }

    return true;
  }

  static async createShippingLabel(shipment) {
    try {
      const { carrier, from, to } = shipment;
      const label = await this.generateCarrierLabel(carrier, {
        from,
        to,
        shipmentId: shipment.id
      });

      return label;
    } catch (error) {
      console.error('Failed to create shipping label:', error);
      throw new Error('Failed to create shipping label');
    }
  }

  static async notifyShipmentCreated(shipment) {
    try {
      await NotificationService.sendNotification({
        type: 'shipment_created',
        shipmentId: shipment.id,
        rentalId: shipment.rentalId,
        status: shipment.status,
        estimatedDelivery: shipment.estimatedDelivery
      });
    } catch (error) {
      console.error('Failed to notify shipment creation:', error);
    }
  }

  static async getShipment(shipmentId) {
    const shipmentDoc = await getDoc(doc(db, 'shipments', shipmentId));
    return shipmentDoc.exists() ? shipmentDoc.data() : null;
  }

  static async getRental(rentalId) {
    const rentalDoc = await getDoc(doc(db, 'rentals', rentalId));
    return rentalDoc.exists() ? rentalDoc.data() : null;
  }

  static async updateRentalStatus(rentalId, status, details = {}) {
    await setDoc(doc(db, 'rentals', rentalId), {
      status,
      ...details,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }

  static async generateCarrierLabel(carrier, data) {
    // Mock carrier API integration
    return {
      url: `https://shipping-labels.example.com/${carrier}/${Date.now()}.pdf`,
      trackingNumber: `${carrier.toUpperCase()}_${Date.now()}`
    };
  }

  static async getCarrierTracking(carrier, trackingNumber) {
    // Mock carrier tracking API integration
    return {
      status: this.SHIPMENT_STATUS.IN_TRANSIT,
      events: [
        {
          status: this.SHIPMENT_STATUS.PICKED_UP,
          timestamp: Timestamp.now(),
          location: 'Warehouse',
          description: 'Package picked up'
        }
      ]
    };
  }

  static hasNewEvents(shipment, trackingInfo) {
    return trackingInfo.events.length > shipment.events.length;
  }

  static async updateShipmentWithTracking(shipment, trackingInfo) {
    await this.updateShipmentStatus(shipment.id, trackingInfo.status, {
      events: trackingInfo.events
    });
  }
}

export default ShippingService;
