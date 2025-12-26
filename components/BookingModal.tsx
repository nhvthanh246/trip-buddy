import React, { useState } from 'react';
import { TripPlan } from '../types';
import { Plane, Hotel, Train, X, Check, Star, ArrowRight, ArrowLeft, Users, CreditCard, DollarSign, BedDouble, Receipt, MapPin, Calendar, SlidersHorizontal } from 'lucide-react';

interface BookingModalProps {
  plan: TripPlan;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ plan, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'train' | 'budget'>('flight');
  const [viewState, setViewState] = useState<'list' | 'details' | 'checkout' | 'success'>('list');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'duration'>('price_asc');
  
  // Selection State
  const [selectedItem, setSelectedItem] = useState<any>(null); // Generic selected item (Flight/Hotel/Train)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const destination = plan.destination || "Destination";
  
  // --- MOCK DATA ---
  // Added duration (minutes) for sorting
  const mockFlights = [
    { id: 1, type: 'flight', airline: "AirTravel", time: "08:00 AM - 10:30 AM", price: 120, stops: "Non-stop", duration: 150 },
    { id: 2, type: 'flight', airline: "SkyWays", time: "02:00 PM - 05:15 PM", price: 95, stops: "1 Stop", duration: 195 },
    { id: 3, type: 'flight', airline: "JetBlue", time: "06:00 AM - 09:00 AM", price: 150, stops: "Non-stop", duration: 180 },
    { id: 4, type: 'flight', airline: "EcoAir", time: "10:00 PM - 06:00 AM", price: 80, stops: "2 Stops", duration: 480 },
  ];

  const mockHotels = [
    { 
        id: 1, type: 'hotel', name: `Grand ${destination} Hotel`, rating: 4.8, price: 180, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80",
        rooms: [
            { id: 101, name: "Standard Room", price: 180, feat: "Queen Bed, City View" },
            { id: 102, name: "Deluxe Suite", price: 250, feat: "King Bed, Balcony, Breakfast" },
        ] 
    },
    { 
        id: 2, type: 'hotel', name: `${destination} City Stay`, rating: 4.2, price: 85, img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=300&q=80",
        rooms: [
            { id: 201, name: "Economy Double", price: 85, feat: "Double Bed, WiFi" },
            { id: 202, name: "City Studio", price: 110, feat: "Queen Bed, Kitchenette" },
        ]
    },
    { 
        id: 3, type: 'hotel', name: `The Boutique`, rating: 4.6, price: 135, img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=80",
        rooms: [
            { id: 301, name: "King Room", price: 135, feat: "King Bed, Art Decor" },
        ]
    },
  ];

  const mockTrains = [
    { id: 1, type: 'train', operator: "RailExpress", route: `Central to ${destination}`, price: 45, duration: "3h 20m", durationMins: 200 },
    { id: 2, type: 'train', operator: "NightLine", route: `Central to ${destination}`, price: 30, duration: "5h 00m", durationMins: 300 },
    { id: 3, type: 'train', operator: "BulletTrain", route: `Central to ${destination}`, price: 80, duration: "1h 45m", durationMins: 105 },
  ];

  // --- HANDLERS ---

  const handleSelectFlight = (flight: any) => {
      setSelectedItem(flight);
      setViewState('checkout');
  }

  const handleSelectHotel = (hotel: any) => {
      setSelectedItem(hotel);
      setViewState('details'); // Go to room selection
  }

  const handleSelectTrain = (train: any) => {
      setSelectedItem(train);
      setSelectedSeatIds([]);
      setViewState('details'); // Go to seat selection
  }

  const handleRoomSelect = (roomId: number) => {
      setSelectedRoomId(roomId);
  }

