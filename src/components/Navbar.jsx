import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { setCurrentView } = useAdmin();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => setCurrentView('website')}>
          <span className="logo-text">SmartBooking</span>
        </div>

        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#reviews">Reviews</a></li>
        </ul>

        <div className="nav-actions">
          <button className="btn btn-primary" onClick={() => setCurrentView('admin')}>
            <ShieldCheck size={18} style={{ marginRight: '6px' }} />
            Admin Dashboard
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
