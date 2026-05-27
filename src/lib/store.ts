import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { barbers, services as initialServices, timeSlots, type Barber, type Service } from "./data";

export type AppointmentStatus = "upcoming" | "now" | "done" | "cancelled" | "pending";

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
  snapshotUrl?: string;
};

export type ClientNote = {
  id: string;
  text: string;
  timestamp: number;
};

import c1 from "@/assets/chronicle-1.png";
import c2 from "@/assets/chronicle-2.png";

const seed: Appointment[] = [
  { id: "a1", time: "09:00", client: "James Carter", service: initialServices[0], barber: barbers[0], status: "done", duration: "45m", price: 65, tip: 10, createdAt: Date.now() - 6e6, snapshotUrl: c1 },
  { id: "a2", time: "10:00", client: "James Carter", service: initialServices[2], barber: barbers[1], status: "done", duration: "30m", price: 40, tip: 6, createdAt: Date.now() - 5e6, snapshotUrl: c2 },
  { id: "a3", time: "10:45", client: "Arthur Quinn", service: initialServices[3], barber: barbers[2], status: "now", duration: "90m", price: 140, createdAt: Date.now() - 4e6 },
  { id: "a4", time: "12:30", client: "Oliver Bennett", service: initialServices[1], barber: barbers[0], status: "upcoming", duration: "60m", price: 75, createdAt: Date.now() - 3e6 },
  { id: "a5", time: "13:45", client: "Theo Marsh", service: initialServices[2], barber: barbers[1], status: "upcoming", duration: "30m", price: 40, createdAt: Date.now() - 2e6 },
  { id: "a6", time: "14:30", client: "Hugo Reed", service: initialServices[0], barber: barbers[2], status: "upcoming", duration: "45m", price: 65, createdAt: Date.now() - 1e6 },
  { id: "a7", time: "15:30", client: "Lucas Ferrer", service: initialServices[1], barber: barbers[0], status: "upcoming", duration: "60m", price: 75, createdAt: Date.now() - 5e5 },
  { id: "a8", time: "17:00", client: "Sebastian Cole", service: initialServices[3], barber: barbers[1], status: "upcoming", duration: "90m", price: 140, createdAt: Date.now() - 1e5 },
  { id: "a9", time: "16:15", client: "David Mercer", service: initialServices[1], barber: barbers[0], status: "pending", duration: "60m", price: 75, createdAt: Date.now() - 50000 },
  { id: "a10", time: "18:00", client: "Nolan Kross", service: initialServices[2], barber: barbers[2], status: "pending", duration: "30m", price: 40, createdAt: Date.now() - 10000 },
];

const initialNotes: Record<string, ClientNote[]> = {
  "James Carter": [
    { id: "n1", text: "Prefers silent appointments", timestamp: Date.now() - 10e7 },
    { id: "n2", text: "Allergic to specific alcohol-based pomades", timestamp: Date.now() - 5e7 }
  ],
  "Arthur Quinn": [
    { id: "n3", text: "Signature low skin fade stylist customization", timestamp: Date.now() - 8e7 }
  ]
};

type State = {
  appointments: Appointment[];
  history: Appointment[];
  services: Service[];
  clientNotes: Record<string, ClientNote[]>;
  add: (a: Omit<Appointment, "id" | "createdAt">) => Appointment;
  confirm: (id: string) => void;
  accept: (id: string) => void;
  decline: (id: string) => void;
  complete: (id: string) => void;
  cancel: (id: string) => void;
  addNote: (clientName: string, text: string) => void;
  deleteNote: (clientName: string, id: string) => void;
  addService: (s: Omit<Service, "id">) => void;
  updateService: (id: string, s: Partial<Service>) => void;
  deleteService: (id: string) => void;
  occupiedSlots: () => string[];
  openSlotsCount: () => number;
};

export const useAppointments = create<State>()(
  persist(
    (set, get) => ({
      appointments: seed.filter(a => a.status !== "done"),
      history: seed.filter(a => a.status === "done"),
      services: initialServices,
      clientNotes: initialNotes,
      add: (a) => {
        const appt: Appointment = { ...a, id: `a${Date.now()}`, createdAt: Date.now() };
        set((s) => ({ appointments: [...s.appointments, appt] }));
        return appt;
      },
      confirm: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "now" } : a)),
        })),
      accept: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "upcoming" } : a)),
        })),
      decline: (id) =>
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
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
      addNote: (clientName, text) =>
        set((s) => {
          const notes = s.clientNotes[clientName] || [];
          const newNote: ClientNote = { id: `n${Date.now()}`, text, timestamp: Date.now() };
          return {
            clientNotes: {
              ...s.clientNotes,
              [clientName]: [newNote, ...notes],
            },
          };
        }),
      deleteNote: (clientName, id) =>
        set((s) => {
          const notes = s.clientNotes[clientName] || [];
          return {
            clientNotes: {
              ...s.clientNotes,
              [clientName]: notes.filter((n) => n.id !== id),
            },
          };
        }),
      addService: (s) =>
        set((state) => ({
          services: [...state.services, { ...s, id: `s${Date.now()}` }],
        })),
      updateService: (id, updated) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...updated } : s)),
        })),
      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),
      occupiedSlots: () => get().appointments.map((a) => a.time),
      openSlotsCount: () => {
        const occupied = new Set(get().appointments.map((a) => a.time));
        return timeSlots.filter((t) => !occupied.has(t)).length;
      },
    }),
    {
      name: "crown-appointments-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        appointments: s.appointments,
        history: s.history,
        services: s.services,
        clientNotes: s.clientNotes,
      }),
    }
  )
);
