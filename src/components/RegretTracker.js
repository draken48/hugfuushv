import React from 'react';
import { ThumbsDown, TrendingDown, Brain, AlertCircle } from 'lucide-react';

const RegretTracker = ({ expenses, regretedPurchases, setRegretedPurchases, currencySymbol, darkMode, cardBg, borderColor }) => {
  
  const markAsRegret = (expense) => {
    if (!regretedPurchases.find(r => r.id === expense.id)) {
      setRegretedPurchases([...regretedPurchases, { 
        ...expense, 
        regretDate: new Date().toISOString(),
        reason: ''
      }]);
    }
  };

  const unmarkRegret = (id) => {
    setRegretedPurchases(regretedPurchases.filter(r => r.id !== id));
  };

  const totalRegretAmount = regretedPurchases.reduce((sum, r) => sum + r.amount, 0);
  
  // Analyze regret patterns
  const regretPatterns = regretedPurchases.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  
  const topRegretCategory = Object.entries(regretPatterns).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ThumbsDown className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-2xl font-bold">Regret Tracker</h2>
          <p className="text-sm opacity-70">Learn from past mistakes to make better decisions</p>
        </div>
      </div>

      {/* Regret Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <TrendingDown className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm opacity-70">Total Regretted</p>
          <p className="text-3xl font-bold text-red-500">{currencySymbol}{totalRegretAmount.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-1">{regretedPurchases.length} purchases</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <Brain className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm opacity-70">Most Regretted Category</p>
          <p className="text-2xl font-bold text-purple-500">{topRegretCategory?.[0] || 'None'}</p>
          <p className="text-xs opacity-70 mt-1">{topRegretCategory?.[1] || 0} times</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-sm opacity-70">Regret Rate</p>
          <p className="text-3xl font-bold text-yellow-500">
            {expenses.length > 0 ? ((regretedPurchases.length / expenses.length) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs opacity-70 mt-1">of all purchases</p>
        </div>
      </div>

      {/* AI Insights */}
      {regretedPurchases.length > 0 && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 ${borderColor}`}>
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">🧠 AI Insight: Learning from Regrets</h3>
              <ul className="space-y-2 text-sm">
                {topRegretCategory && (
                  <li>• You regret {topRegretCategory[0]} purchases most often. Consider setting stricter limits for this category.</li>
                )}
                <li>• You could have saved {currencySymbol}{totalRegretAmount.toFixed(2)} by avoiding these purchases.</li>
                <li>• Before buying, ask yourself: "Will I regret this in a week?"</li>
                {regretedPurchases.filter(r => r.mood === 'sad').length > 0 && (
                  <li>• You tend to regret purchases made when feeling down. Use the 24-hour rule for emotional purchases.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Regretted Purchases List */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Regretted Purchases</h3>
        {regretedPurchases.length === 0 ? (
          <p className="text-center py-12 opacity-50">
            No regrets yet! Keep making wise financial decisions. 🎯
          </p>
        ) : (
          <div className="space-y-3">
            {regretedPurchases.map(regret => (
              <div key={regret.id} className={`p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      {regret.description}
                    </h4>
                    <div className="flex gap-3 text-sm opacity-70 mt-1">
                      <span>{regret.category}</span>
                      <span>•</span>
                      <span>{new Date(regret.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-red-500 font-semibold">{currencySymbol}{regret.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => unmarkRegret(regret.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses to Mark as Regret */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Recent Purchases - Mark as Regret</h3>
        <div className="space-y-3">
          {expenses.filter(e => !regretedPurchases.find(r => r.id === e.id)).slice(0, 10).map(expense => (
            <div key={expense.id} className={`p-4 rounded-lg border ${borderColor} flex items-center justify-between`}>
              <div>
                <h4 className="font-semibold">{expense.description}</h4>
                <div className="flex gap-3 text-sm opacity-70">
                  <span>{expense.category}</span>
                  <span>•</span>
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{currencySymbol}{expense.amount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => markAsRegret(expense)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Regret This
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">💡 Avoiding Future Regrets</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong>24-Hour Rule:</strong> Wait 24 hours before making non-essential purchases over ${50}</li>
          <li>• <strong>Need vs Want:</strong> Ask yourself if you really need it or just want it</li>
          <li>• <strong>Cost per Use:</strong> Calculate how many times you'll use it. More uses = better value</li>
          <li>• <strong>Budget Check:</strong> Can you afford it without breaking your budget?</li>
          <li>• <strong>Emotional State:</strong> Never shop when you're sad, angry, or stressed</li>
          <li>• <strong>Research:</strong> Read reviews and compare prices before buying</li>
        </ul>
      </div>
    </div>
  );
};

export default RegretTracker;