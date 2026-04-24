import { useState, useEffect } from "react";
import { createBWBooking, getAllBWBookings } from "../api/bwBookingApi";
import { format, parseISO } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { FaExclamationCircle, FaCheckCircle, FaLock } from "react-icons/fa";
import { getAllResources } from "../services/resources";

const RESOURCE_TYPES = [
  'LECTURE_HALL',
  'LAB',
  'MEETING_ROOM',
  'EQUIPMENT',
  'SPORTS',
  'STUDY_ROOM',
  'LIBRARY',
  'AUDITORIUM',
  'OTHER',
];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
  SPORTS: 'Sports',
  STUDY_ROOM: 'Study Room',
  LIBRARY: 'Library',
  AUDITORIUM: 'Auditorium',
  OTHER: 'Other',
};

const RESOURCE_NAMES_BY_TYPE = {
  LECTURE_HALL: ['Lecture Hall A', 'Lecture Hall B', 'Lecture Hall C', 'Lecture Hall D', 'Lecture Hall E'],
  LAB: ['Computer Lab A', 'Computer Lab B', 'Physics Lab', 'Chemistry Lab', 'Electronics Lab'],
  MEETING_ROOM: ['Meeting Room 1', 'Meeting Room 2', 'Meeting Room 3', 'Conference Room A', 'Conference Room B'],
  EQUIPMENT: ['Projector', 'High-end Camera', 'Microphone', 'Whiteboard', 'Laptops', 'Other'],
  SPORTS: ['Basketball Court', 'Tennis Court', 'Football Field', 'Indoor Gym', 'Swimming Pool'],
  STUDY_ROOM: ['Study Room 1', 'Study Room 2', 'Study Room 3', 'Group Study A'],
  LIBRARY: ['Main Library', 'Study Area 1', 'Study Area 2', 'Discussion Room A'],
  AUDITORIUM: ['Main Auditorium', 'Mini Auditorium'],
  OTHER: ['Cafeteria', 'Student Center', 'Medical Center', 'Parking Lot A', 'Other'],
};

const TYPE_MAX_ATTENDEES = {
  LECTURE_HALL: 250,
  LAB: 60,
  MEETING_ROOM: 40,
  EQUIPMENT: 20,
  SPORTS: 100,
  STUDY_ROOM: 20,
  LIBRARY: 180,
  AUDITORIUM: 500,
  OTHER: 120,
};

const RESOURCE_MAX_ATTENDEES = {
  'Lecture Hall A': 120,
  'Lecture Hall B': 150,
  'Lecture Hall C': 200,
  'Lecture Hall D': 220,
  'Lecture Hall E': 250,
  'Computer Lab A': 45,
  'Computer Lab B': 45,
  'Physics Lab': 35,
  'Chemistry Lab': 35,
  'Electronics Lab': 30,
  'Meeting Room 1': 12,
  'Meeting Room 2': 18,
  'Meeting Room 3': 24,
  'Conference Room A': 30,
  'Conference Room B': 40,
  Projector: 5,
  'High-end Camera': 4,
  Microphone: 25,
  Whiteboard: 10,
  Laptops: 40,
  'Basketball Court': 30,
  'Tennis Court': 8,
  'Football Field': 60,
  'Indoor Gym': 100,
  'Swimming Pool': 40,
  'Study Room 1': 8,
  'Study Room 2': 8,
  'Study Room 3': 10,
  'Group Study A': 16,
  'Main Library': 180,
  'Study Area 1': 40,
  'Study Area 2': 40,
  'Discussion Room A': 20,
  'Main Auditorium': 500,
  'Mini Auditorium': 180,
  Cafeteria: 120,
  'Student Center': 100,
  'Medical Center': 60,
  'Parking Lot A': 80,
};

/**
 
 * Main complex form for creating new resource bookings.
 * Handles validation, collision warnings, and submission to the API.
 */
