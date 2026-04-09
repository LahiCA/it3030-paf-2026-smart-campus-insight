import React, { useState } from "react";

const ContactUs = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    // later → connect to backend API
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-stone-50 px-6 md:px-16 lg:px-24 py-10">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-gray-800">
          Contact Us
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Need help with bookings, facilities, or incidents? Reach out to us.
        </p>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* Left: Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-medium mb-4 text-gray-800">
            Campus Support
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Our team is here to assist you with resource bookings, maintenance issues,
            and general inquiries related to the Smart Campus platform.
          </p>

          <div className="space-y-4 text-sm text-gray-600">
            <p> Location: SLIIT Campus, Malabe</p>
            <p> Email: support@smartcampus.com</p>
            <p> Phone: +94 11 754 4801</p>
            <p> Working Hours: 8:00 AM – 5:00 PM</p>
          </div>
        </div>

        {/* Right: Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-sm space-y-4"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Send a Message
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>

      </div>
    </div>
  );
};

export default ContactUs;