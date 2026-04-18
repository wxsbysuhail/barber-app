import { create } from "zustand";
import { barbers, services, timeSlots, type Barber, type Service } from "./data";

export type AppointmentStatus = "upcoming" | "now" | "done" | "cancelled";

export type Appointment = {
  id: string;
  time: string;
  client: string;
  service: Service;
  barber: Barber;
  status: AppointmentStatus;
  duration: string;
  price: number;
  tip?: number;
  createdAt: number;
};

const seed: Appointment[] = [
  { id: "a1", time: "09:00", client: "James Whitmore", service: services[0], barber: barbers[0], status: "done", duration: "45m", price: 65, tip: 10, createdAt: Date.now() - 6e6 },
  { id: "a2", time: "10:00", client: "Felix Dupont", service: services[2], barber: barbers[1], status: "done", duration: "30m", price: 40, tip: 6, createdAt: Date.now() - 5e6 },
  { id: "a3", time: "10:45", client: "Arthur Quinn", service: services[3], barber: barbers[2], status: "now", duration: "90m", price: 140, createdAt: Date.now() - 4e6 },
  { id: "a4", time: "12:30", client: "Oliver Bennett", service: services[1], barber: barbers[0], status: "upcoming", duration: "60m", price: 75, createdAt: Date.now() - 3e6 },
  { id: "a5", time: "13:45", client: "Theo Marsh", service: services[2], barber: barbers[1], status: "upcoming", duration: "30m", price: 40, createdAt: Date.now() - 2e6 },
  { id: "a6", time: "14:30", client: "Hugo Reed", service: services[0], barber: barbers[2], status: "upcoming", duration: "45m", price: 65, createdAt: Date.now() - 1e6 },
  { id: "a7", time: "15:30", client: "Lucas Ferrer", service: services[1], barber: barbers[0], status: "upcoming", duration: "60m", price: 75, createdAt: Date.now() - 5e5 },
  { id: "a8", time: "17:00", client: "Sebastian Cole", service: services[3], barber: barbers[1], status: "upcoming", duration: "90m", price: 140, createdAt: Date.now() - 1e5 },
];

type State = {
  appointments: Appointment[];
  history: Appointment[];
  add: (a: Omit<Appointment, "id" | "createdAt">) => Appointment;
  confirm: (id: string) => void;
  complete: (id: string) => void;
  cancel: (id: string) => void;
  occupiedSlots: () => string[];
  openSlotsCount: () => number;
};

export const useAppointments = create<State>((set, get) => ({
  appointments: seed,
  history: [],
  add: (a) => {
    const appt: Appointment = { ...a, id: `a${Date.now()}`, createdAt: Date.now() };
    set((s) => ({ appointments: [...s.appointments, appt] }));
    return appt;
  },
  confirm: (id) =>
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "now" } : a)),
    })),
  complete: (id) =>
    set((s) => {
      const appt = s.appointments.find((a) => a.id === id);
      if (!appt) return s;
      const finished = { ...appt, status: "done" as AppointmentStatus };
      return {
        appointments: s.appointments.filter((a) => a.id !== id),
        history: [finished, ...s.history],
      };
    }),
  cancel: (id) =>
    set((s) => ({
      appointments: s.appointments.filter((a) => a.id !== id),
    })),
  occupiedSlots: () => get().appointments.map((a) => a.time),
  openSlotsCount: () => {
    const occupied = new Set(get().appointments.map((a) => a.time));
    return timeSlots.filter((t) => !occupied.has(t)).length;
  },
}));
