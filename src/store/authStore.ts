import { create } from 'zustand';
import { ACTORS, MOCK_ACCOUNTS } from '../constants/appModel';
import { Actor, MockAccount, Profile } from '../types';

interface LoginPayload {
  actor: Actor;
  email: string;
  password: string;
}

interface RegisterPayload {
  actor: Actor;
  name: string;
  email: string;
  password: string;
  metadata: Record<string, string>;
}

interface AuthState {
  isAuthenticated: boolean;
  currentProfile: Profile | null;
  accounts: MockAccount[];
  loginError: string | null;
  login: (payload: LoginPayload) => boolean;
  logout: () => void;
  register: (payload: RegisterPayload) => void;
  updateProfile: (payload: Partial<Profile>) => void;
}

const toProfile = (account: MockAccount): Profile => {
  const actorDefinition = ACTORS.find((actor) => actor.id === account.actor);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    actor: account.actor,
    phone: account.metadata.phone ?? '+250 788 000 000',
    department: actorDefinition?.shortLabel ?? 'Operations',
    location: account.metadata.location ?? 'Kigali, Rwanda',
    avatarText: account.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    metadata: account.metadata,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  currentProfile: null,
  accounts: MOCK_ACCOUNTS,
  loginError: null,

  login: ({ actor, email, password }) => {
    const account = get().accounts.find(
      (candidate) =>
        candidate.actor === actor &&
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.password === password
    );

    if (!account) {
      set({ loginError: 'Invalid credentials for the selected actor.' });
      return false;
    }

    set({
      isAuthenticated: true,
      currentProfile: toProfile(account),
      loginError: null,
    });
    return true;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentProfile: null,
      loginError: null,
    });
  },

  register: ({ actor, name, email, password, metadata }) => {
    const account: MockAccount = {
      id: `acct-${Math.random().toString(36).slice(2, 8)}`,
      actor,
      email,
      password,
      name,
      metadata,
    };

    set((state) => ({
      accounts: [...state.accounts, account],
      isAuthenticated: true,
      currentProfile: toProfile(account),
      loginError: null,
    }));
  },

  updateProfile: (payload) => {
    const currentProfile = get().currentProfile;
    if (!currentProfile) {
      return;
    }

    const nextProfile = { ...currentProfile, ...payload };
    const nextMetadata = {
      ...currentProfile.metadata,
      phone: nextProfile.phone,
      location: nextProfile.location,
      ...nextProfile.metadata,
    };
    set((state) => ({
      currentProfile: { ...nextProfile, metadata: nextMetadata },
      accounts: state.accounts.map((account) =>
        account.id === currentProfile.id
          ? {
              ...account,
              name: nextProfile.name,
              email: nextProfile.email,
              actor: nextProfile.actor,
              metadata: nextMetadata,
            }
          : account
      ),
    }));
  },
}));
