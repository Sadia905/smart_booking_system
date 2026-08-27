import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const { loginAdmin, setCurrentView } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the password');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const success = loginAdmin(password);
      if (!success) {
        setErrorMsg('Incorrect password. Access denied.');
        setIsSubmitting(false);
      }
    }, 200);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-bg-shape shape-a"></div>
      <div className="login-bg-shape shape-b"></div>

      <div className="login-card-container">
        <button
          className="back-website-btn"
          onClick={() => setCurrentView('website')}
        >
          <ArrowLeft size={16} /> Back to Live Website
        </button>

        <div className="login-header">
          <div className="lock-icon-badge">
            <ShieldCheck size={28} />
          </div>
          <h2>SBS Admin Security</h2>
          <p>Please enter your access password to open the admin panel.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Admin Password
            </label>
            <div className="password-input-wrapper">
              <KeyRound size={18} className="input-left-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`form-control ${errorMsg ? 'is-invalid' : ''}`}
                autoFocus
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errorMsg && <span className="error-msg">{errorMsg}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={isSubmitting}
          >
            <Lock size={16} />
            <span>{isSubmitting ? 'Authenticating...' : 'Unlock Dashboard'}</span>
          </button>
        </form>

        <div className="login-footer">
          <span className="hint-tag">Protected Admin Area • SBS Admin</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
