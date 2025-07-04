import { useCurrency } from '@/hooks/useCurrency';

interface PurchaseTickerProps {
  totalCost: number;
}

export const PurchaseTicker = ({ totalCost }: PurchaseTickerProps) => {
  const { formatCurrency } = useCurrency();

  const purchases = [
    { item: 'cups of coffee', price: 5 },
    { item: 'fast food meals', price: 12 },
    { item: 'movie tickets', price: 15 },
    { item: 'lunch meals', price: 18 },
    { item: 'books', price: 25 },
    { item: 'streaming subscriptions', price: 15 },
    { item: 'gas fill-ups', price: 60 },
    { item: 'dinner meals', price: 35 },
    { item: 'phone cases', price: 30 },
    { item: 'bottles of wine', price: 20 },
  ];

  const getAffordableItems = () => {
    if (totalCost < 1) return [];
    
    return purchases
      .filter(purchase => totalCost >= purchase.price)
      .map(purchase => ({
        ...purchase,
        quantity: Math.floor(totalCost / purchase.price)
      }))
      .filter(item => item.quantity > 0)
      .slice(0, 6); // Show max 6 items
  };

  const affordableItems = getAffordableItems();

  if (totalCost < 1) {
    return (
      <div className="bg-slate-900 text-white py-4 overflow-hidden border border-slate-700">
        <div className="relative">
          <div className="text-center">
            <span className="text-slate-400 text-sm font-medium">
              Start the timer to see what this meeting could buy instead...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (affordableItems.length === 0) {
    return (
      <div className="bg-slate-900 text-white py-4 overflow-hidden border border-slate-700">
        <div className="relative">
          <div className="text-center">
            <span className="text-slate-400 text-sm font-medium">
              {formatCurrency(totalCost)} - Keep the meeting running to see purchase comparisons...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white py-4 overflow-hidden border-4 border-taxi-400 border-t-0">
      <div className="bg-taxi-400 text-slate-900 px-4 py-1 text-xs font-bold tracking-wider text-center">
        METER COMPARISON • WHAT THIS MEETING COULD BUY INSTEAD
      </div>
      <div className="relative py-3">
        <div className="animate-scroll whitespace-nowrap">
          <span className="inline-flex items-center gap-8 text-sm font-medium">
            <span className="text-taxi-400 font-bold tracking-wide">
              🚕 FARE: {formatCurrency(totalCost)} =
            </span>
            {affordableItems.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                <span className="text-lcd-400 font-bold">{item.quantity}</span>
                <span className="text-slate-200">{item.item}</span>
                <span className="text-slate-500">•</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {affordableItems.map((item, index) => (
              <span key={`dup-${index}`} className="inline-flex items-center gap-2">
                <span className="text-lcd-400 font-bold">{item.quantity}</span>
                <span className="text-slate-200">{item.item}</span>
                <span className="text-slate-500">•</span>
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};