export interface UserInputLayer {
  rawText: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Activity {
  id?: string; // Unique identifier for UI manipulation
  time: string;
  activity: string;
  description: string;
  location: string;
  coordinates: Coordinates;
  cost?: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface TripPlan {
  destination: string;
  title: string;
  summary: string;
  estimatedTotalCost: string;
  budgetBreakdown: {
    accommodation: string;
    food: string;
    activities: string;
    transport: string;
  };
  bestTimeVisit: string;
  itinerary: DayPlan[];
}