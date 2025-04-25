const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true,
    enum: [
      'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 
      'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]
  },
  postalCode: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(v);
      },
      message: props => `${props.value} is not a valid Canadian postal code!`
    }
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

// Create index for geospatial queries
addressSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Address', addressSchema);
