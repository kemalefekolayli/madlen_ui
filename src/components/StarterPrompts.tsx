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
    // DÜZELTME: z-50 yerine z-0 yapıldı. Böylece dropdown menülerin altında kalacak.
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 z-0">
      <div className="text-center mb-6 text-gray-400">
        <h3 className="text-lg font-medium mb-2">Sohbete Başla</h3>
        <p className="text-sm">Bir konu seçin veya aşağıya yazın</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(prompt)}
            className="p-3 text-sm text-left border rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 transition duration-200 text-gray-600 dark:text-gray-300 shadow-sm cursor-pointer hover:shadow-md active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};