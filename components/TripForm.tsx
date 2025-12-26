import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';

interface TripFormProps {
  onSubmit: (rawText: string) => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';
      
      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);
      
      setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Where to next?</h2>
        <p className="text-gray-500">Describe your dream trip, and let Trip Buddy optimize the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-500 ring-opacity-50' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              title="Speak your request"
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: A 5-day romantic trip to Paris with a mid-range budget, focusing on art and food..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 text-lg placeholder-gray-400 px-2"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:scale-105'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['Budget backpacking in Vietnam', 'Luxury weekend in NYC', 'Family trip to Disney World'].map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(suggestion)}
              className="text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 px-3 py-1.5 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};