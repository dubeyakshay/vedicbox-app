import { useState } from 'react';
import { useApp } from '../store';
import { Calendar, Clock, Video, Phone, Check, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { bookConsultation } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

const consultants = [
  { name: 'Pt. Raghunath Sharma', title: 'Senior Vastu Consultant', exp: '25+ years', rating: 4.9, reviews: 432, image: '🧑‍🦳' },
  { name: 'Acharya Deepak Joshi', title: 'Vastu & Astrology Expert', exp: '18+ years', rating: 4.8, reviews: 289, image: '👨‍🏫' },
  { name: 'Pt. Meera Devi', title: 'Puja Vidhi Specialist', exp: '15+ years', rating: 4.9, reviews: 356, image: '👩‍🏫' },
];

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '7:00 PM'];

export default function ConsultationPage() {
  const { dispatch } = useApp();
  const [consultType, setConsultType] = useState<'vastu' | 'puja'>('vastu');
  const [selectedConsultant, setSelectedConsultant] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [mode, setMode] = useState<'video' | 'phone'>('video');
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      date: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      num: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });

  const price = consultType === 'vastu' ? (mode === 'video' ? 999 : 499) : (mode === 'video' ? 799 : 399);

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 pb-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={48} className="text-green-500" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800">Booking Confirmed! 🙏</h2>
          <p className="text-gray-500 text-sm mt-2">Your consultation has been scheduled</p>
          <div className="bg-saffron-50 rounded-2xl p-4 mt-6 text-left space-y-2">
            <p className="text-xs text-gray-500">Consultant: <span className="font-semibold text-gray-700">{consultants[selectedConsultant].name}</span></p>
            <p className="text-xs text-gray-500">Date: <span className="font-semibold text-gray-700">{selectedDate}</span></p>
            <p className="text-xs text-gray-500">Time: <span className="font-semibold text-gray-700">{selectedTime}</span></p>
            <p className="text-xs text-gray-500">Mode: <span className="font-semibold text-gray-700">{mode === 'video' ? '📹 Video Call' : '📞 Phone Call'}</span></p>
            <p className="text-xs text-gray-500">Amount Paid: <span className="font-bold text-saffron-700">₹{price}</span></p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_PAGE', page: 'home' })}
            className="w-full mt-6 bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 rounded-xl font-semibold text-sm"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-lg text-gray-800">Book Consultation</h2>
        <p className="text-xs text-gray-400">Get personalized guidance from experts</p>
      </div>

      {/* Consultation Type */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {[
            { type: 'vastu' as const, label: '🕉️ Vastu Consultation', sub: 'Home, Office & Business' },
            { type: 'puja' as const, label: '🪔 Puja Guidance', sub: 'Rituals & Ceremonies' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => setConsultType(item.type)}
              className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                consultType === item.type
                  ? 'border-saffron-500 bg-saffron-50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <p className="text-sm font-semibold text-gray-700">{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="px-4 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Consultation Mode</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              mode === 'video' ? 'border-saffron-500 bg-saffron-50 text-saffron-700' : 'border-gray-100 text-gray-500'
            }`}
          >
            <Video size={16} /> Video Call
          </button>
          <button
            onClick={() => setMode('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              mode === 'phone' ? 'border-saffron-500 bg-saffron-50 text-saffron-700' : 'border-gray-100 text-gray-500'
            }`}
          >
            <Phone size={16} /> Phone Call
          </button>
        </div>
      </div>

      {/* Select Consultant */}
      <div className="px-4 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Select Expert</h3>
        <div className="space-y-2">
          {consultants.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedConsultant(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedConsultant === i ? 'border-saffron-500 bg-saffron-50' : 'border-gray-100 bg-white'
              }`}
            >
              <span className="text-3xl">{c.image}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-gray-700">{c.name}</p>
                <p className="text-[10px] text-gray-400">{c.title} • {c.exp}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={10} className="text-gold-500 fill-gold-500" />
                  <span className="text-[10px] text-gray-500">{c.rating} ({c.reviews})</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedConsultant === i ? 'border-saffron-500' : 'border-gray-300'
              }`}>
                {selectedConsultant === i && <div className="w-3 h-3 rounded-full bg-saffron-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Select Date */}
      <div className="px-4 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
          <Calendar size={14} /> Select Date
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                selectedDate === d.date
                  ? 'bg-gradient-to-b from-saffron-500 to-gold-500 text-white'
                  : 'bg-white border border-gray-100 text-gray-600'
              }`}
            >
              <p className="text-[10px]">{d.day}</p>
              <p className="text-lg font-bold">{d.num}</p>
              <p className="text-[10px]">{d.month}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Select Time */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
          <Clock size={14} /> Select Time
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTime === time
                  ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
                  : 'bg-white border border-gray-100 text-gray-600'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">{mode === 'video' ? 'Video' : 'Phone'} consultation</span>
            <p className="font-bold text-xl text-gray-800">₹{price}</p>
          </div>
          <button
            onClick={async () => {
              if (selectedDate && selectedTime) {
                setBooking(true);
                if (isSupabaseConfigured()) {
                  try {
                    await bookConsultation({
                      consultantName: consultants[selectedConsultant].name,
                      type: consultType,
                      mode,
                      date: selectedDate,
                      time: selectedTime,
                      price,
                    });
                  } catch (e) { console.error('Booking error:', e); }
                }
                setBooking(false);
                setBooked(true);
              }
            }}
            disabled={!selectedDate || !selectedTime || booking}
            className={`px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 ${
              selectedDate && selectedTime
                ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {booking ? <><Loader2 size={14} className="animate-spin" /> Booking...</> : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
