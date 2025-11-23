
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FamilyMember, Task, Reward } from '@/types/family';
import { initialFamilyMembers, initialTasks, initialRewards } from '@/data/familyData';

interface FamilyContextType {
  familyMembers: FamilyMember[];
  tasks: Task[];
  rewards: Reward[];
  selectedChild: FamilyMember | null;
  setSelectedChild: (child: FamilyMember | null) => void;
  completeTask: (taskId: string) => void;
  addCoins: (memberId: string, amount: number) => void;
  redeemReward: (memberId: string, rewardId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [rewards] = useState<Reward[]>(initialRewards);
  const [selectedChild, setSelectedChild] = useState<FamilyMember | null>(null);

  const completeTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId && !task.completed) {
          // Add coins to the assigned family member
          addCoins(task.assignedTo, task.coins);
          return {
            ...task,
            completed: true,
            completedCount: task.completedCount + 1,
          };
        }
        return task;
      })
    );
  };

  const addCoins = (memberId: string, amount: number) => {
    setFamilyMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId
          ? { ...member, coins: member.coins + amount }
          : member
      )
    );
  };

  const redeemReward = (memberId: string, rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const member = familyMembers.find(m => m.id === memberId);
    if (!member || member.coins < reward.cost) return;

    setFamilyMembers(prevMembers =>
      prevMembers.map(m =>
        m.id === memberId
          ? { ...m, coins: m.coins - reward.cost }
          : m
      )
    );
  };

  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  return (
    <FamilyContext.Provider
      value={{
        familyMembers,
        tasks,
        rewards,
        selectedChild,
        setSelectedChild,
        completeTask,
        addCoins,
        redeemReward,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
