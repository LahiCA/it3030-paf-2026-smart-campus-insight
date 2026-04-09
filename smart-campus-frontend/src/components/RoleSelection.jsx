import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import { useAuth } from '../../../frontend/src/context/AuthContext';
import { completeProfile } from '../../../frontend/src/services/auth';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuthenticated } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    {
      id: 'LECTURER',
      title: 'Lecturer',
      description: 'I am a lecturer at the university. I need to manage bookings, oversee facilities, and coordinate with students.',
      icon: <FaChalkboardTeacher size={40} />,
      color: '#3b82f6',
    },
    {
      id: 'TECHNICIAN',
      title: 'Technician',
      description: 'I am a technician responsible for maintaining campus facilities, equipment, and infrastructure.',
      icon: <FaGraduationCap size={40} />,
      color: '#8b5cf6',
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    try {
      const result = await completeProfile(selectedRole);

      if (result.success) {
        // Update the auth context with the new role
        setUser({
          ...user,
          role: selectedRole,
          displayId: result.user?.displayId,
          firstLogin: false,
        });
        setIsAuthenticated(true);

        // Navigate directly to the role-specific dashboard
        if (selectedRole === 'LECTURER') {
          navigate('/lecturer-dashboard', { replace: true });
        } else if (selectedRole === 'TECHNICIAN') {
          navigate('/technician-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.message || 'Failed to set role. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-bg">
        <div className="role-bg-orb role-bg-orb--one"></div>
        <div className="role-bg-orb role-bg-orb--two"></div>
      </div>

      <div className="role-selection-container">
        <div className="role-selection-card">
          <div className="role-header">
            <div className="role-logo">🎓</div>
            <h1>Welcome to Smart Campus</h1>
            <p className="role-subtitle">
              Hi <strong>{user?.name || user?.email || 'there'}</strong>! Tell us your role to personalize your experience.
            </p>
          </div>

          {error && (
            <div className="role-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="role-options">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`role-option ${selectedRole === role.id ? 'role-option--selected' : ''}`}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  '--role-color': role.color,
                }}
              >
                <div className="role-option__icon" style={{ color: role.color }}>
                  {role.icon}
                </div>
                <div className="role-option__content">
                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                </div>
                <div className="role-option__check">
                  {selectedRole === role.id && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill={role.color} />
                      <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            className="role-continue-btn"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </button>

          <p className="role-note">
            Your role can be changed later by an administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
