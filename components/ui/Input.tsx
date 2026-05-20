import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-softWhite">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-void/50 border border-lavenderGray/30 rounded-lg px-4 py-3 text-softWhite",
            "placeholder:text-lavenderGray/50",
            "focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon/50",
            "transition-all duration-300",
            error && "border-spikeRed focus:border-spikeRed focus:ring-spikeRed/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-spikeRed text-xs">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;