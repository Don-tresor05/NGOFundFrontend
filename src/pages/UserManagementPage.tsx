import { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { ACTORS, ACTOR_FORM_FIELDS } from '../constants/appModel';
import { Actor, Role } from '../types';

const actorToRole: Record<Actor, Role> = {
  super_administrator: 'SUPER_ADMIN',
  finance_officer: 'FINANCE_OFFICER',
  field_staff: 'FIELD_STAFF',
  project_manager: 'PROJECT_MANAGER',
  executive_director: 'EXECUTIVE_DIRECTOR',
  external_auditor: 'EXTERNAL_AUDITOR',
  donor_user: 'DONOR_USER',
};

const STAFF_ACTORS = ACTORS.filter(a => a.id !== 'donor_user');

export default function UserManagementPage() {
  const currentProfile = useAuthStore((state) => state.currentProfile);
  const [selectedActor, setSelectedActor] = useState<Actor>('finance_officer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [roleValues, setRoleValues] = useState<Record<string, string>>({});

  const actorDefinition = ACTORS.find((a) => a.id === selectedActor)!;
  const actorFields = ACTOR_FORM_FIELDS[selectedActor];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('ngofund_access_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: name,
          email,
          password,
          role: actorToRole[selectedActor],
          phone,
          department,
          location,
          is_active: true,
          ...roleValues,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Staff account created successfully!' });
        setName('');
        setEmail('');
        setPhone('');
        setLocation('');
        setDepartment('');
        setPassword('');
        setRoleValues({});
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'Failed to create account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentProfile?.actor !== 'super_administrator') {
    return (
      <div className="p-8">
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center">
          <h2 className="text-xl font-bold text-rose-900">Access Denied</h2>
          <p className="mt-2 text-rose-700">Only Super Administrators can create staff accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
        <p className="mt-2 text-slate-600">Create staff accounts with specific roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Select Role</h2>
            <div className="space-y-2">
              {STAFF_ACTORS.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => {
                    setSelectedActor(actor.id);
                    setRoleValues({});
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedActor === actor.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{actor.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{actor.shortLabel}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div
              className="mb-6 p-4 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${actorDefinition.accentColor}15 0%, ${actorDefinition.accentColor}05 100%)` }}
            >
              <h2 className="text-xl font-bold text-slate-900">{actorDefinition.label}</h2>
              <p className="text-sm text-slate-600 mt-1">{actorDefinition.registrationSummary}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-group">
                  <span className="form-label">Full Name *</span>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <label className="form-group">
                  <span className="form-label">Email *</span>
                  <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <label className="form-group">
                  <span className="form-label">Phone</span>
                  <input className="form-control" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">Location</span>
                  <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">Department</span>
                  <input className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">Password *</span>
                  <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={10} required />
                </label>

                {actorFields.map((field) => (
                  <label key={field.key} className="form-group">
                    <span className="form-label">{field.label}</span>
                    {field.type === 'select' ? (
                      <select className="form-control" value={roleValues[field.key] || ''} onChange={(e) => setRoleValues({ ...roleValues, [field.key]: e.target.value })}>
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input className="form-control" type={field.type} value={roleValues[field.key] || ''} placeholder={field.placeholder} onChange={(e) => setRoleValues({ ...roleValues, [field.key]: e.target.value })} />
                    )}
                  </label>
                ))}
              </div>

              {message && (
                <div className={`rounded-xl p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                  {message.text}
                </div>
              )}

              <Button type="submit" block disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Staff Account'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
