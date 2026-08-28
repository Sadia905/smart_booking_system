import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true },
  seats: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Paid' },
  bookingStatus: { type: String, default: 'Pending' },
  createdAt: { type: String }
}, { collection: 'smart_booking' });

export default mongoose.model('Booking', bookingSchema);

