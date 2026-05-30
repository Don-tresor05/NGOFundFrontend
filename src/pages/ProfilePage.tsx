import { FormEvent, useMemo, useState } from 'react';
import { AppHeader, Button } from '../components';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: currentProfile?.name ?? '',
    email: currentProfile?.email ?? '',
    phone: currentProfile?.phone ?? '',
    department: currentProfile?.department ?? '',
    location: currentProfile?.location ?? '',
  }));

  const title = useMemo(() => 'Update User Profile', []);

  if (!currentProfile) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateProfile(formData);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  return (
    <>
      <AppHeader title={title} summary="Maintain your account identity, contact details, and actor-facing presence." />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel-card">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
              {currentProfile.avatarText}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{currentProfile.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{currentProfile.email}</p>
              <p className="mt-2 text-sm text-slate-500">{currentProfile.location}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="metric-tile">
              <span className="eyebrow">Actor</span>
              <strong>{currentProfile.actor.replace(/_/g, ' ')}</strong>
            </div>
            <div className="metric-tile">
              <span className="eyebrow">Department</span>
              <strong>{currentProfile.department}</strong>
            </div>
          </div>
        </div>

        <div className="panel-card">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="form-group">
              <span className="form-label">Full Name</span>
              <input
                className="form-control"
                value={formData.name}
                onChange={(event) => setFormData((state) => ({ ...state, name: event.target.value }))}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Email</span>
              <input
                className="form-control"
                value={formData.email}
                onChange={(event) => setFormData((state) => ({ ...state, email: event.target.value }))}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Phone</span>
              <input
                className="form-control"
                value={formData.phone}
                onChange={(event) => setFormData((state) => ({ ...state, phone: event.target.value }))}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Department</span>
              <input
                className="form-control"
                value={formData.department}
                onChange={(event) => setFormData((state) => ({ ...state, department: event.target.value }))}
              />
            </label>
            <label className="form-group md:col-span-2">
              <span className="form-label">Location</span>
              <input
                className="form-control"
                value={formData.location}
                onChange={(event) => setFormData((state) => ({ ...state, location: event.target.value }))}
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit">Save Profile Updates</Button>
              {saved ? <span className="text-sm font-semibold text-emerald-700">Profile updated in the backend.</span> : null}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
