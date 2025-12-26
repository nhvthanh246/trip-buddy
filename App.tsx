import React, { useState } from 'react';
import { TripForm } from './components/TripForm';
import { Itinerary } from './components/Itinerary';
import { TripMap } from './components/TripMap';
import { BookingModal } from './components/BookingModal';
import { generateItinerary, generateReplacementActivity } from './services/geminiService';
import { TripPlan } from './types';
import { Compass, Save, GitCompare, RotateCw } from 'lucide-react';

const App: React.FC = () => {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Replacement State
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{dayIdx: number, actId: string, time: string} | null>(null);
  const [replaceQuery, setReplaceQuery] = useState("");
  const [replaceLoading, setReplaceLoading] = useState(false);

  const handlePlanTrip = async (rawText: string) => {
    setLoading(true);
    setError(null);
    setTripPlan(null);

    try {
      const plan = await generateItinerary(rawText);
      setTripPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Trip Buddy engine couldn't optimize a route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTripPlan(null);
    setError(null);
    setIsBookingOpen(false);
  };

  const handleSave = () => {
    alert("Plan saved to your profile!");
  };

  const handleCompare = () => {
    alert("Compare feature coming soon!");
  };

  const initiateRemove = (dayIdx: number, actId: string) => {
    if(!tripPlan) return;
    const act = tripPlan.itinerary[dayIdx].activities.find(a => a.id === actId);
    if(act) {
        setPendingRemove({ dayIdx, actId, time: act.time });
        setIsReplaceModalOpen(true);
    }
  };

  const confirmRemoveOnly = () => {
      if(!tripPlan || !pendingRemove) return;
      const newPlan = { ...tripPlan };
      newPlan.itinerary[pendingRemove.dayIdx].activities = newPlan.itinerary[pendingRemove.dayIdx].activities.filter(a => a.id !== pendingRemove.actId);
      setTripPlan(newPlan);
      setIsReplaceModalOpen(false);
      setPendingRemove(null);
  };

  const confirmReplace = async () => {
      if(!tripPlan || !pendingRemove || !replaceQuery.trim()) return;
      setReplaceLoading(true);
      try {
          const newActivity = await generateReplacementActivity(tripPlan.destination, replaceQuery, pendingRemove.time);
          
          const newPlan = { ...tripPlan };
          const dayActs = newPlan.itinerary[pendingRemove.dayIdx].activities;
          const idx = dayActs.findIndex(a => a.id === pendingRemove.actId);
          
          if(idx !== -1) {
              dayActs[idx] = newActivity; // Replace in place
          }
          
          setTripPlan(newPlan);
          setIsReplaceModalOpen(false);
          setPendingRemove(null);
          setReplaceQuery("");
      } catch(e) {
          alert("Could not generate replacement. Try again.");
      } finally {
          setReplaceLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-red-600 p-1.5 rounded-lg shadow-md shadow-red-200">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Trip Buddy</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">AI Graph Optimizer</p>
            </div>
          </div>
          
          {tripPlan && (
             <div className="flex gap-2">
               <button 
                 onClick={handleCompare}
                 className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <GitCompare className="w-4 h-4" /> Compare
               </button>
               <button 
                 onClick={handleSave}
                 className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
               >
                 <Save className="w-4 h-4" /> Save Plan
               </button>
             </div>
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        
        {/* Layer 1: Input (Only visible when no plan is generated) */}
        {!tripPlan && !loading && (
          <div className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
              <div className="inline-block bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-red-100">
                Layer 1: Input Processing
              </div>
              <TripForm onSubmit={handlePlanTrip} isLoading={loading} />
              
              {/* Architecture Diagram Visualization (Static) */}
              <div className="mt-12 pt-12 border-t border-gray-100 grid grid-cols-5 gap-2 text-center opacity-50">
                 {['Input Layer', 'LLM Engine', 'POI Extraction', 'Graph Optim.', 'Presentation'].map((layer, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                     <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                     <span className="text-[10px] uppercase font-bold text-gray-400">{layer}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-grow flex flex-col items-center justify-center space-y-8">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                <Compass className="absolute inset-0 m-auto text-red-600 w-8 h-8 animate-pulse" />
             </div>
             <div className="text-center space-y-2">
               <h3 className="text-xl font-bold text-gray-900">Trip Buddy Engine Running</h3>
               <div className="flex flex-col gap-1 text-sm text-gray-500">
                  <span className="animate-pulse delay-75">Analyzing Context...</span>
                  <span className="animate-pulse delay-150">Extracting POIs...</span>
                  <span className="animate-pulse delay-300">Optimizing Graph Route...</span>
               </div>
             </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex flex-col items-center gap-3 max-w-md text-center">
              <p className="font-medium">{error}</p>
              <button 
                onClick={reset}
                className="text-sm font-bold underline hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Layer 5: Output/Presentation */}
        {tripPlan && !loading && (
          <div className="flex-grow h-[calc(100vh-65px)] flex flex-col md:flex-row overflow-hidden">
            
            {/* Left: Map Visualization (Graph Layer) */}
            <div className="w-full md:w-1/2 lg:w-3/5 h-1/2 md:h-full p-4 bg-gray-50 border-r border-gray-200 relative">
               <TripMap plan={tripPlan} />
            </div>

            {/* Right: Detailed Itinerary */}
            <div className="w-full md:w-1/2 lg:w-2/5 h-1/2 md:h-full bg-white p-4 md:p-6 overflow-hidden">
              <Itinerary 
                plan={tripPlan} 
                onOpenBooking={() => setIsBookingOpen(true)} 
                onRemoveActivity={initiateRemove}
              />
            </div>
            
          </div>
        )}

        {/* Booking Modal Overlay */}
        {isBookingOpen && tripPlan && (
          <BookingModal plan={tripPlan} onClose={() => setIsBookingOpen(false)} />
        )}

        {/* Replace/Remove Activity Modal */}
        {isReplaceModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Change Plans?</h3>
                    <p className="text-sm text-gray-500 mb-6">Do you want to simply remove this activity, or ask Trip Buddy to suggest a replacement?</p>
                    
                    {!replaceLoading ? (
                        <>
                            {/* Suggestion Input */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Replace With (Optional)</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                                    rows={3}
                                    placeholder="e.g. I want to visit a museum instead..."
                                    value={replaceQuery}
                                    onChange={(e) => setReplaceQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={confirmReplace}
                                    disabled={!replaceQuery.trim()}
                                    className={`w-full py-2.5 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${replaceQuery.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                >
                                    <RotateCw className="w-4 h-4" /> Replace Activity
                                </button>
                                <button 
                                    onClick={confirmRemoveOnly}
                                    className="w-full py-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100"
                                >
                                    Remove Only
                                </button>
                                <button 
                                    onClick={() => setIsReplaceModalOpen(false)}
                                    className="w-full py-2 rounded-lg font-medium text-gray-400 hover:text-gray-600 text-xs mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-gray-600 font-medium">Finding alternatives...</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;