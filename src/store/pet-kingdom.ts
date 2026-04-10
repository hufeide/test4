import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePetStore } from './pet';

interface PetStatus {
  name: string;
  friendship: number;
  happiness: number;
  hunger: number;
  health: number;
  energy: number;
  sleep: number;
  play: number;
  love: number;
  chat: number;
  knowledge: number;
}

export const usePetKingdomStore = defineStore('petKingdom', () => {
  const petStore = usePetStore();

  const petStatus = computed<PetStatus>(() => {
    const stats = petStore.pet.value.stats;
    return {
      name: petStore.pet.value.name,
      friendship: petStore.pet.value.level * 20 + Math.floor(stats.happiness / 5),
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
      energy: stats.energy,
      sleep: 100, // Placeholder - would need to track sleep specifically
      play: 100, // Placeholder - would need to track play specifically
      love: stats.happiness, // Reuse happiness as love
      chat: 100, // Placeholder - would need to track chat specifically
      knowledge: 100, // Placeholder - would need to track knowledge specifically
    };
  });

  const petRequest = computed(() => {
    const stats = petStatus.value;
    if (stats.hunger < 30) return 'I am hungry! Please feed me.';
    if (stats.energy < 30) return 'I am tired! Let me rest.';
    if (stats.happiness < 30) return 'I am lonely! Play with me.';
    if (stats.health < 30) return 'I am sick! Please help me.';
    return '';
  });

  function requestNeedFulfillment() {
    const stats = petStatus.value;
    if (stats.hunger < 30) {
      petStore.pet.value.stats.hunger = Math.min(100, stats.hunger + 30);
      petStore.pet.value.stats.health = Math.min(100, stats.health + 5);
    } else if (stats.energy < 30) {
      petStore.pet.value.stats.energy = Math.min(100, stats.energy + 30);
      petStore.pet.value.stats.hunger = Math.max(0, stats.hunger - 10);
    } else if (stats.happiness < 30) {
      petStore.pet.value.stats.happiness = Math.min(100, stats.happiness + 30);
      petStore.pet.value.stats.love = Math.min(100, stats.love + 10);
    } else if (stats.health < 30) {
      petStore.pet.value.stats.health = Math.min(100, stats.health + 30);
      petStore.pet.value.stats.happiness = Math.min(100, stats.happiness + 5);
    }
    petStore.saveToDB();
  }

  return {
    petStatus,
    petRequest,
    requestNeedFulfillment,
  };
});
