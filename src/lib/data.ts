export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
};

export type Barber = {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  experience: string;
  signature: string;
  image: string;
};

import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";
import b3 from "@/assets/barber-3.jpg";

export const services: Service[] = [
  { id: "signature", name: "Signature Cut", duration: 45, price: 65, description: "Precision tailored cut with hot towel finish." },
  { id: "fade", name: "Skin Fade", duration: 60, price: 75, description: "Seamless taper with razor detailing." },
  { id: "beard", name: "Beard Sculpt", duration: 30, price: 40, description: "Hot towel, oil massage, sharp lines." },
  { id: "royale", name: "The Royale", duration: 90, price: 140, description: "Cut, shave, scalp treatment, espresso." },
];

export const barbers: Barber[] = [
  { id: "alex", name: "Alexander Vale", title: "Master Barber", rating: 4.9, reviews: 312, experience: "12 yrs", signature: "Skin Fades", image: b1 },
  { id: "marcus", name: "Marcus Rhys", title: "Senior Stylist", rating: 4.8, reviews: 248, experience: "8 yrs", signature: "Scissor Work", image: b2 },
  { id: "ezra", name: "Ezra Lin", title: "Stylist", rating: 4.9, reviews: 184, experience: "6 yrs", signature: "Texture Cuts", image: b3 },
];

export const timeSlots = [
  "09:00", "09:45", "10:30", "11:15",
  "12:00", "13:30", "14:15", "15:00",
  "15:45", "16:30", "17:15", "18:00",
];
