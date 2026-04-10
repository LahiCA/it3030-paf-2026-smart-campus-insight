import React from 'react';

const statusColor = {
  AVAILABLE: 'bg-green-100 text-green-700',
  IN_USE: 'bg-yellow-100 text-yellow-700',
  MAINTENANCE: 'bg-red-100 text-red-700',
};

const ResourceCard = ({ data }) => (
  <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm my-1 text-sm">
    <div className="flex items-center justify-between mb-1">
      <span className="font-semibold text-gray-800">{data.name}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[data.status] || 'bg-gray-100 text-gray-600'}`}>
        {data.status?.replace('_', ' ')}
      </span>
    </div>
    <p className="text-gray-500 text-xs">
      {data.type} &middot; Capacity {data.capacity} &middot; {data.location}
    </p>
  </div>
);

const BookingCard = ({ data }) => {
  const sColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm my-1 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-800">{data.bookingId}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sColor[data.status] || 'bg-gray-100 text-gray-600'}`}>
          {data.status}
        </span>
      </div>
      <p className="text-gray-500 text-xs">
        {data.resource} &middot; {data.date} &middot; {data.time}
      </p>
    </div>
  );
};

const TicketCard = ({ data }) => {
  const sColor = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-green-100 text-green-700',
  };
  const pColor = {
    HIGH: 'text-red-600',
    MEDIUM: 'text-yellow-600',
    LOW: 'text-green-600',
  };
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm my-1 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-800">{data.ticketId}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sColor[data.status] || 'bg-gray-100 text-gray-600'}`}>
          {data.status?.replace('_', ' ')}
        </span>
      </div>
      <p className="text-gray-600 text-xs mb-0.5">{data.title}</p>
      <p className="text-xs">
        <span className={`font-medium ${pColor[data.priority] || ''}`}>{data.priority}</span>
        <span className="text-gray-400"> &middot; {data.assignedTo}</span>
      </p>
    </div>
  );
};

const RichCards = ({ cards }) => {
  if (!cards || cards.length === 0) return null;
  return (
    <div className="px-4 space-y-1">
      {cards.map((card, i) => {
        switch (card.type) {
          case 'resource':
            return <ResourceCard key={i} data={card.data} />;
          case 'booking':
            return <BookingCard key={i} data={card.data} />;
          case 'ticket':
            return <TicketCard key={i} data={card.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default RichCards;
