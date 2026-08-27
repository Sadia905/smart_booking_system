import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatBDT } from '../utils/formatters';
import PublicBookingModal from './PublicBookingModal';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import './FeaturedServices.css';

const FeaturedServices = () => {
  const { services, publicCategoryFilter, setPublicCategoryFilter } = useAdmin();
  const [selectedService, setSelectedService] = useState(null);

  const filteredServices = publicCategoryFilter === 'All' 
    ? services 
    : services.filter(s => s.category === publicCategoryFilter);

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        <div className="services-header">
          <div>
            <h2 className="services-title">
              {publicCategoryFilter === 'All' ? 'Featured Services' : `Available ${publicCategoryFilter}s`}
            </h2>
            <p className="services-subtitle">
              {publicCategoryFilter === 'All' ? 'Handpicked recommendations just for you' : `Browse our selection of ${publicCategoryFilter.toLowerCase()}s`}
            </p>
          </div>
          {publicCategoryFilter !== 'All' ? (
            <button className="btn btn-outline" onClick={() => setPublicCategoryFilter('All')}>
              Clear Filter
            </button>
          ) : (
            <button className="btn btn-outline view-all-btn">
              View All <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="services-grid">
          {filteredServices.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
              <h3>No {publicCategoryFilter}s currently available.</h3>
              <p>Please check back later or clear the filter to see other services.</p>
            </div>
          ) : (
            filteredServices.map((service) => (
            <div key={service.id} className="service-card group">
              <div className="service-image-container">
                <img
                  src={service.imageUrl || service.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                  alt={service.name || service.title}
                  className="service-image"
                />
                <div className="service-badge">
                  <Star className="star-icon" size={14} fill="currentColor" />
                  <span>{service.rating || 4.9} ({service.reviews || 120})</span>
                </div>
                <div className="category-tag text-indigo bg-indigo-light">
                  {service.category}
                </div>
              </div>

              <div className="service-content">
                <h3 className="service-title">{service.name || service.title}</h3>

                <div className="service-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{service.location}</span>
                  </div>
                </div>

                <div className="service-footer">
                  <div className="service-price">
                    <span className="price-amount">{formatBDT(service.price)}</span>
                    <span className="price-unit">{service.duration ? `/${service.duration}` : ''}</span>
                  </div>
                  <button
                    className="btn btn-primary book-btn"
                    onClick={() => setSelectedService(service)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {selectedService && (
        <PublicBookingModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </section>
  );
};

export default FeaturedServices;
