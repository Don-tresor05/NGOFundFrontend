import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CurrencyConverterProps {
  amount: number;
  fromCurrency?: string;
  onChange?: (baseAmount: number, rate: number) => void;
}

export function CurrencyConverter({ amount, fromCurrency = 'USD', onChange }: CurrencyConverterProps) {
  const [converting, setConverting] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    if (amount && fromCurrency !== 'RWF') {
      convertCurrency();
    }
  }, [amount, fromCurrency]);

  const convertCurrency = async () => {
    setConverting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/currency-rates/convert/?from=${fromCurrency}&to=RWF&amount=${amount}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Conversion failed');

      const data = await response.json();
      setConvertedAmount(data.converted_amount);
      setRate(data.rate);
      onChange?.(data.converted_amount, data.rate);
    } catch (err) {
      console.error('Currency conversion error:', err);
    } finally {
      setConverting(false);
    }
  };

  if (fromCurrency === 'RWF') {
    return null;
  }

  return (
    <div className="bg-blue-50 p-3 rounded-lg text-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{fromCurrency} {amount.toLocaleString()}</span>
          {convertedAmount && (
            <>
              <span className="mx-2">→</span>
              <span className="font-semibold text-blue-600">RWF {convertedAmount.toLocaleString()}</span>
            </>
          )}
        </div>
        <button onClick={convertCurrency} disabled={converting} className="text-blue-600">
          <RefreshCw size={16} className={converting ? 'animate-spin' : ''} />
        </button>
      </div>
      {rate && <p className="text-xs text-gray-600 mt-1">Rate: 1 {fromCurrency} = {rate} RWF</p>}
    </div>
  );
}
