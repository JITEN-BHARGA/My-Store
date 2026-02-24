const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* FULL STARS */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg
          key={`full-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-yellow-400"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.263a1 1 0 00.95.69h6.586c.969 0 1.371 1.24.588 1.81l-5.33 3.873a1 1 0 00-.364 1.118l2.036 6.263c.3.921-.755 1.688-1.538 1.118l-5.33-3.873a1 1 0 00-1.175 0l-5.33 3.873c-.783.57-1.838-.197-1.538-1.118l2.036-6.263a1 1 0 00-.364-1.118L2.84 11.69c-.783-.57-.38-1.81.588-1.81h6.586a1 1 0 00.95-.69l2.036-6.263z" />
        </svg>
      ))}

      {/* HALF STAR */}
      {hasHalfStar && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-5 h-5"
        >
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path
            fill="url(#halfGrad)"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.263a1 1 0 00.95.69h6.586c.969 0 1.371 1.24.588 1.81l-5.33 3.873a1 1 0 00-.364 1.118l2.036 6.263c.3.921-.755 1.688-1.538 1.118l-5.33-3.873a1 1 0 00-1.175 0l-5.33 3.873c-.783.57-1.838-.197-1.538-1.118l2.036-6.263a1 1 0 00-.364-1.118L2.84 11.69c-.783-.57-.38-1.81.588-1.81h6.586a1 1 0 00.95-.69l2.036-6.263z"
          />
        </svg>
      )}

      {/* EMPTY STARS */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg
          key={`empty-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5 text-gray-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.263a1 1 0 00.95.69h6.586c.969 0 1.371 1.24.588 1.81l-5.33 3.873a1 1 0 00-.364 1.118l2.036 6.263c.3.921-.755 1.688-1.538 1.118l-5.33-3.873a1 1 0 00-1.175 0l-5.33 3.873c-.783.57-1.838-.197-1.538-1.118l2.036-6.263a1 1 0 00-.364-1.118L2.84 11.69c-.783-.57-.38-1.81.588-1.81h6.586a1 1 0 00.95-.69l2.036-6.263z"
          />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;