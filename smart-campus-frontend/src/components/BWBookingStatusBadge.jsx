/**
 *
 * Helper component to render a consistent UI badge for different booking statuses.
 */
function BWBookingStatusBadge({ status }) {
  const getStatusStyle = () => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()}`}
    >
      {status}
    </span>
  );
}

export default BWBookingStatusBadge;