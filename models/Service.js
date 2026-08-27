import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  availableSeats: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  status: {
    type: String,
    default: 'Active',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
