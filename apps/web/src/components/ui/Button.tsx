interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`}>
      {children}
    </button>
  );
};

export default Button;