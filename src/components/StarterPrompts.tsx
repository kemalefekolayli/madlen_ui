import React from 'react';

const PROMPTS = [
  "Bana Python ile bir hesap makinesi kodu yaz.",
  "Kuantum fiziğini 5 yaşında birine anlat.",
  "Bugün akşam yemeği için pratik bir tarif.",
  "Motivasyon mektubu yazmama yardım et."
];

interface StarterPromptsProps {
  onSelect: (msg: string) => void;
}

export const StarterPrompts: React.FC<StarterPromptsProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-dark-300 dark:text-white mb-2">
          Sohbete Başla
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bir konu seçin veya aşağıya yazın
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(prompt)}
            className="p-4 text-sm text-left rounded-xl 
                       bg-white dark:bg-dark-400 
                       hover:bg-cream-100 dark:hover:bg-dark-300 
                       border border-cream-300 dark:border-dark-100 
                       transition-all duration-200 
                       text-dark-200 dark:text-slate-300 
                       shadow-soft hover:shadow-medium 
                       cursor-pointer 
                       active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <span className="text-madlen-500 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span>{prompt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
