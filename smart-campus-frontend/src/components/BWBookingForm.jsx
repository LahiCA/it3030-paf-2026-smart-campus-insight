import { useState } from "react";
import { createBWBooking } from "../api/bwBookingApi";

function BWBookingForm() {
  const [formData, setFormData] = useState({
    resourceId: "",
    userId: "",
    resourceName: "",
    resourceType: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        expectedAttendees: Number(formData.expectedAttendees),
      };

      const response = await createBWBooking(payload);

      setSuccessMessage(`Booking created successfully. ID: ${response.data.id}`);

      setFormData({
        resourceId: "",
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
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-[var(--deep-teal)] mb-2">
        Create Booking
      </h2>
      <p className="text-slate-500 mb-6">
        Submit a new resource booking request.
      </p>

      {successMessage && (
        <div className="mb-4 rounded-xl bg-green-100 text-green-700 px-4 py-3">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-3">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="resourceId"
          placeholder="Resource ID"
          value={formData.resourceId}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <input
          type="text"
          name="resourceName"
          placeholder="Resource Name"
          value={formData.resourceName}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <select
          name="resourceType"
          value={formData.resourceType}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        >
          <option value="">Select Resource Type</option>
          <option value="LAB">Lab</option>
          <option value="ROOM">Room</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <input
          type="date"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <input
          type="number"
          name="expectedAttendees"
          placeholder="Expected Attendees"
          value={formData.expectedAttendees}
          onChange={handleChange}
          min="1"
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <textarea
          name="purpose"
          placeholder="Purpose"
          value={formData.purpose}
          onChange={handleChange}
          rows="4"
          className="md:col-span-2 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-[var(--accent)] hover:bg-[var(--teal)] text-white px-6 py-3 rounded-xl font-medium transition"
          >
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  );
}

export default BWBookingForm;