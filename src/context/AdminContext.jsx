import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_FEEDBACK,
  INITIAL_SETTINGS
} from '../data/adminData';

const AdminContext = createContext();

const STORAGE_KEYS = {
  SERVICES: 'sb_admin_services_v1',
  BOOKINGS: 'sb_admin_bookings_v1',
  FEEDBACK: 'sb_admin_feedback_v1',
  SETTINGS: 'sb_admin_settings_v1',
  THEME: 'sb_admin_theme_v1',
  AUTH: 'sb_admin_auth_v1'
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AdminProvider = ({ children }) => {
  // Services State
  const [services, setServices] = useState([]);

  // Bookings State
  const [bookings, setBookings] = useState([]);

  // Feedback State
  const [feedback, setFeedback] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
    } catch (e) {
      return INITIAL_FEEDBACK;
    }
  });

  // Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  });

  // Theme State ('light' | 'dark')
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Admin Password Auth State ('booking123')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const loginAdmin = (password) => {
    if (password === 'booking123') {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      } catch (e) {}
      addToast('Admin Dashboard unlocked successfully!', 'success');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {}
    addToast('Admin Dashboard locked.', 'info');
  };

  // Active View: 'website' | 'admin'
  const [currentView, setCurrentView] = useState('website');

  // Active Admin Page: 'dashboard' | 'services' | 'bookings' | 'feedback' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Public frontend state
  const [publicCategoryFilter, setPublicCategoryFilter] = useState('All');

  // Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Fetch initial data from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, bookingsRes] = await Promise.all([
          fetch(`${API_URL}/api/services`),
          fetch(`${API_URL}/api/bookings`)
        ]);
        
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          // Map _id to id for compatibility with existing UI
          setServices(servicesData.map(s => ({ ...s, id: s._id })));
        }
        
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.map(b => ({ ...b, id: b._id })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Sync to local storage
  // Local storage for services and bookings is disabled as we use MongoDB
  // useEffect(() => {
  //   try {
  //     localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  //   } catch (e) {}
  // }, [services]);

  // useEffect(() => {
  //   try {
  //     localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  //   } catch (e) {}
  // }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedback));
    } catch (e) {}
  }, [feedback]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, themeMode);
    } catch (e) {}

    if (themeMode === 'dark') {
      document.body.classList.add('admin-dark-mode');
    } else {
      document.body.classList.remove('admin-dark-mode');
    }
  }, [themeMode]);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- CRUD ACTIONS FOR SERVICES ---
  const addService = async (newServiceData) => {
    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newServiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to save service to database');
      }

      const savedService = await response.json();
      
      const serviceForState = {
        ...savedService,
        id: savedService._id || `SRV-${100 + services.length + 1}`,
      };

      setServices((prev) => [serviceForState, ...prev]);
      addToast(`Service "${serviceForState.name}" created successfully!`, 'success');
      return serviceForState;
    } catch (error) {
      console.error('Error adding service:', error);
      addToast(`Error: ${error.message}`, 'error');
      return null;
    }
  };

  const updateService = (id, updatedFields) => {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    addToast(`Service updated successfully!`, 'success');
  };

  const deleteService = (id) => {
    const target = services.find((s) => s.id === id);
    setServices((prev) => prev.filter((item) => item.id !== id));
    addToast(`Service "${target?.name || id}" deleted.`, 'info');
  };

  // --- CRUD ACTIONS FOR BOOKINGS ---
  const addBooking = async (bookingData) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        })
      });

      if (!response.ok) throw new Error('Failed to create booking');

      const savedBooking = await response.json();
      const bookingForState = { ...savedBooking, id: savedBooking._id };

      setBookings((prev) => [bookingForState, ...prev]);
      addToast(`Booking created successfully!`, 'success');
      return bookingForState;
    } catch (error) {
      console.error('Error adding booking:', error);
      addToast(`Error: ${error.message}`, 'error');
      return null;
    }
  };

  const updateBookingStatus = async (id, newBookingStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newBookingStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, bookingStatus: newBookingStatus } : item
        )
      );
      addToast(`Booking status changed to ${newBookingStatus}.`, 'success');
    } catch (error) {
      console.error('Error updating booking status:', error);
      addToast(`Error: ${error.message}`, 'error');
    }
  };

  const deleteBooking = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      setBookings((prev) => prev.filter((item) => item.id !== id));
      addToast(`Booking removed.`, 'info');
    } catch (error) {
      console.error('Error deleting booking:', error);
      addToast(`Error: ${error.message}`, 'error');
    }
  };

  // --- CRUD ACTIONS FOR FEEDBACK ---
  const toggleFeedbackVisibility = (id) => {
    setFeedback((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === 'Displayed' ? 'Hidden' : 'Displayed';
          addToast(`Feedback visibility changed to ${newStatus}.`, 'info');
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const deleteFeedback = (id) => {
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    addToast(`Feedback entry deleted.`, 'info');
  };

  // --- SETTINGS ACTIONS ---
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    addToast('Admin settings saved successfully!', 'success');
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AdminContext.Provider
      value={{
        services,
        bookings,
        feedback,
        settings,
        themeMode,
        setThemeMode,
        toggleTheme,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        currentView,
        setCurrentView,
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        publicCategoryFilter,
        setPublicCategoryFilter,
        toasts,
        addToast,
        removeToast,
        addService,
        updateService,
        deleteService,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        toggleFeedbackVisibility,
        deleteFeedback,
        updateSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
