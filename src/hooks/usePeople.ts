import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { readPeopleFile, writePeopleFile } from '../lib/github-storage';
import type { Person, PeopleFile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UsePeopleState {
  people: Person[];
  isLoading: boolean;
  error: Error | null;
}

export function usePeople() {
  const { gitHubToken, gitHubUsername, gitHubRepo } = useAuth();
  const [state, setState] = useState<UsePeopleState>({
    people: [],
    isLoading: true,
    error: null,
  });

  // Load people from GitHub on mount
  useEffect(() => {
    if (!gitHubToken || !gitHubUsername || !gitHubRepo) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    loadPeople();
  }, [gitHubToken, gitHubUsername, gitHubRepo]);

  const loadPeople = useCallback(async () => {
    if (!gitHubToken || !gitHubUsername || !gitHubRepo) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const data = await readPeopleFile(gitHubToken, gitHubUsername, gitHubRepo);
      setState((prev) => ({ ...prev, people: data.people, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Unknown error'),
        isLoading: false,
      }));
    }
  }, [gitHubToken, gitHubUsername, gitHubRepo]);

  const savePeople = useCallback(
    async (people: Person[]) => {
      if (!gitHubToken || !gitHubUsername || !gitHubRepo) {
        throw new Error('GitHub credentials not available');
      }

      try {
        const data: PeopleFile = {
          schemaVersion: 1,
          people,
        };
        await writePeopleFile(gitHubToken, gitHubUsername, gitHubRepo, data);
        setState((prev) => ({ ...prev, people, error: null }));
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState((prev) => ({ ...prev, error: err }));
        throw err;
      }
    },
    [gitHubToken, gitHubUsername, gitHubRepo]
  );

  const addPerson = useCallback(
    async (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newPerson: Person = {
        ...person,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPeople = [...state.people, newPerson];
      await savePeople(updatedPeople);
      return newPerson;
    },
    [state.people, savePeople]
  );

  const updatePerson = useCallback(
    async (id: string, updates: Partial<Person>) => {
      const updatedPeople = state.people.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      await savePeople(updatedPeople);
    },
    [state.people, savePeople]
  );

  const deletePerson = useCallback(
    async (id: string) => {
      const updatedPeople = state.people.filter((p) => p.id !== id);
      await savePeople(updatedPeople);
    },
    [state.people, savePeople]
  );

  const getPerson = useCallback(
    (id: string) => {
      return state.people.find((p) => p.id === id);
    },
    [state.people]
  );

  return {
    people: state.people,
    isLoading: state.isLoading,
    error: state.error,
    addPerson,
    updatePerson,
    deletePerson,
    getPerson,
    loadPeople,
  };
}
