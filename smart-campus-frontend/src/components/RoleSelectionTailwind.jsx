import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { completeProfile } from '../services/auth';

const RoleSelectionTailwind = () => {
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
      iconClass: 'text-blue-500',
      selectedClass: 'border-blue-500',
      circleClass: 'fill-blue-500',
    },
    {
      id: 'TECHNICIAN',
      title: 'Technician',
      description: 'I am a technician responsible for maintaining campus facilities, equipment, and infrastructure.',
      icon: <FaGraduationCap size={40} />,
      iconClass: 'text-violet-500',
      selectedClass: 'border-violet-500',
      circleClass: 'fill-violet-500',
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    try {
      const result = await completeProfile(selectedRole);

      if (result.success) {
        setUser({
          ...user,
          role: selectedRole,
          displayId: result.user?.displayId,
          firstLogin: false,
        });
        setIsAuthenticated(true);

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[100px] -top-[100px] h-[400px] w-[400px] rounded-full bg-teal-400/30 blur-[80px]"></div>
        <div className="absolute -bottom-[80px] -left-[80px] h-[350px] w-[350px] rounded-full bg-violet-500/30 blur-[80px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[560px]">
        <div className="rounded-[20px] border border-white/10 bg-slate-800/70 px-9 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-[20px]">
          <div className="mb-7 text-center">
            <div className="mb-3 flex justify-center text-teal-400">
              <FaGraduationCap size={48} />
            </div>
            <h1 className="mb-2 text-[1.6rem] font-bold text-slate-100">Welcome to Smart Campus</h1>
            <p className="text-[0.92rem] leading-6 text-slate-400">
              Hi <strong>{user?.name || user?.email || 'there'}</strong>! Tell us your role to personalize your experience.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-[10px] border border-red-500/30 bg-red-500/12 px-4 py-2.5 text-[0.85rem] text-red-300">
              <span>!</span> {error}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3.5">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`flex w-full items-center gap-4 rounded-[14px] border-2 px-5 py-[18px] text-left transition duration-200 ${selectedRole === role.id
                  ? `bg-slate-900/80 shadow-[0_0_20px_rgba(20,184,166,0.1)] ${role.selectedClass}`
                  : 'border-white/10 bg-slate-950/50'
                  } hover:-translate-y-px hover:bg-slate-900/70`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 ${role.iconClass}`}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-base font-semibold text-slate-100">{role.title}</h3>
                  <p className="text-[0.78rem] leading-[1.45] text-slate-400">{role.description}</p>
                </div>
                <div className="h-6 w-6 shrink-0">
                  {selectedRole === role.id && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" className={role.circleClass} />
                      <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            className="w-full rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 px-4 py-3.5 text-base font-semibold tracking-[0.01em] text-white transition duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(20,184,166,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </button>

          <p className="mt-3.5 text-center text-xs text-slate-500">
            Your role can be changed later by an administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionTailwind;
