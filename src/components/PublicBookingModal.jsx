import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatBDT } from '../utils/formatters';
import { X, Calendar, Clock, User, Mail, Phone, Users, CheckCircle2, MapPin } from 'lucide-react';
import './PublicBookingModal.css';

const PublicBookingModal = ({ service, isOpen, onClose }) => {
  const { addBooking } = useAdmin();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('18:00');
  const [seats, setSeats] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  const totalPrice = Number(service.price || 0) * Number(seats || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!customerName.trim()) newErrors.customerName = 'Name is required';
    if (!customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    if (!bookingDate) newErrors.bookingDate = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const bookingData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim() || '+880 1700-000000',
      serviceId: service.id,
      serviceName: service.name || service.title,
      bookingDate,
      bookingTime,
      seats: Number(seats),
      totalPrice: totalPrice,
      paymentStatus: 'Paid',
      bookingStatus: 'Pending'
    };

    const created = await addBooking(bookingData);
    setIsSubmitting(false);
    
    if (created) {
      setConfirmedBooking(created);
    } else {
      setErrors({ global: 'Failed to create booking. Please try again.' });
    }
  };

  const handleCloseModal = () => {
    setConfirmedBooking(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSeats(1);
    setErrors({});
    onClose();
  };

  return (
    <div className="public-modal-overlay" onClick={handleCloseModal}>
      <div className="public-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="public-modal-close" onClick={handleCloseModal} aria-label="Close modal">
          <X size={20} />
        </button>

        {confirmedBooking ? (
          <div className="booking-success-view">
            <div className="success-icon-badge">
              <CheckCircle2 size={42} />
            </div>
            <h3>Reservation Confirmed!</h3>
            <p className="success-subtext">
              Thank you, <strong>{customerName}</strong>! Your booking for{' '}
              <strong>{service.name || service.title}</strong> has been successfully placed.
            </p>

            <div className="summary-box">
              <div className="summary-row">
                <span>Service:</span>
                <strong>{service.name || service.title}</strong>
              </div>
              <div className="summary-row">
                <span>Date & Time:</span>
                <strong>{bookingDate} at {bookingTime}</strong>
              </div>
              <div className="summary-row">
                <span>Seats Reserved:</span>
                <strong>{seats} Person(s)</strong>
              </div>
              <div className="summary-row highlight">
                <span>Total Amount:</span>
                <strong>{formatBDT(totalPrice)}</strong>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleCloseModal}>
              Done & Return to Website
            </button>
          </div>
        ) : (
          <div className="booking-form-view">
            <div className="modal-service-header">
              <div className="service-badge-pill">{service.category}</div>
              <h2>Reserve {service.name || service.title}</h2>
              <p className="service-loc font-medium">
                <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {service.location} • {formatBDT(service.price)} {service.unit || ''}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="public-booking-form">
              {errors.global && <div className="error-msg global-error">{errors.global}</div>}
              <div className="form-group">
                <label className="form-label required">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    placeholder="Enter your full name..."
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                    }}
                    className={`form-control ${errors.customerName ? 'is-invalid' : ''}`}
                  />
                </div>
                {errors.customerName && <span className="error-msg">{errors.customerName}</span>}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (errors.customerEmail) setErrors((prev) => ({ ...prev, customerEmail: '' }));
                      }}
                      className={`form-control ${errors.customerEmail ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.customerEmail && <span className="error-msg">{errors.customerEmail}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input
                      type="text"
                      placeholder="+880 1700-000000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label required">Reservation Date</label>
                  <div className="input-with-icon">
                    <Calendar size={18} className="field-icon" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <div className="input-with-icon">
                    <Clock size={18} className="field-icon" />
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="form-control"
                    >
                      <option value="10:00">10:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                      <option value="20:00">08:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guests / Seats</label>
                  <div className="input-with-icon">
                    <Users size={18} className="field-icon" />
                    <input
                      type="number"
                      min="1"
                      max={service.availableSeats || 20}
                      value={seats}
                      onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-price-footer">
                <div className="calculated-price">
                  <span className="price-label">Total Payment</span>
                  <span className="price-val font-extrabold">{formatBDT(totalPrice)}</span>
                </div>
                <button type="submit" className="btn btn-primary submit-booking-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Confirming...' : 'Confirm & Book Now'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBookingModal;
