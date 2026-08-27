import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import { formatBDT } from '../../../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Star
} from 'lucide-react';
import './ServicesManager.css';

const CATEGORIES = [
  'All Categories',
  'Restaurant',
  'Hotel',
  'Doctor',
  'Resort',
  'Flight',
  'Events'
];

const getDynamicFieldLabels = (category) => {
  switch (category) {
    case 'Restaurant':
      return { seats: 'Table Size (Persons)', duration: 'Reservation Duration (e.g. 2 Hours)' };
    case 'Hotel':
      return { seats: 'Guests per Room', duration: 'Check-in/Out Time (e.g. 1 Night)' };
    case 'Doctor':
      return { seats: 'Appointments per Day', duration: 'Consultation Time (e.g. 30 Mins)' };
    case 'Resort':
      return { seats: 'Max Guests per Package', duration: 'Package Duration (e.g. 3 Days)' };
    case 'Flight':
      return { seats: 'Available Tickets', duration: 'Flight Time (e.g. 5 Hours)' };
    case 'Events':
      return { seats: 'Total Tickets', duration: 'Event Duration (e.g. 4 Hours)' };
    default:
      return { seats: 'Available Seats', duration: 'Duration' };
  }
};

const getDefaultImageForCategory = (category) => {
  switch (category) {
    case 'Restaurant':
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
    case 'Hotel':
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    case 'Doctor':
      return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80';
    case 'Resort':
      return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
    case 'Flight':
      return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80';
    case 'Events':
      return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
  }
};

const INITIAL_FORM_STATE = {
  name: '',
  category: 'Restaurant',
  price: '',
  availableSeats: '',
  location: '',
  duration: '2 Hours',
  imageUrl: '',
  shortDescription: '',
  status: 'Active',
  isFeatured: false
};