  const toggleSeat = (seatId: string) => {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeatIds.length < 4) setSelectedSeatIds(prev => [...prev, seatId]);
    }
  };

  const proceedToCheckout = () => {
      setViewState('checkout');
  }

  const confirmPayment = () => {
      setViewState('success');
  }

  const isSeatOccupied = (r: number, c: string) => (r * c.charCodeAt(0)) % 5 === 0;

  // --- HELPERS ---
  const getSortedItems = (items: any[]) => {
      return [...items].sort((a, b) => {
          if (sortBy === 'price_asc') return a.price - b.price;
          if (sortBy === 'price_desc') return b.price - a.price;
          if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
          // For flight use 'duration', for train use 'durationMins'
          const durA = a.durationMins || a.duration || 0;
          const durB = b.durationMins || b.duration || 0;
          if (sortBy === 'duration') return durA - durB;
          return 0;
      });
  };

  // --- RENDERERS ---

  const renderTabs = () => (
    <div className="flex border-b border-gray-100 bg-gray-50/50">
      {[
        { id: 'flight', icon: Plane, label: 'Flights' },
        { id: 'hotel', icon: Hotel, label: 'Hotels' },
        { id: 'train', icon: Train, label: 'Trains' },
        { id: 'budget', icon: DollarSign, label: 'Budget' },
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => { setActiveTab(tab.id as any); setViewState('list'); setSelectedItem(null); setSortBy('price_asc'); }}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === tab.id ? 'text-red-600 border-red-600 bg-red-50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
        >
          <tab.icon className="w-4 h-4" /> {tab.label}
        </button>
      ))}
    </div>
  );

  const renderFilters = () => (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide px-1">
        <div className="flex items-center gap-1 text-gray-400 mr-2">
            <SlidersHorizontal className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Sort</span>
        </div>
        <button onClick={() => setSortBy('price_asc')} className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${sortBy === 'price_asc' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            Cheapest First
        </button>
        <button onClick={() => setSortBy('price_desc')} className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${sortBy === 'price_desc' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            Expensive First
        </button>
        {activeTab === 'hotel' && (
            <button onClick={() => setSortBy('rating')} className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${sortBy === 'rating' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                Top Rated
            </button>
        )}
        {(activeTab === 'flight' || activeTab === 'train') && (
            <button onClick={() => setSortBy('duration')} className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${sortBy === 'duration' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                Fastest
            </button>
        )}
    </div>
  );

  const renderList = () => (
      <div className="space-y-4 p-1">
          {activeTab !== 'budget' && renderFilters()}

          {activeTab === 'flight' && getSortedItems(mockFlights).map((f: any) => (
              <div key={f.id} onClick={() => handleSelectFlight(f)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-red-400 cursor-pointer group transition-all">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Plane className="w-5 h-5"/></div>
                      <div>
                          <div className="font-bold text-gray-900">{f.airline}</div>
                          <div className="text-xs text-gray-500">{f.time} • {f.stops}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{Math.floor(f.duration / 60)}h {f.duration % 60}m</div>
                      </div>
                  </div>
                  <div className="text-right"><div className="text-lg font-bold text-red-600">${f.price}</div></div>
              </div>
          ))}

          {activeTab === 'hotel' && getSortedItems(mockHotels).map((h: any) => (
              <div key={h.id} onClick={() => handleSelectHotel(h)} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex hover:border-red-400 cursor-pointer transition-all">
                  <div className="w-24 h-24 bg-gray-200 shrink-0"><img src={h.img} className="w-full h-full object-cover" /></div>
                  <div className="p-3 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-sm">{h.name}</h4>
                          <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold"><Star className="w-3 h-3 fill-current"/> {h.rating}</div>
                      </div>
                      <div className="flex justify-between items-end mt-auto"><span className="text-xs text-gray-400">from</span><span className="text-red-600 font-bold">${h.price}</span></div>
                  </div>
              </div>
          ))}

          {activeTab === 'train' && getSortedItems(mockTrains).map((t: any) => (
              <div key={t.id} onClick={() => handleSelectTrain(t)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-red-400 cursor-pointer transition-all">
                  <div>
                      <div className="font-bold text-gray-800 flex items-center gap-2"><Train className="w-4 h-4 text-gray-400"/>{t.operator}</div>
                      <div className="text-xs text-gray-500 mt-1">{t.route}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.duration}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                      <div className="text-lg font-bold text-red-600">${t.price}</div>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Select Seats</span>
                  </div>
              </div>
          ))}

          {activeTab === 'budget' && (
              <div className="space-y-6">
                 <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100">
                    <h4 className="text-gray-500 text-sm uppercase tracking-wide">Estimated Total Cost</h4>
                    <div className="text-4xl font-extrabold text-red-600 mt-2">{plan.estimatedTotalCost}</div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(plan.budgetBreakdown).map(([key, val]) => (
                        <div key={key} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                            <span className="capitalize text-gray-600 font-medium">{key}</span>
                            <span className="font-bold text-gray-900">{val}</span>
                        </div>
                    ))}
                 </div>
                 <div className="text-xs text-gray-400 text-center mt-4">
                    * Costs are estimates based on average prices for this season.
                 </div>
              </div>
          )}
      </div>
  );

  const renderDetails = () => {
      if (activeTab === 'hotel' && selectedItem) {
          return (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <h4 className="font-bold text-gray-900">Select Room for {selectedItem.name}</h4>
                  {selectedItem.rooms.map((room: any) => (
                      <div 
                        key={room.id} 
                        onClick={() => handleRoomSelect(room.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${selectedRoomId === room.id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                          <div>
                              <div className="font-bold text-gray-800">{room.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><BedDouble className="w-3 h-3"/> {room.feat}</div>
                          </div>
                          <div className="font-bold text-red-600">${room.price}</div>
                      </div>
                  ))}
                  <button 
                    onClick={proceedToCheckout}
                    disabled={!selectedRoomId}
                    className={`w-full py-3 rounded-xl font-bold text-white mt-4 ${selectedRoomId ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                      Book Room
                  </button>
              </div>
          )
      }
      
      if (activeTab === 'train' && selectedItem) {
          return (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                   <h4 className="font-bold text-gray-800 flex items-center gap-2"><Train className="w-4 h-4"/> {selectedItem.operator} Seat Map</h4>
                   <div className="text-xs font-mono text-red-600 font-bold">Selected: {selectedSeatIds.length}</div>
                </div>

                {/* Train Car Visual */}
                <div className="bg-gray-100 border-2 border-gray-300 rounded-3xl p-6 mx-auto max-w-[280px] relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 w-12 h-1.5 rounded-full"></div>
                   <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                      {[1, 2, 3, 4, 5, 6].map(row => (
                        <React.Fragment key={row}>
                          <div className="flex gap-1">
                             {['A', 'B'].map(col => {
                               const sid = `${row}${col}`;
                               const occ = isSeatOccupied(row, col);
                               const sel = selectedSeatIds.includes(sid);
                               return (
                                 <button key={sid} disabled={occ} onClick={() => toggleSeat(sid)}
                                   className={`w-7 h-7 rounded text-[10px] font-bold ${occ ? 'bg-gray-300 text-gray-400' : sel ? 'bg-red-600 text-white' : 'bg-white border hover:border-red-400'}`}>
                                   {row}{col}
                                 </button>
                               )
                             })}
                          </div>
                          <div className="flex items-center justify-center text-[9px] text-gray-400">{row}</div>
                          <div className="flex gap-1">
                             {['C', 'D'].map(col => {
                               const sid = `${row}${col}`;
                               const occ = isSeatOccupied(row, col);
                               const sel = selectedSeatIds.includes(sid);
                               return (
                                 <button key={sid} disabled={occ} onClick={() => toggleSeat(sid)}
                                   className={`w-7 h-7 rounded text-[10px] font-bold ${occ ? 'bg-gray-300 text-gray-400' : sel ? 'bg-red-600 text-white' : 'bg-white border hover:border-red-400'}`}>
                                   {row}{col}
                                 </button>
                               )
                             })}
                          </div>
                        </React.Fragment>
                      ))}
                   </div>
                   <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 w-12 h-1.5 rounded-full"></div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                   <span>Total Price</span>
                   <span className="font-bold text-red-600">${selectedSeatIds.length * selectedItem.price}</span>
                </div>

                 <button 
                    onClick={proceedToCheckout}
                    disabled={selectedSeatIds.length === 0}
                    className={`w-full py-3 rounded-xl font-bold text-white mt-2 ${selectedSeatIds.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                      Proceed to Checkout
                  </button>
            </div>
          )
      }
      return null;
  };

  const renderCheckout = () => {
      let total = 0;
      let summaryNode = null;

      if (activeTab === 'flight') {
          total = selectedItem.price;
          summaryNode = (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{selectedItem.airline}</h4>
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Flight</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Tomorrow, {selectedItem.time.split('-')[0]}</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Route to {destination}</span>
                </div>
            </div>
          );
      } else if (activeTab === 'hotel') {
          const room = selectedItem.rooms.find((r:any) => r.id === selectedRoomId);
          total = room?.price || 0;
          summaryNode = (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{selectedItem.name}</h4>
                    <span className="bg-yellow-50 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Hotel</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <BedDouble className="w-4 h-4 text-gray-400" />
                    <span>{room?.name}</span>
                </div>
                 <div className="text-xs text-gray-400 pl-6">{room?.feat}</div>
            </div>
          );
      } else if (activeTab === 'train') {
          total = selectedItem.price * selectedSeatIds.length;
          summaryNode = (
             <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{selectedItem.operator}</h4>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Train</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{selectedSeatIds.length} Passengers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 flex justify-center text-gray-400 font-mono text-xs">#</div>
                    <span>Seats: {selectedSeatIds.join(', ')}</span>
                </div>
            </div>
          );
      }

      return (
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
             <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Confirm Order</h3>
                <p className="text-gray-500 text-sm mt-1">Review your selection before paying</p>
             </div>
             
             {summaryNode}
             
             <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${total}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Service Fee</span><span>${(total * 0.1).toFixed(2)}</span></div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span className="text-red-600">${(total * 1.1).toFixed(2)}</span>
                </div>
             </div>

             <div className="space-y-3">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Payment Method</h4>
                 <div className="flex items-center gap-3 border p-3 rounded-lg cursor-pointer border-red-500 bg-red-50/20">
                    <div className="w-4 h-4 rounded-full border-[5px] border-red-600 bg-white"></div>
                    <CreditCard className="w-5 h-5 text-gray-900"/>
                    <span className="text-sm font-medium">Credit / Debit Card</span>
                 </div>
                 <div className="flex items-center gap-3 border p-3 rounded-lg cursor-pointer hover:border-red-300">
                    <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                    <span className="text-sm font-medium text-gray-600">PayPal</span>
                 </div>
             </div>

             <button onClick={confirmPayment} className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                 Pay ${(total * 1.1).toFixed(2)}
             </button>
          </div>
      )
  };

  const renderSuccess = () => (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <Check className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h3>
          <p className="text-gray-500 max-w-xs">Your booking has been successfully placed. You will receive a confirmation email shortly.</p>
          <button onClick={onClose} className="bg-gray-900 text-white px-8 py-2 rounded-lg font-bold mt-4">
              Back to Trip
          </button>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {viewState !== 'list' && viewState !== 'success' && (
                <button onClick={() => setViewState('list')} className="p-1 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5 text-gray-600"/></button>
            )}
            <h3 className="text-lg font-bold text-gray-900">
                {viewState === 'list' && "Trip Bookings"}
                {viewState === 'details' && "Select Options"}
                {viewState === 'checkout' && "Checkout"}
                {viewState === 'success' && "Success"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation (Only in list view) */}
        {viewState === 'list' && renderTabs()}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white relative">
            {viewState === 'list' && renderList()}
            {viewState === 'details' && renderDetails()}
            {viewState === 'checkout' && renderCheckout()}
            {viewState === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};