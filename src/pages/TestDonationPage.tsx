import { useState, useEffect } from 'react';
import { apiRequest, apiList } from '../lib/api';

interface Donor {
  id: number;
  organization_name: string;
  contact_email: string;
}

export function TestDonationPage() {
  const [amount, setAmount] = useState('50');
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<number>(1);

  useEffect(() => {
    apiList<Donor>('/donors/')
      .then(setDonors)
      .catch(console.error);
  }, []);

  const handleDonate = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ checkout_url: string; session_id: string }>('/payments/create-checkout-session/', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          donor_id: selectedDonor,
          donation_type: 'one-time'
        })
      });
      if (!response || !response.checkout_url) {
        alert('Error: No checkout URL in response. Check console.');
        setLoading(false);
        return;
      }

      window.location.href = response.checkout_url;
    } catch (error: any) {
      alert('Failed: ' + (error?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Test Donation</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Donor</label>
          <select
            value={selectedDonor}
            onChange={(e) => setSelectedDonor(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            {donors.map(d => (
              <option key={d.id} value={d.id}>
                {d.organization_name} ({d.contact_email})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="1"
          />
        </div>

        <button
          onClick={handleDonate}
          disabled={loading || !donors.length}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Donate with Stripe'}
        </button>

        <div className="mt-6 p-4 bg-yellow-50 rounded text-sm">
          <p className="font-semibold mb-2">Test Card Numbers:</p>
          <p className="mb-1">✅ Success: <code>4242 4242 4242 4242</code></p>
          <p className="mb-1">❌ Decline: <code>4000 0000 0000 0002</code></p>
          <p className="text-gray-600 mt-2">Use any future date and any CVC</p>
        </div>
      </div>
    </div>
  );
}
