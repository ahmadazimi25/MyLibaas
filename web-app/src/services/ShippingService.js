import { db } from '../firebase/config';
import axios from 'axios';

class ShippingService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_SHIPPING_API_URL;
    this.apiKey = process.env.REACT_APP_SHIPPING_API_KEY;
    
    // Supported carriers
    this.carriers = {
      USPS: 'usps',
      UPS: 'ups',
      FEDEX: 'fedex',
      DHL: 'dhl',
      CANADA_POST: 'canada_post'
    };
  }

  async createShippingLabel(bookingData) {
    try {
      const { 
        bookingId,
        fromAddress,
        toAddress,
        items,
        carrier = this.carriers.CANADA_POST,
        service = 'ground'
      } = bookingData;

      // Calculate package dimensions based on items
      const packageDetails = this.calculatePackageDetails(items);

      // Create shipment request
      const shipment = {
        carrier,
        service,
        from_address: this.formatAddress(fromAddress),
        to_address: this.formatAddress(toAddress),
        parcel: {
          length: packageDetails.length,
          width: packageDetails.width,
          height: packageDetails.height,
          weight: packageDetails.weight,
          distance_unit: 'cm',
          mass_unit: 'kg'
        },
        customs_info: this.getCustomsInfo(items)
      };

      // Create shipping label through API
      const response = await axios.post(`${this.apiUrl}/shipping/labels`, shipment, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Store shipping details in database
      await this.saveShippingDetails(bookingId, {
        labelUrl: response.data.label_url,
        trackingNumber: response.data.tracking_number,
        carrier,
        service,
        status: 'label_created',
        created: new Date(),
        estimatedDelivery: response.data.estimated_delivery_date
      });

      return {
        success: true,
        labelUrl: response.data.label_url,
        trackingNumber: response.data.tracking_number,
        estimatedDelivery: response.data.estimated_delivery_date
      };
    } catch (error) {
      console.error('Error creating shipping label:', error);
      throw error;
    }
  }

  async getShippingRates(fromAddress, toAddress, items) {
    try {
      const packageDetails = this.calculatePackageDetails(items);

      const request = {
        from_address: this.formatAddress(fromAddress),
        to_address: this.formatAddress(toAddress),
        parcel: {
          length: packageDetails.length,
          width: packageDetails.width,
          height: packageDetails.height,
          weight: packageDetails.weight,
          distance_unit: 'cm',
          mass_unit: 'kg'
        }
      };

      const response = await axios.post(`${this.apiUrl}/shipping/rates`, request, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.rates.map(rate => ({
        carrier: rate.carrier,
        service: rate.service,
        rate: rate.rate,
        currency: rate.currency,
        estimatedDays: rate.estimated_days,
        guaranteedDelivery: rate.guaranteed_delivery
      }));
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw error;
    }
  }

  async trackShipment(trackingNumber, carrier) {
    try {
      const response = await axios.get(`${this.apiUrl}/tracking/${carrier}/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        status: response.data.status,
        estimatedDelivery: response.data.estimated_delivery_date,
        currentLocation: response.data.current_location,
        events: response.data.tracking_events
      };
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  }

  calculatePackageDetails(items) {
    // Calculate package dimensions based on items
    // This is a simplified version - you might want to make this more sophisticated
    return {
      length: 30, // cm
      width: 20,  // cm
      height: 10, // cm
      weight: 1   // kg
    };
  }

  formatAddress(address) {
    return {
      name: address.name,
      company: address.company,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
      email: address.email
    };
  }

  getCustomsInfo(items) {
    // Add customs information for international shipments
    return {
      customs_certify: true,
      customs_signer: 'MyLibaas Shipping',
      contents_type: 'merchandise',
      contents_explanation: 'Clothing rental items',
      restriction_type: 'none',
      eel_pfc: 'NOEEI 30.37(a)',
      customs_items: items.map(item => ({
        description: item.name,
        quantity: 1,
        weight: 0.5,
        value: item.value,
        currency: 'CAD',
        origin_country: 'CA'
      }))
    };
  }

  async saveShippingDetails(bookingId, shippingDetails) {
    try {
      await db.collection('bookings').doc(bookingId).update({
        shipping: shippingDetails
      });

      // Also save to shipping history
      await db.collection('shipping_history').add({
        bookingId,
        ...shippingDetails
      });
    } catch (error) {
      console.error('Error saving shipping details:', error);
      throw error;
    }
  }

  async getReturnLabel(bookingId) {
    try {
      const booking = await db.collection('bookings').doc(bookingId).get();
      const bookingData = booking.data();

      // Swap from and to addresses for return shipping
      return this.createShippingLabel({
        bookingId,
        fromAddress: bookingData.shipping.to_address,
        toAddress: bookingData.shipping.from_address,
        items: bookingData.items,
        carrier: bookingData.shipping.carrier,
        service: 'ground'
      });
    } catch (error) {
      console.error('Error creating return label:', error);
      throw error;
    }
  }
}

export default new ShippingService();
