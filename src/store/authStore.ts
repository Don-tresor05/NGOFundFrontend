import { create } from 'zustand';
import { ACTORS } from '../constants/appModel';
import { apiRequest, tokenStorage } from '../lib/api';
import { useAppDataStore } from './appDataStore';
import {
  Actor,
  PasswordResetRequestResponse,
  Profile,
  Role,
  SignupRegistrationResponse,
  SignupVerificationResponse,
} from '../types';

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
  loginError: string | null;
  authReady: boolean;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<SignupRegistrationResponse>;
  updateProfile: (payload: Partial<Profile>) => Promise<void>;
  hydrateProfile: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResponse>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<string>;
  verifySignupOtp: (email: string, otp: string) => Promise<SignupVerificationResponse>;
  verifySignupToken: (token: string) => Promise<SignupVerificationResponse>;
  resendSignupOtp: (email: string) => Promise<SignupRegistrationResponse>;
}

interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  phone: string;
  department: string;
  location: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

const roleToActor: Record<Role, Actor> = {
  SUPER_ADMIN: 'super_administrator',
  FINANCE_OFFICER: 'finance_officer',
  FIELD_STAFF: 'field_staff',
  PROJECT_MANAGER: 'project_manager',
  EXECUTIVE_DIRECTOR: 'executive_director',
  EXTERNAL_AUDITOR: 'external_auditor',
  DONOR_USER: 'donor_user',
};

const actorToRole: Record<Actor, Role> = {
  super_administrator: 'SUPER_ADMIN',
  finance_officer: 'FINANCE_OFFICER',
  field_staff: 'FIELD_STAFF',
  project_manager: 'PROJECT_MANAGER',
  executive_director: 'EXECUTIVE_DIRECTOR',
  external_auditor: 'EXTERNAL_AUDITOR',
  donor_user: 'DONOR_USER',
};

const resetApplicationData = () => {
  useAppDataStore.getState().resetData();
};

const isJwtExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    if (!payload.exp) {
      return false;
    }
    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

const toProfileFromUser = (user: ApiUser): Profile => {
  const actor = roleToActor[user.role];
  const actorDefinition = ACTORS.find((entry) => entry.id === actor);

  return {
    id: String(user.id),
    name: user.full_name,
    email: user.email,
    actor,
    phone: user.phone || '+250 788 000 000',
    department: user.department || actorDefinition?.shortLabel || 'Operations',
    location: user.location || 'Kigali, Rwanda',
    avatarText: user.full_name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    metadata: {},
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: Boolean(tokenStorage.access),
  currentProfile: null,
  loginError: null,
  authReady: !tokenStorage.access,

  login: async ({ actor, email, password }) => {
    try {
      const response = await apiRequest<LoginResponse>('/auth/login/', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });

      const profile = toProfileFromUser(response.user);
      if (profile.actor !== actor) {
        set({ loginError: 'This account exists, but it does not match the selected role portal.' });
        tokenStorage.clear();
        resetApplicationData();
        return false;
      }

      tokenStorage.set(response.access, response.refresh);
      resetApplicationData();
      set({
        isAuthenticated: true,
        currentProfile: profile,
        loginError: null,
        authReady: true,
      });
      return true;
    } catch (error) {
      set({ loginError: error instanceof Error ? error.message : 'Invalid credentials for the selected actor.', authReady: true });
      return false;
    }
  },

  logout: () => {
    tokenStorage.clear();
    resetApplicationData();
    set({
      isAuthenticated: false,
      currentProfile: null,
      loginError: null,
      authReady: true,
    });
  },

  register: async ({ actor, name, email, password, metadata }) => {
    try {
      const response = await apiRequest<SignupRegistrationResponse>('/auth/register/', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          full_name: name,
          email,
          password,
          role: actorToRole[actor],
          phone: metadata.phone,
          location: metadata.location,
          department: ACTORS.find((entry) => entry.id === actor)?.shortLabel ?? '',
        }),
      });

      tokenStorage.clear();
      resetApplicationData();
      set({
        isAuthenticated: false,
        currentProfile: null,
        loginError: null,
        authReady: true,
      });
      return response;
    } catch (error) {
      set({ loginError: error instanceof Error ? error.message : 'Account registration failed.', authReady: true });
      throw error;
    }
  },

  updateProfile: async (payload) => {
    const currentProfile = get().currentProfile;
    if (!currentProfile) {
      return;
    }

    const user = await apiRequest<ApiUser>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: payload.name,
        email: payload.email,
        phone: payload.phone,
        department: payload.department,
        location: payload.location,
      }),
    });

    set({ currentProfile: toProfileFromUser(user) });
  },

  hydrateProfile: async () => {
    const accessToken = tokenStorage.access;
    if (!accessToken || isJwtExpired(accessToken)) {
      tokenStorage.clear();
      resetApplicationData();
      set({ isAuthenticated: false, currentProfile: null, authReady: true });
      return;
    }

    try {
      const user = await apiRequest<ApiUser>('/auth/profile/');
      set({ isAuthenticated: true, currentProfile: toProfileFromUser(user), authReady: true, loginError: null });
    } catch {
      tokenStorage.clear();
      resetApplicationData();
      set({ isAuthenticated: false, currentProfile: null, authReady: true });
    }
  },

  requestPasswordReset: async (email) => apiRequest<PasswordResetRequestResponse>('/users/password-reset-request/', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email }),
  }),

  verifySignupOtp: async (email, otp) => {
    const response = await apiRequest<SignupVerificationResponse>('/auth/signup/verify-otp/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, otp }),
    });

    tokenStorage.set(response.access, response.refresh);
    resetApplicationData();
    set({
      isAuthenticated: true,
      currentProfile: toProfileFromUser(response.user),
      loginError: null,
      authReady: true,
    });
    return response;
  },

  verifySignupToken: async (token) => {
    const response = await apiRequest<SignupVerificationResponse>('/auth/signup/verify-otp/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token }),
    });

    tokenStorage.set(response.access, response.refresh);
    resetApplicationData();
    set({
      isAuthenticated: true,
      currentProfile: toProfileFromUser(response.user),
      loginError: null,
      authReady: true,
    });
    return response;
  },

  resendSignupOtp: async (email) =>
    apiRequest<SignupRegistrationResponse>('/auth/signup/resend-otp/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email }),
    }),

  confirmPasswordReset: async (token, newPassword) => {
    const response = await apiRequest<{ detail: string }>('/users/password-reset-confirm/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return response.detail;
  },
}));
