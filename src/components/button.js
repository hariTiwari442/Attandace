const Button = ({ children, className, onClick }) => {
  return (
    <button
      className={`px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 shadow-md ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
