import React from 'react';
import { TripPlan, DayPlan, Activity } from '../types';
import { Clock, MapPin, Trash2, CalendarCheck, Sun, RotateCw } from 'lucide-react';

interface ItineraryProps {
  plan: TripPlan;
  onOpenBooking: () => void;
  onRemoveActivity: (dayIndex: number, activityId: string) => void;
}

const ActivityItem: React.FC<{ 
  activity: Activity; 
  onRemove: () => void; 
}> = ({ activity, onRemove }) => (
  <div className="flex gap-4 group relative">
    <div className="flex flex-col items-center">
      <div className="w-2 h-2 rounded-full bg-red-400 ring-4 ring-white group-hover:bg-red-600 transition-colors"></div>
      <div className="w-0.5 h-full bg-gray-100 group-last:hidden"></div>
    </div>
    <div className="pb-8 w-full">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" /> {activity.time}
          </span>
          {activity.cost && activity.cost !== 'Free' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {activity.cost}
            </span>
          )}
        </div>
        <h4 className="text-md font-bold text-gray-900 leading-tight mb-1 pr-6">{activity.activity}</h4>
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
          <MapPin className="w-3 h-3" />
          {activity.location}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>

        {/* Action Buttons - Bottom Left Corner */}
        <div className="absolute bottom-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-full">
           <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-[10px] font-medium border border-transparent hover:border-blue-100"
            title="Ask AI to Replace"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replace</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Remove Activity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const Itinerary: React.FC<ItineraryProps> = ({ plan, onOpenBooking, onRemoveActivity }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Title Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{plan.title}</h2>
        
        {/* Best Time to Visit Badge */}
        <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 mb-3">
          <Sun className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
          <span>Best time to visit: {plan.bestTimeVisit}</span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed">{plan.summary}</p>
      </div>

      {/* Scrollable List */}
      <div className="flex-grow overflow-y-auto pr-2 scrollbar-hide space-y-8 pb-4">
        {plan.itinerary.map((day: DayPlan, dayIndex) => (
          <div key={day.day}>
            <div className="sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-2 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">DAY {day.day}</span>
                {day.theme}
              </h3>
            </div>
            <div className="pl-2">
              {day.activities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  onRemove={() => onRemoveActivity(dayIndex, activity.id || '')} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={onOpenBooking}
          className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <CalendarCheck className="w-5 h-5 text-red-500" />
          Book Trip (Flights, Hotels & Train)
        </button>
      </div>
    </div>
  );
};