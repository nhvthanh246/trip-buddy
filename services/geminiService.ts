import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TripPlan, Activity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tripSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING, description: "The destination city or country inferred from input" },
    title: { type: Type.STRING, description: "A catchy title for the trip" },
    summary: { type: Type.STRING, description: "A summary of the extracted implicit context and vibe" },
    estimatedTotalCost: { type: Type.STRING, description: "Total estimated cost" },
    budgetBreakdown: {
      type: Type.OBJECT,
      properties: {
        accommodation: { type: Type.STRING },
        food: { type: Type.STRING },
        activities: { type: Type.STRING },
        transport: { type: Type.STRING }
      },
      required: ["accommodation", "food", "activities", "transport"]
    },
    bestTimeVisit: { type: Type.STRING },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                activity: { type: Type.STRING },
                description: { type: Type.STRING },
                location: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER, description: "Approximate latitude for map plotting" },
                    lng: { type: Type.NUMBER, description: "Approximate longitude for map plotting" }
                  },
                  required: ["lat", "lng"]
                },
                cost: { type: Type.STRING }
              },
              required: ["time", "activity", "description", "location", "coordinates"]
            }
          }
        },
        required: ["day", "theme", "activities"]
      }
    }
  },
  required: ["destination", "title", "summary", "itinerary", "estimatedTotalCost", "budgetBreakdown", "bestTimeVisit"]
};

const activitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    time: { type: Type.STRING },
    activity: { type: Type.STRING },
    description: { type: Type.STRING },
    location: { type: Type.STRING },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER }
      },
      required: ["lat", "lng"]
    },
    cost: { type: Type.STRING }
  },
  required: ["time", "activity", "description", "location", "coordinates"]
};

export const generateItinerary = async (rawInput: string): Promise<TripPlan> => {
  const prompt = `
    Analyze the following user request for a trip: "${rawInput}"

    1. **Implicit Context Extraction**: Infer the destination, budget style, pace, and interests.
    2. **Real-time Data**: Use Google Search to find current pricing estimates and open attractions.
    3. **POI Graph Optimization**: Identify key Points of Interest (Nodes). Order the itinerary to minimize travel distance.
    4. **Coordinates**: You MUST provide approximate Latitude and Longitude for every activity.
    
    Generate a complete itinerary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tripSchema,
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are Trip Buddy, an advanced AI travel engine. Use search data to ensure accuracy. Output structured JSON.",
      },
    });

    if (response.text) {
      const plan = JSON.parse(response.text) as TripPlan;
      // Assign IDs
      plan.itinerary.forEach((day) => {
        day.activities.forEach((act) => {
          act.id = Math.random().toString(36).substr(2, 9);
        });
      });
      return plan;
    } else {
      throw new Error("Empty response from Trip Buddy Engine");
    }
  } catch (error) {
    console.error("Trip Buddy Engine Error:", error);
    throw error;
  }
};

export const generateReplacementActivity = async (destination: string, userRequest: string, originalTime: string): Promise<Activity> => {
  const prompt = `
    The user is in ${destination}. They want to replace a scheduled activity at ${originalTime} with something else.
    User's request: "${userRequest}"
    
    Use Google Search to find a currently open and suitable place.
    Suggest ONE single activity that fits this request, location, and time.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: activitySchema,
        tools: [{ googleSearch: {} }],
      }
    });

    if (response.text) {
      const act = JSON.parse(response.text) as Activity;
      act.id = Math.random().toString(36).substr(2, 9);
      return act;
    } else {
        throw new Error("Failed to generate replacement");
    }
  } catch (error) {
      console.error(error);
      throw error;
  }
}