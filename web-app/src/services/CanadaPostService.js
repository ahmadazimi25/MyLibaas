import axios from 'axios';
import { db } from '../firebase/config';

class CanadaPostService {
  constructor() {
    this.apiKey = process.env.REACT_APP_CANADA_POST_API_KEY;
    this.username = process.env.REACT_APP_CANADA_POST_USERNAME;
    this.password = process.env.REACT_APP_CANADA_POST_PASSWORD;
    this.customerNumber = process.env.REACT_APP_CANADA_POST_CUSTOMER_NUMBER;
    this.baseUrl = 'https://soa-gw.canadapost.ca/rs/ship/price'; // Production URL
  }

  async createShippingLabel(orderData) {
    try {
      const {
        fromAddress,
        toAddress,
        items,
        bookingId
      } = orderData;

      // Create shipping request XML
      const requestXML = this.createShippingRequestXML({
        fromAddress,
        toAddress,
        items,
        bookingId
      });

      // Call Canada Post API
      const response = await axios.post(
        `${this.baseUrl}/shipment`,
        requestXML,
        {
          headers: {
            'Content-Type': 'application/vnd.cpc.ship.rate-v4+xml',
            'Accept': 'application/vnd.cpc.ship.rate-v4+xml',
            'Authorization': `Basic ${Buffer.from(
              `${this.username}:${this.password}`
            ).toString('base64')}`,
            'Platform-id': this.apiKey
          }
        }
      );

      // Parse response
      const labelData = this.parseShippingResponse(response.data);

      // Save shipping details
      await this.saveShippingDetails(bookingId, {
        trackingNumber: labelData.trackingNumber,
        labelUrl: labelData.labelUrl,
        estimatedDelivery: labelData.expectedDeliveryDate,
        cost: labelData.shippingCost,
        carrier: 'Canada Post',
        status: 'label_created'
      });

      return labelData;
    } catch (error) {
      console.error('Error creating shipping label:', error);
      throw error;
    }
  }

  createShippingRequestXML(data) {
    const { fromAddress, toAddress, items } = data;
    
    // Calculate package details
    const packageDetails = this.calculatePackageDetails(items);

    return `<?xml version="1.0" encoding="UTF-8"?>
      <shipment xmlns="http://www.canadapost.ca/ws/shipment-v4">
        <delivery-spec>
          <service-code>DOM.EP</service-code>
          <sender>
            <name>${fromAddress.name}</name>
            <company>${fromAddress.company || ''}</company>
            <contact-phone>${fromAddress.phone}</contact-phone>
            <address-details>
              <address-line-1>${fromAddress.street1}</address-line-1>
              <city>${fromAddress.city}</city>
              <prov-state>${fromAddress.state}</prov-state>
              <postal-zip-code>${fromAddress.zip}</postal-zip-code>
              <country-code>CA</country-code>
            </address-details>
          </sender>
          <destination>
            <name>${toAddress.name}</name>
            <company>${toAddress.company || ''}</company>
            <contact-phone>${toAddress.phone}</contact-phone>
            <address-details>
              <address-line-1>${toAddress.street1}</address-line-1>
              <city>${toAddress.city}</city>
              <prov-state>${toAddress.state}</prov-state>
              <postal-zip-code>${toAddress.zip}</postal-zip-code>
              <country-code>CA</country-code>
            </address-details>
          </destination>
          <parcel-characteristics>
            <weight>${packageDetails.weight}</weight>
            <dimensions>
              <length>${packageDetails.length}</length>
              <width>${packageDetails.width}</width>
              <height>${packageDetails.height}</height>
            </dimensions>
          </parcel-characteristics>
          <preferences>
            <show-packing-instructions>true</show-packing-instructions>
          </preferences>
          <notification>
            <email>${toAddress.email}</email>
            <on-shipment>true</on-shipment>
            <on-exception>true</on-exception>
            <on-delivery>true</on-delivery>
          </notification>
        </delivery-spec>
      </shipment>`;
  }

  parseShippingResponse(responseXML) {
    // Parse XML response and extract relevant data
    // This is a simplified version - you'll need proper XML parsing
    return {
      trackingNumber: 'MOCK123456789CA',
      labelUrl: 'https://label-url.pdf',
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      shippingCost: 15.99
    };
  }

  async getShippingRates(fromPostal, toPostal, packageDetails) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rates`,
        {
          params: {
            originPostalCode: fromPostal,
            destinationPostalCode: toPostal,
            weight: packageDetails.weight,
            length: packageDetails.length,
            width: packageDetails.width,
            height: packageDetails.height
          },
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.username}:${this.password}`
            ).toString('base64')}`,
            'Platform-id': this.apiKey
          }
        }
      );

      return response.data.rates;
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw error;
    }
  }

  async trackShipment(trackingNumber) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/track/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.username}:${this.password}`
            ).toString('base64')}`,
            'Platform-id': this.apiKey
          }
        }
      );

      return {
        status: response.data.status,
        currentLocation: response.data.currentLocation,
        estimatedDelivery: response.data.expectedDeliveryDate,
        events: response.data.events
      };
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  }

  async createReturnLabel(bookingId) {
    try {
      const booking = await db.collection('bookings').doc(bookingId).get();
      const bookingData = booking.data();

      // Create return label by swapping addresses
      return this.createShippingLabel({
        fromAddress: bookingData.shippingAddress, // Renter's address
        toAddress: bookingData.lenderAddress,     // Lender's address
        items: bookingData.items,
        bookingId: `${bookingId}-return`
      });
    } catch (error) {
      console.error('Error creating return label:', error);
      throw error;
    }
  }

  calculatePackageDetails(items) {
    // Calculate package dimensions based on items
    return {
      weight: 2, // kg
      length: 30, // cm
      width: 20,  // cm
      height: 10  // cm
    };
  }

  async saveShippingDetails(bookingId, shippingData) {
    try {
      await db.collection('bookings').doc(bookingId).update({
        shipping: shippingData
      });

      await db.collection('shipping_history').add({
        bookingId,
        ...shippingData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving shipping details:', error);
      throw error;
    }
  }
}

export default new CanadaPostService();
