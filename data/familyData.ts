
import { FamilyMember, Task, Reward } from '@/types/family';

export const initialFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Mama',
    role: 'parent',
    coins: 0,
    color: '#F5D9CF',
  },
  {
    id: '2',
    name: 'Papa',
    role: 'parent',
    coins: 0,
    color: '#C8D3C0',
  },
  {
    id: '3',
    name: 'Emma',
    role: 'child',
    coins: 25,
    color: '#D5A093',
  },
  {
    id: '4',
    name: 'Lucas',
    role: 'child',
    coins: 18,
    color: '#CBA85B',
  },
];

export const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Bed opmaken',
    icon: 'bed',
    coins: 2,
    assignedTo: '3',
    completed: false,
    repeatType: 'daily',
    completedCount: 12,
    createdBy: '1',
  },
  {
    id: '2',
    name: 'Tanden poetsen',
    icon: 'water-drop',
    coins: 1,
    assignedTo: '3',
    completed: false,
    repeatType: 'daily',
    completedCount: 28,
    createdBy: '1',
  },
  {
    id: '3',
    name: 'Huiswerk maken',
    icon: 'book',
    coins: 5,
    assignedTo: '3',
    completed: false,
    repeatType: 'daily',
    completedCount: 15,
    createdBy: '1',
  },
  {
    id: '4',
    name: 'Speelgoed opruimen',
    icon: 'toys',
    coins: 3,
    assignedTo: '4',
    completed: false,
    repeatType: 'daily',
    completedCount: 8,
    createdBy: '2',
  },
  {
    id: '5',
    name: 'Tafel dekken',
    icon: 'restaurant',
    coins: 2,
    assignedTo: '4',
    completed: false,
    repeatType: 'daily',
    completedCount: 10,
    createdBy: '2',
  },
];

export const initialRewards: Reward[] = [
  {
    id: '1',
    name: 'Speeltuin uitje',
    icon: 'park',
    cost: 20,
    description: 'Een middag naar de speeltuin',
  },
  {
    id: '2',
    name: 'IJsje',
    icon: 'icecream',
    cost: 5,
    description: 'Een lekker ijsje',
  },
  {
    id: '3',
    name: 'Filmmiddag',
    icon: 'movie',
    cost: 15,
    description: 'Een film kijken met popcorn',
  },
  {
    id: '4',
    name: 'Extra speeltijd',
    icon: 'sports-esports',
    cost: 10,
    description: '30 minuten extra speeltijd',
  },
  {
    id: '5',
    name: 'Zwembad bezoek',
    icon: 'pool',
    cost: 25,
    description: 'Een dagje naar het zwembad',
  },
];
