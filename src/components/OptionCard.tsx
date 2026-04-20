import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface OptionCardProps {
  text: string;
  index: number;
  selected: boolean;
  correct?: boolean | null;
  disabled: boolean;
  faded?: boolean;
  onClick: (index: number) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({ text, index, selected, correct, disabled, faded, onClick }) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];

  let statusClass = "option-card-neutral";
  if (selected && correct === null) statusClass = "option-card-selected";
  if (correct === true) statusClass = "option-card-correct";
  if (correct === false && selected) statusClass = "option-card-incorrect";

  return (
    <motion.button
      whileHover={!disabled && !faded ? { x: 4 } : {}}
      whileTap={!disabled && !faded ? { scale: 0.98 } : {}}
      disabled={disabled}
      onClick={() => onClick(index)}
      className={cn(
        "option-card font-medium transition-all duration-300", 
        statusClass, 
        disabled && "cursor-default",
        faded && "opacity-40 grayscale-[0.5]"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-colors",
        selected || correct === true ? "bg-univesp-brand text-white border-transparent" : "bg-white border-slate-300 text-slate-500"
      )}>
        {correct === true ? <Check className="text-white w-5 h-5" /> :
         correct === false && selected ? <X className="text-white w-5 h-5" /> :
         letters[index]}
      </div>
      <span className={cn("flex-grow", selected || correct !== null ? "text-slate-800" : "text-slate-700")}>{text}</span>
    </motion.button>
  );
};