const ServicesManager = () => {
  const { services, addService, updateService, deleteService, addToast } = useAdmin();

  // Mode: 'list' | 'select_category' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals
  const [viewDetailService, setViewDetailService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All Categories' || srv.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || srv.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchTerm, selectedCategory, selectedStatus]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;
  const currentServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.availableSeats || Number(formData.availableSeats) < 0)
      errors.availableSeats = 'Seat count is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.shortDescription.trim())
      errors.shortDescription = 'Service description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Category Selection for Add
  const handleOpenAddForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setEditingServiceId(null);
    setViewMode('select_category');
  };

  const selectCategoryForNewService = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setViewMode('add');
  };

  // Open Form for Edit
  const handleOpenEditForm = (srv) => {
    setFormData({
      name: srv.name || '',
      category: srv.category || 'Restaurant',
      price: srv.price || '',
      availableSeats: srv.availableSeats || '',
      location: srv.location || '',
      duration: srv.duration || '2 Hours',
      imageUrl: srv.imageUrl || '',
      shortDescription: srv.shortDescription || srv.fullDescription || '',
      status: srv.status || 'Active',
      isFeatured: !!srv.isFeatured
    });
    setFormErrors({});
    setEditingServiceId(srv.id);
    setViewMode('edit');
  };

  // Submit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please fix the validation errors in the form.', 'error');
      return;
    }

    const processedData = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      availableSeats: Number(formData.availableSeats),
      location: formData.location.trim(),
      duration: formData.duration.trim() || '2 Hours',
      imageUrl:
        formData.imageUrl.trim() ||
        getDefaultImageForCategory(formData.category),
      shortDescription: formData.shortDescription.trim(),
      fullDescription: formData.shortDescription.trim(),
      status: formData.status,
      isFeatured: formData.isFeatured
    };

    if (viewMode === 'edit' && editingServiceId) {
      updateService(editingServiceId, processedData);
      setViewMode('list');
    } else {
      const added = await addService(processedData);
      if (added) {
        setViewMode('list');
      }
    }
  };

  return (
    <div className="services-manager-page">
      {/* Top Controls Header */}
      <div className="page-section-header">
        <div>
          <h2>Services Catalog Management</h2>
          <p>Create, update, and organize all available booking experiences</p>
        </div>

        {viewMode === 'list' ? (
          <button className="btn btn-primary" onClick={handleOpenAddForm}>
            <Plus size={18} style={{ marginRight: '6px' }} />
            Add New Service
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setViewMode('list')}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            Back to Services List
          </button>
        )}
      </div>

      {/* SELECT CATEGORY VIEW */}
      {viewMode === 'select_category' && (
        <div className="admin-card-container form-card-box">
          <div className="form-box-header">
            <h3>Select Service Category</h3>
            <p>Choose the appropriate category for the new service to display relevant fields.</p>
          </div>
          <div className="categories-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', padding: '20px 0' }}>
            {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
              <button 
                key={cat} 
                className="btn btn-outline" 
                style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
                onClick={() => selectCategoryForNewService(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FORM VIEW (ADD / EDIT) */}
      {(viewMode === 'add' || viewMode === 'edit') && (
        <div className="admin-card-container form-card-box">
          <div className="form-box-header">
            <h3>{viewMode === 'edit' ? `Edit Service (${editingServiceId})` : 'Add New Service'}</h3>
            <p>Fill out the detailed service attributes and booking parameters below</p>
          </div>

          <form onSubmit={handleSubmitForm} className="service-form">
            {/* Row 1: Name & Category */}
            <div className="form-grid-2">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label required">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Meetup Table, Grand Suite, Luxury Spa"
                  className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                />
                {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Price, Available Seats, Duration, Status */}
            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-label required">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="150"
                  min="1"
                  className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                />
                {formErrors.price && <span className="error-msg">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">{getDynamicFieldLabels(formData.category).seats}</label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="0"
                  className={`form-control ${formErrors.availableSeats ? 'is-invalid' : ''}`}
                />
                {formErrors.availableSeats && (
                  <span className="error-msg">{formErrors.availableSeats}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{getDynamicFieldLabels(formData.category).duration}</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 2 Hours, Per Night"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Row 3: Location & Image URL */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label required">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Sylhet, Grand Sunset Resort"
                  className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
                />
                {formErrors.location && (
                  <span className="error-msg">{formErrors.location}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="form-control"
                />
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="form-group">
              <label className="form-label required">Service Description</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="Clear summary description of this booking service..."
                className={`form-control ${formErrors.shortDescription ? 'is-invalid' : ''}`}
              />
              {formErrors.shortDescription && (
                <span className="error-msg">{formErrors.shortDescription}</span>
              )}
            </div>

            {/* Row 5: Featured Switch */}
            <div className="form-group checkbox-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                />
                <span className="slider round"></span>
              </label>
              <span className="checkbox-label font-semibold">Highlight as Featured Service</span>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewMode('list')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={16} style={{ marginRight: '6px' }} />
                {viewMode === 'edit' ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SERVICES LIST VIEW */}
      {viewMode === 'list' && (
        <div className="admin-card-container">
          {/* Filters Bar */}
          <div className="table-filter-bar">
            <div className="search-input-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search services by name, category, location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="filter-dropdowns">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Services Table */}
          {currentServices.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Services Found"
              description="No service records matched your filter criteria."
              actionText="Reset Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setSelectedStatus('All');
              }}
            />
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available Seats</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentServices.map((srv) => (
                    <tr key={srv.id}>
                      <td>
                        <img
                          src={srv.imageUrl}
                          alt={srv.name}
                          className="service-thumb-img"
                        />
                      </td>
                      <td>
                        <div className="srv-name-cell">
                          <span className="srv-title">
                            {srv.name}
                            {srv.isFeatured && (
                              <Star size={13} className="featured-star" title="Featured" />
                            )}
                          </span>
                          <span className="srv-location">{srv.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">{srv.category}</span>
                      </td>
                      <td className="font-bold">{formatBDT(srv.price)}</td>
                      <td>{srv.availableSeats} Seats</td>
                      <td>
                        <StatusBadge status={srv.status} type="service" />
                      </td>
                      <td>{srv.createdAt || '2026-02-01'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions-cell">
                          <button
                            className="action-btn-sm btn-view"
                            onClick={() => setViewDetailService(srv)}
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="action-btn-sm btn-edit"
                            onClick={() => handleOpenEditForm(srv)}
                            title="Edit Service"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="action-btn-sm btn-delete"
                            onClick={() => setDeletingService(srv)}
                            title="Delete Service"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredServices.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(num) => {
              setItemsPerPage(num);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* SERVICE DETAIL MODAL */}
      {viewDetailService && (
        <Modal
          isOpen={!!viewDetailService}
          onClose={() => setViewDetailService(null)}
          title={`Service Overview: ${viewDetailService.name}`}
          size="lg"
        >
          <div className="service-detail-modal-body">
            <div className="modal-cover-wrapper">
              <img
                src={viewDetailService.imageUrl}
                alt={viewDetailService.name}
                className="modal-cover-img"
              />
              <div className="modal-cover-overlay">
                <span className="category-pill">{viewDetailService.category}</span>
                <StatusBadge status={viewDetailService.status} type="service" />
              </div>
            </div>

            <div className="modal-detail-content">
              <h3>{viewDetailService.name}</h3>
              <p className="detail-short">{viewDetailService.shortDescription}</p>

              <div className="detail-meta-grid">
                <div>
                  <span className="meta-lbl">Price</span>
                  <span className="meta-val font-bold">{formatBDT(viewDetailService.price)}</span>
                </div>
                <div>
                  <span className="meta-lbl">Duration</span>
                  <span className="meta-val">{viewDetailService.duration}</span>
                </div>
                <div>
                  <span className="meta-lbl">Available Seats</span>
                  <span className="meta-val">{viewDetailService.availableSeats} Seats</span>
                </div>
                <div>
                  <span className="meta-lbl">Location</span>
                  <span className="meta-val">{viewDetailService.location}</span>
                </div>
              </div>

              {viewDetailService.fullDescription && (
                <div className="detail-block">
                  <h4>Full Description</h4>
                  <p>{viewDetailService.fullDescription}</p>
                </div>
              )}

              {viewDetailService.features?.length > 0 && (
                <div className="detail-block">
                  <h4>Key Features</h4>
                  <div className="tags-flex">
                    {viewDetailService.features.map((feat, i) => (
                      <span key={i} className="chip-tag">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewDetailService.includedItems?.length > 0 && (
                <div className="detail-block">
                  <h4>What's Included</h4>
                  <ul className="check-list">
                    {viewDetailService.includedItems.map((inc, i) => (
                      <li key={i}>✓ {inc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingService && (
        <Modal
          isOpen={!!deletingService}
          onClose={() => setDeletingService(null)}
          title="Delete Service Confirmation"
          type="danger"
          confirmText="Yes, Delete Service"
          onConfirm={() => deleteService(deletingService.id)}
        >
          <p>
            Are you sure you want to delete service <strong>"{deletingService.name}"</strong>?
            This action will permanently remove it from the catalog.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default ServicesManager;
