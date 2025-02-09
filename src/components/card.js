const Card = ({ children, className }) => {
  return (
    <div
      className={`w-80 p-6 bg-white shadow-lg rounded-xl border border-gray-300 text-center transition-transform transform hover:scale-105 ${className}`}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};
export { Card, CardContent };
