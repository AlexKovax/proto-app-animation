import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export type ToolId = 'dashboard' | 'participants' | 'timer' | 'icebreaker' | 'vote' | 'stickies';

export interface Participant {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
}

const PARTICIPANT_COLORS = ['#FFE600', '#FF6B6B', '#4ECDC4', '#7C4DFF', '#FF9500', '#00C7BE', '#FF2D92', '#0066FF'];

function loadParticipants(): Participant[] {
  try {
    const raw = localStorage.getItem('cockpit_participants');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveParticipants(participants: Participant[]) {
  localStorage.setItem('cockpit_participants', JSON.stringify(participants));
}

function nextColor(participants: Participant[]): string {
  const used = participants.map(p => p.color);
  const available = PARTICIPANT_COLORS.filter(c => !used.includes(c));
  return available[0] || PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length];
}

interface AppState {
  currentTool: ToolId;
  participants: Participant[];
  navigateTo: (tool: ToolId) => void;
  addParticipant: (name: string) => void;
  updateParticipant: (id: string, name: string) => void;
  removeParticipant: (id: string) => void;
  reorderParticipants: (from: number, to: number) => void;
  clearParticipants: () => void;
  setParticipantEmoji: (id: string, emoji: string) => void;
}

export const useStore = create<AppState>((set) => ({
  currentTool: 'dashboard',
  participants: loadParticipants(),

  navigateTo: (tool) => set({ currentTool: tool }),

  addParticipant: (name) =>
    set((state) => {
      const person: Participant = {
        id: uuid(),
        name: name.trim(),
        color: nextColor(state.participants),
      };
      const updated = [...state.participants, person];
      saveParticipants(updated);
      return { participants: updated };
    }),

  updateParticipant: (id, name) =>
    set((state) => {
      const updated = state.participants.map((p) =>
        p.id === id ? { ...p, name: name.trim() } : p
      );
      saveParticipants(updated);
      return { participants: updated };
    }),

  removeParticipant: (id) =>
    set((state) => {
      const updated = state.participants.filter((p) => p.id !== id);
      saveParticipants(updated);
      return { participants: updated };
    }),

  reorderParticipants: (from, to) =>
    set((state) => {
      const list = [...state.participants];
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      saveParticipants(list);
      return { participants: list };
    }),

  clearParticipants: () =>
    set(() => {
      saveParticipants([]);
      return { participants: [] };
    }),

  setParticipantEmoji: (id, emoji) =>
    set((state) => {
      const updated = state.participants.map((p) =>
        p.id === id ? { ...p, emoji: emoji || undefined } : p
      );
      saveParticipants(updated);
      return { participants: updated };
    }),
}));
