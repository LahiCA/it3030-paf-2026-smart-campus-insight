import { useState, useEffect } from "react";
import { createBWBooking, getAllBWBookings } from "../api/bwBookingApi";
import { format, parseISO } from "date-fns";

function BWBookingForm() {
  const [formData, setFormData] = useState({
    userId: "",
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

  const isValidUserId = (userId) => {
    return /^USER\d{3}$/.test(userId);
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
      setErrorMessage("Invalid user ID. Use format like USER001");
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

      let possibleNames = [];
      if (formData.resourceType === "LECTURE_HALL") {
        possibleNames = ["Lecture Hall A", "Lecture Hall B", "Lecture Hall C"];
      } else if (formData.resourceType === "LAB") {
        possibleNames = ["Lab 1", "Lab 2", "Lab 3"];
      }

      let alternativesText = "";
      if (possibleNames.length > 0) {
        const available = possibleNames.filter((name) => {
          if (name === formData.resourceName) return false;
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

      setSuccessMessage(`Booking created successfully. ID: ${response.data.id}`);

      setFormData({
        userId: "",
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
      <div className="bg-white rounded-2xl shadow-lg p-8 lg:col-span-2">
        <h2 className="text-3xl font-bold text-teal-800 mb-2">
          Create Booking
        </h2>
        <p className="text-slate-500 mb-8">
          Submit a new resource booking request.
        </p>

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 text-green-700 border border-green-200 px-4 py-3">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 border border-red-200 px-4 py-3">
            {errorMessage}
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
              placeholder="e.g., USER001"
              value={formData.userId}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Example: USER001
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
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="SPORTS">Sports</option>
              <option value="STUDY_ROOM">Study Room</option>
              <option value="AUDITORIUM">Auditorium</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Resource Name */}
          <div>
            <label htmlFor="resourceName" className="block text-sm font-medium text-slate-600 mb-1">Resource Name</label>
            {formData.resourceType === "LECTURE_HALL" ? (
              <select
                id="resourceName"
                name="resourceName"
                value={formData.resourceName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
                required
              >
                <option value="">Select Lecture Hall</option>
                <option value="Lecture Hall A">Lecture Hall A</option>
                <option value="Lecture Hall B">Lecture Hall B</option>
                <option value="Lecture Hall C">Lecture Hall C</option>
              </select>
            ) : formData.resourceType === "LAB" ? (
              <select
                id="resourceName"
                name="resourceName"
                value={formData.resourceName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
                required
              >
                <option value="">Select Lab</option>
                <option value="Lab 1">Lab 1</option>
                <option value="Lab 2">Lab 2</option>
                <option value="Lab 3">Lab 3</option>
              </select>
            ) : formData.resourceType === "EQUIPMENT" ? (
              <input
                type="text"
                id="resourceName"
                name="resourceName"
                placeholder="e.g., Projector, High-end Camera"
                value={formData.resourceName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                required
              />
            ) : formData.resourceType === "OTHER" ? (
              <input
                type="text"
                id="resourceName"
                name="resourceName"
                placeholder="Please specify what you need..."
                value={formData.resourceName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                required
              />
            ) : (
              <input
                type="text"
                id="resourceName"
                name="resourceName"
                placeholder="e.g., Main Auditorium, Room 101"
                value={formData.resourceName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                required
                disabled={!formData.resourceType}
              />
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
              className="w-full border border-slate-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
            <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Expected Attendees */}
          <div>
            <label htmlFor="expectedAttendees" className="block text-sm font-medium text-slate-600 mb-1">Expected Attendees</label>
            <input
              type="number"
              id="expectedAttendees"
              name="expectedAttendees"
              placeholder="e.g., 25"
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
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
              className="w-full border border-slate-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
            <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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
              className="w-full border border-slate-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
            <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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
        <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-transform transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Submit Booking Request
          </button>

          <button
            type="button"
            onClick={() => setFormData({
              userId: "",
              resourceName: "",
              resourceType: "",
              bookingDate: "",
              startTime: "",
              endTime: "",
              purpose: "",
              expectedAttendees: "",
            })}
             className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
             </svg>
             Clear Form
          </button>
        </div>
      </form>
      </div>

      {/* Availability Calendar Sidebar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-6 lg:col-span-1 flex flex-col h-full">
        <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Availabilities
        </h3>
        
        {!formData.resourceType || !formData.bookingDate ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-10 bg-white rounded-xl border border-dashed border-slate-300 shadow-inner">
            <div className="bg-slate-50 p-4 rounded-full mb-4 shadow-sm border border-slate-100">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="font-medium text-slate-600 mb-1">No Schedule Selected</p>
            <p className="text-sm px-4">Select a Resource Type and Booking Date to view availabilities.</p>
          </div>
        ) : isLoadingSlots ? (
          <div className="flex-1 flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : bookedSlots.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 bg-white rounded-xl border border-green-200 shadow-sm">
            <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4 shadow-inner border border-green-200">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-green-700 font-bold text-lg">Fully Available!</p>
            <p className="text-sm text-green-600 mt-2 px-4 shadow-sm bg-green-50 py-1 rounded inline-block">
              No bookings for <span className="font-semibold">{formData.resourceName || formData.resourceType}</span> on {format(parseISO(formData.bookingDate), "MMM d")}.
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