function BWBookingForm() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    userId: user?.displayId || "",
    resourceName: "",
    resourceType: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [allSlotsForResource, setAllSlotsForResource] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [allResources, setAllResources] = useState([]);
  const [selectedResourceStatus, setSelectedResourceStatus] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getAllResources();
        setAllResources(data);
      } catch (err) {
        console.error("Failed to load resources for validation:", err);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (formData.resourceName) {
      const resource = allResources.find(r => r.name === formData.resourceName);
      if (resource) {
        setSelectedResourceStatus(resource);
      } else {
        setSelectedResourceStatus(null);
      }
    } else {
      setSelectedResourceStatus(null);
    }
  }, [formData.resourceName, allResources]);

  const isResourceUnavailable = selectedResourceStatus && (selectedResourceStatus.status === 'OCCUPIED' || selectedResourceStatus.status === 'MAINTENANCE');

  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!formData.resourceType || !formData.bookingDate) {
        setAllSlotsForResource([]);
        return;
      }
      
      setIsLoadingSlots(true);
      try {
        const response = await getAllBWBookings();
        const filtered = response.data.filter(
          (b) =>
            b.resourceType === formData.resourceType &&
            b.bookingDate === formData.bookingDate &&
            (b.status === "APPROVED" || b.status === "PENDING")
        );
        
        // Sort by start time
        filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        setAllSlotsForResource(filtered);
      } catch (error) {
        console.error("Failed to fetch availabilities", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailabilities();
  }, [formData.resourceType, formData.bookingDate]);

  // Derive the slots to show in the sidebar based on selection
  const bookedSlots = allSlotsForResource.filter(
    b => !formData.resourceName || b.resourceName === formData.resourceName
  );

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookingDate = formData.bookingDate ? new Date(`${formData.bookingDate}T00:00:00`) : null;

  const pastDateInvalid = Boolean(bookingDate && bookingDate < today);

  const startTimeInvalid = Boolean(
    !pastDateInvalid &&
    bookingDate &&
    bookingDate.getTime() === today.getTime() &&
    formData.startTime &&
    (() => {
      const [startHour, startMinute] = formData.startTime.split(":").map(Number);
      const startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
      return startAt <= now;
    })()
  );

  const endTimeInvalid = Boolean(
    !pastDateInvalid &&
    bookingDate &&
    bookingDate.getTime() === today.getTime() &&
    formData.endTime &&
    (() => {
      const [endHour, endMinute] = formData.endTime.split(":").map(Number);
      const endAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);
      return endAt <= now;
    })()
  );

  const timeValidationMessage = pastDateInvalid
    ? "Booking date is in the past. Please select a future date."
    : startTimeInvalid
    ? "Start time is in the past. Please select a future time."
    : endTimeInvalid
    ? "End time is in the past. Please select a future time."
    : "";

  const isPastTimeInvalid = Boolean(timeValidationMessage);

  const selectedTypeMax = formData.resourceType
    ? TYPE_MAX_ATTENDEES[formData.resourceType] ?? null
    : null;

  const selectedResourceMax = formData.resourceName
    ? RESOURCE_MAX_ATTENDEES[formData.resourceName] ?? null
    : null;

  const expectedAttendeesMax = selectedResourceMax ?? selectedTypeMax;
  const expectedAttendeesNumber = Number(formData.expectedAttendees);
  const expectedAttendeesExceedsMax = Boolean(
    expectedAttendeesMax &&
      formData.expectedAttendees &&
      !Number.isNaN(expectedAttendeesNumber) &&
      expectedAttendeesNumber > expectedAttendeesMax
  );

  const maxLabelTarget = formData.resourceName
    ? formData.resourceName
    : TYPE_LABELS[formData.resourceType] || "the selected resource";

  const resourcesForSelectedType = formData.resourceType
    ? RESOURCE_NAMES_BY_TYPE[formData.resourceType] || []
    : [];

  const isValidUserId = (userId) => {
    // Keep it valid as long as it exists (we trust displayId from auth context)
    return userId && userId.trim() !== "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "resourceType") {
        updated.resourceName = "";
      }
      return updated;
    });

    if (name === "userId") {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!isValidUserId(formData.userId)) {
      setErrorMessage("Unable to verify User ID. Please try logging in again.");
      return;
    }

    if (expectedAttendeesExceedsMax) {
      setErrorMessage(`Expected attendees cannot exceed ${expectedAttendeesMax} for ${maxLabelTarget}.`);
      return;
    }

    if (isPastTimeInvalid) {
      setErrorMessage(timeValidationMessage);
      return;
    }

    // Client-side conflict check
    const isConflicting = (start1, end1, start2, end2) => start1 < end2 && start2 < end1;
    const reqStart = formData.startTime;
    const reqEnd = formData.endTime;

    const conflicts = allSlotsForResource.filter(
      (b) =>
        b.resourceName === formData.resourceName &&
        isConflicting(reqStart, reqEnd, b.startTime, b.endTime)
    );

    if (conflicts.length > 0) {
      const approvedConflicts = conflicts.filter(c => c.status === "APPROVED");
      const pendingConflicts = conflicts.filter(c => c.status === "PENDING" || c.status === "pending");

      const possibleNames = Array.from(
        new Set([
          ...(RESOURCE_NAMES_BY_TYPE[formData.resourceType] || []),
          ...allResources
            .filter((r) => r.type === formData.resourceType)
            .map((r) => r.name),
        ])
      ).filter(
        (name) =>
          Boolean(name) &&
          name !== "Other" &&
          name !== formData.resourceName
      );

      let alternativesText = "";
      if (possibleNames.length > 0) {
        const available = possibleNames.filter((name) => {
          return !allSlotsForResource.some(
            (b) =>
              b.resourceName === name &&
              (b.status === "APPROVED" || b.status === "PENDING") &&
              isConflicting(reqStart, reqEnd, b.startTime, b.endTime)
          );
        });

        if (available.length > 0) {
          alternativesText = `Available alternatives: ${available.join(", ")}.`;
        } else {
          alternativesText = `There are no other ${formData.resourceType.toLowerCase().replace("_", " ")}s available for this time.`;
        }
      }

      if (approvedConflicts.length > 0) {
        // Block proceeding if booked and APPROVED
        setErrorMessage(
          `${formData.resourceName} is already booked for this time. ${alternativesText} Please select another resource type or time.`
        );
        return;
      } else if (pendingConflicts.length > 0) {
        // Warn and ask if it's PENDING
        const confirmMsg = `${formData.resourceName} has a PENDING request for this time.\n\n${alternativesText}\n\nDo you still want to proceed and request this time anyway?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }
    }

    try {
      const payload = {
        ...formData,
        expectedAttendees: Number(formData.expectedAttendees),
      };

      const response = await createBWBooking(payload);

      setSuccessMessage(`Your booking request for ${formData.resourceName} has been successfully submitted. An administrator will review your request and you will be notified upon approval.`);

      setFormData({
        userId: user?.displayId || "",
        resourceName: "",
        resourceType: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: "",
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create booking"
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 lg:col-span-2">
        <div className="border-b border-slate-100 pb-5 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Create Booking
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Submit a new resource booking request easily.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-teal-50 border border-teal-200 p-4 shadow-sm">
            <FaCheckCircle className="mt-0.5 h-5 w-5 text-teal-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-teal-800">Booking Successful</h3>
              <p className="mt-1 text-sm text-teal-700">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 border border-red-200 p-4 shadow-sm">
            <FaExclamationCircle className="mt-0.5 h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Booking Conflict or Error</h3>
              <div className="mt-1 flex flex-col gap-1 text-sm text-red-700 leading-relaxed">
                {errorMessage.split('. ').map((sentence, idx, arr) => {
                  if (!sentence.trim()) return null;
                  const isLast = idx === arr.length - 1 || sentence.endsWith('.');
                  const text = sentence.trim() + (isLast ? '' : '.');
                  
                  // Let's highlight alternatives
                  if (text.includes("Available alternatives:")) {
                    return <p key={idx} className="font-medium">{text}</p>;
                  }
                  
                  return <p key={idx}>{text}</p>;
                })}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


          {/* User ID */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-slate-600 mb-1">User ID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              className="w-full border border-slate-300 rounded-lg p-3 bg-slate-100 text-slate-600 cursor-not-allowed focus:outline-none transition"
              required
              readOnly
            />
            <p className="text-xs text-teal-600 mt-1 font-medium">
              Automatically fetched from your profile
            </p>
          </div>

          {/* Resource Type */}
          <div>
            <label htmlFor="resourceType" className="block text-sm font-medium text-slate-600 mb-1">Resource Type</label>
            <select
              id="resourceType"
              name="resourceType"
              value={formData.resourceType}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
              required
            >
              <option value="">Select Resource Type</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Name */}
            <div>
              <label htmlFor="resourceName" className="block text-sm font-medium text-slate-600 mb-1">Resource Name</label>
              <select
                id="resourceName"
                name="resourceName"
                value={(formData.resourceType && formData.resourceName && !RESOURCE_NAMES_BY_TYPE[formData.resourceType]?.includes(formData.resourceName)) ? 'Other' : formData.resourceName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
                required
                disabled={!formData.resourceType}
              >
                <option value="">Select Resource Name</option>
                {formData.resourceType && RESOURCE_NAMES_BY_TYPE[formData.resourceType]?.map((nameOption) => (
                  <option key={nameOption} value={nameOption}>
                    {nameOption}
                  </option>
                ))}
              </select>
              {(formData.resourceName === 'Other' || (formData.resourceType && formData.resourceName && !RESOURCE_NAMES_BY_TYPE[formData.resourceType]?.includes(formData.resourceName))) && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder={formData.resourceType === 'OTHER' ? "Please specify what you need" : "Please specify the equipment"}
                    value={formData.resourceName === 'Other' ? '' : formData.resourceName}
                    onChange={(e) => setFormData({ ...formData, resourceName: e.target.value || 'Other' })}
                    className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    required
                  />
                </div>
              )}
              {!formData.resourceType && (
                <p className="text-xs text-slate-400 mt-1">Please select a Resource Type first.</p>
              )}
            </div>

            {/* Booking Date */}
            <div className="relative">
              <label htmlFor="bookingDate" className="block text-sm font-medium text-slate-600 mb-1">Booking Date</label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className={`w-full border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 transition ${pastDateInvalid ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-teal-500"}`}
                required
              />
            <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {pastDateInvalid && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {timeValidationMessage}
              </p>
            )}
          </div>

          {/* Expected Attendees / Quantity */}
          <div>
            <label htmlFor="expectedAttendees" className="block text-sm font-medium text-slate-600 mb-1">
              {["EQUIPMENT"].includes(formData.resourceType) 
                ? "Quantity Required" 
                : formData.resourceType === "OTHER"
                ? "Expected Attendees / Quantity"
                : "Expected Attendees"}
            </label>
            <input
              type="number"
              id="expectedAttendees"
              name="expectedAttendees"
              placeholder={
                ["EQUIPMENT"].includes(formData.resourceType) 
                  ? "e.g., 2" 
                  : formData.resourceType === "OTHER"
                  ? "e.g., 25 attendees or 2 items"
                  : "e.g., 25"
              }
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              max={expectedAttendeesMax || undefined}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition ${expectedAttendeesExceedsMax ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-teal-500"}`}
              required
            />
            {expectedAttendeesMax && (
              <p className="text-xs text-teal-600 mt-1 font-medium">
                Maximum allowed for {maxLabelTarget}: {expectedAttendeesMax}
              </p>
            )}
            {expectedAttendeesExceedsMax && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                Entered value exceeds the maximum allowed ({expectedAttendeesMax}).
              </p>
            )}
          </div>

          {/* Start Time */}
          <div className="relative">
            <label htmlFor="startTime" className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 transition ${startTimeInvalid ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-teal-500"}`}
              required
            />
            <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {startTimeInvalid && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {timeValidationMessage}
              </p>
            )}
          </div>

          {/* End Time */}
          <div className="relative">
            <label htmlFor="endTime" className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 transition ${endTimeInvalid ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-teal-500"}`}
              required
            />
            <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {endTimeInvalid && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {timeValidationMessage}
              </p>
            )}
          </div>
        </div>

        {/* Purpose */}
        <div className="md:col-span-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-slate-600 mb-1">Purpose & Description</label>
          <textarea
            id="purpose"
            name="purpose"
            placeholder="Briefly describe the purpose of this booking (e.g., specific software needed, event layout)..."
            value={formData.purpose}
            onChange={handleChange}
            rows="4"
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition hover:border-teal-400"
            required
          />
        </div>

        {/* Submit & Form Action Buttons */}
        <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 pt-8 border-t border-slate-200/60">
          <button
            type="button"
            onClick={() => setFormData({
              userId: user?.displayId || "",
              resourceName: "",
              resourceType: "",
              bookingDate: "",
              startTime: "",
              endTime: "",
              purpose: "",
              expectedAttendees: "",
            })}
             className="w-full sm:w-auto bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
          >
             <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
             </svg>
             Clear Selection
          </button>
          
          <button
            type="submit"
            disabled={isResourceUnavailable || isPastTimeInvalid || expectedAttendeesExceedsMax}
            className={`w-full sm:w-auto bg-gradient-to-r px-8 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(13,148,136,0.25)] text-sm border ${(isResourceUnavailable || isPastTimeInvalid || expectedAttendeesExceedsMax) ? 'from-slate-400 to-slate-400 text-slate-200 cursor-not-allowed' : 'from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_6px_16px_rgba(13,148,136,0.35)] border-teal-500/20'}`}
          >
            {isResourceUnavailable ? <FaLock className="w-4 h-4" /> : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            )}
            Submit Request
          </button>
        </div>
      </form>
      </div>

      {/* Availability Calendar Sidebar */}
      <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-3xl shadow-lg p-6 lg:col-span-1 flex flex-col h-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 opacity-[0.04] rounded-bl-full pointer-events-none"></div>

        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 relative z-10">
          <div className="bg-teal-100/50 p-2 rounded-xl text-teal-600 shadow-sm border border-teal-100">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          Availabilities
        </h3>

        {formData.resourceType && resourcesForSelectedType.length > 0 && (
          <div className="mb-5 bg-white border border-slate-200 rounded-xl p-3 relative z-10 shadow-sm">
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">
              {TYPE_LABELS[formData.resourceType]} Resources and Max Attendance
            </p>
            <div className="max-h-36 overflow-y-auto pr-1 space-y-1">
              {resourcesForSelectedType.map((resourceName) => {
                const resourceMax = RESOURCE_MAX_ATTENDEES[resourceName] ?? selectedTypeMax;
                return (
                  <div
                    key={resourceName}
                    className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs border ${formData.resourceName === resourceName ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-100 bg-slate-50 text-slate-700"}`}
                  >
                    <span className="font-medium">{resourceName}</span>
                    <span className="font-semibold">Max {resourceMax ?? "-"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isResourceUnavailable ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-tr from-orange-50/70 to-white rounded-3xl border border-orange-200 shadow-sm relative overflow-hidden transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent pointer-events-none"></div>

            <div className="bg-orange-100/80 p-4 rounded-2xl mb-5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-orange-200 backdrop-blur-sm relative z-10">
              <FaLock className="w-10 h-10 text-orange-600" />
            </div>
            <h4 className="text-orange-800 font-extrabold text-xl tracking-tight mb-2 relative z-10">Currently Occupied</h4>
            <p className="text-[13px] leading-relaxed text-orange-700/90 font-medium max-w-[260px] px-2 relative z-10">
              {selectedResourceStatus?.description || "This resource is currently unavailable for booking."}
            </p>
          </div>
        ) : !formData.resourceType || !formData.bookingDate ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm relative z-10 transition-all hover:border-teal-200/60 duration-300">
            <div className="bg-gradient-to-tr from-slate-50 to-slate-100 p-4 rounded-2xl mb-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200">
              <svg className="w-10 h-10 text-slate-400 stroke-slate-400/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="font-semibold text-slate-700 text-lg mb-2">No Schedule Selected</p>
            <p className="text-sm leading-relaxed text-slate-500 max-w-[200px]">Select a Resource Type and Booking Date to view availabilities.</p>
          </div>
        ) : isPastTimeInvalid ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-tr from-rose-50/70 to-white rounded-3xl border border-rose-200 shadow-sm relative overflow-hidden transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent pointer-events-none"></div>

            <div className="bg-rose-100/80 p-4 rounded-2xl mb-5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-rose-200 backdrop-blur-sm relative z-10">
              <FaExclamationCircle className="w-10 h-10 text-rose-600" />
            </div>
            <h4 className="text-rose-800 font-extrabold text-xl tracking-tight mb-2 relative z-10">Cannot Book</h4>
            <p className="text-[13px] leading-relaxed text-rose-700/90 font-medium max-w-[260px] px-2 relative z-10">
              {timeValidationMessage}
            </p>
          </div>
        ) : isLoadingSlots ? (
          <div className="flex-1 flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : bookedSlots.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-tr from-emerald-50/50 to-white rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="bg-emerald-100/60 p-4 rounded-2xl mb-5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-emerald-200 backdrop-blur-sm relative z-10">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h4 className="text-emerald-800 font-extrabold text-xl tracking-tight mb-2 relative z-10">All Clear!</h4>
            <p className="text-[13px] leading-relaxed text-emerald-700/80 font-medium max-w-[240px] px-2 relative z-10">
              No bookings exist for <span className="font-bold text-emerald-900 bg-emerald-100/50 px-1 py-0.5 rounded">{formData.resourceName || formData.resourceType}</span> on {format(parseISO(formData.bookingDate), "MMM do")}.
            </p>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-teal-800">
                  {formData.resourceName || formData.resourceType}
                </p>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                  {format(parseISO(formData.bookingDate), "MMMM d, yyyy")}
                </p>
              </div>
              <div className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">
                {bookedSlots.length} Bookings
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {bookedSlots.map((slot) => (
                <div key={slot.id} className="relative flex gap-4 items-start p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${slot.status === 'APPROVED' ? 'bg-blue-500' : 'bg-amber-400'}`}></div>
                  
                  <div className={`mt-1 p-2 rounded-lg ${slot.status === 'APPROVED' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-800">
                        {slot.startTime} <span className="text-slate-400 font-normal mx-1">to</span> {slot.endTime}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        slot.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    {slot.resourceName && formData.resourceType === slot.resourceType && !formData.resourceName && (
                       <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                         <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                         {slot.resourceName}
                       </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default BWBookingForm;