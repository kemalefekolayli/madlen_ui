interface LogoProps {
  className?: string;
  size?: number;
}

export function MadlenLogo({ className = '', size = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-madlen-500"
      >
        <path
          d="M20 4C20 4 8 14 8 24C8 30 13 36 20 36C27 36 32 30 32 24C32 14 20 4 20 4Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M12 16C12 16 14 12 20 12C26 12 28 16 28 16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M10 22C10 22 13 18 20 18C27 18 30 22 30 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 28C8 28 12 24 20 24C28 24 32 28 32 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      
      <span className="text-xl font-semibold text-dark-300 dark:text-white">
        madlen
      </span>
    </div>
  );
}
