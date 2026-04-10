// Simple in-memory database for pet data
// In a real app, this would use IndexedDB or another storage mechanism

interface PetData {
  id: string;
  name: string;
  level: number;
  experience: number;
  form: string;
  personality: string[];
  stats: {
    happiness: number;
    hunger: number;
    health: number;
    energy: number;
    sleep: number;
    play: number;
    love: number;
    chat: number;
    knowledge: number;
  };
  inventory: any[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  petId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const pets: Record<string, PetData> = {};
const chatMessages: ChatMessage[] = [];

export async function getPet(id: string): Promise<PetData | null> {
  return pets[id] || null;
}

export async function savePet(pet: PetData): Promise<void> {
  pets[pet.id] = pet;
}

export async function addChatMessage(petId: string, role: 'user' | 'assistant', content: string): Promise<void> {
  const message: ChatMessage = {
    id: Math.random().toString(36).substring(2, 15),
    petId,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
  chatMessages.push(message);
}

export async function getChatHistory(petId: string): Promise<{ role: string; content: string; timestamp: string }[]> {
  return chatMessages
    .filter((m) => m.petId === petId)
    .map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));
}
