import React, { useState } from 'react';
import { Gift, Plus, Trash2, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

const FuturePlanner = ({ futurePurchases, setFuturePurchases, currencySymbol, darkMode, cardBg, borderColor }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    currentSavings: 0,
    priority: 'medium',
    category: 'Shopping'
  });

  const addFuturePurchase = () => {
    if (!newPurchase.name || !newPurchase.targetAmount) {
      alert('Please enter purchase name and target amount');
      return;
    }

    setFuturePurchases([...futurePurchases, {
      id: Date.now(),
      ...newPurchase,
      targetAmount: parseFloat(newPurchase.targetAmount),
      createdAt: new Date().toISOString()
    }]);

    setNewPurchase({
      name: '',
      targetAmount: '',
      targetDate: '',
      currentSavings: 0,
      priority: 'medium',
      category: 'Shopping'
    });
    setShowAddForm(false);
  };

  const updateSavings = (id, amount) => {
    setFuturePurchases(futurePurchases.map(p => 
      p.id === id ? { ...p, currentSavings: parseFloat(amount) || 0 } : p
    ));
  };

  const deletePurchase = (id) => {
    if (window.confirm('Remove this future purchase?')) {
      setFuturePurchases(futurePurchases.filter(p => p.id !== id));
    }
  };

  const markAsCompleted = (id) => {
    const purchase = futurePurchases.find(p => p.id === id);
    if (purchase && purchase.currentSavings >= purchase.targetAmount) {
      alert(`🎉 Congrats! You saved enough for ${purchase.name}!`);
      deletePurchase(id);
    } else {
      alert('You need to save more before purchasing!');
    }
  };

  const totalTargetAmount = futurePurchases.reduce((sum, p) => sum + p.targetAmount, 0);
  const totalCurrentSavings = futurePurchases.reduce((sum, p) => sum + p.currentSavings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold">Future Purchase Planner</h2>
            <p className="text-sm opacity-70">Save strategically for things you want</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          <Plus className="w-4 h-4" />
          Add Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <Gift className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm opacity-70">Planned Purchases</p>
          <p className="text-3xl font-bold text-purple-600">{futurePurchases.length}</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm opacity-70">Total Target</p>
          <p className="text-3xl font-bold text-blue-600">{currencySymbol}{totalTargetAmount.toFixed(0)}</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm opacity-70">Current Savings</p>
          <p className="text-3xl font-bold text-green-600">{currencySymbol}{totalCurrentSavings.toFixed(0)}</p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="font-semibold mb-4">Plan New Purchase</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="What do you want to buy?"
              value={newPurchase.name}
              onChange={(e) => setNewPurchase({...newPurchase, name: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                placeholder="Target amount"
                value={newPurchase.targetAmount}
                onChange={(e) => setNewPurchase({...newPurchase, targetAmount: e.target.value})}
                className={`px-4 py-2 rounded border ${borderColor} ${cardBg}`}
              />
              <input
                type="date"
                value={newPurchase.targetDate}
                onChange={(e) => setNewPurchase({...newPurchase, targetDate: e.target.value})}
                className={`px-4 py-2 rounded border ${borderColor} ${cardBg}`}
              />
            </div>
            <select
              value={newPurchase.priority}
              onChange={(e) => setNewPurchase({...newPurchase, priority: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={addFuturePurchase}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Add Purchase
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchases List */}
      {futurePurchases.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl shadow-lg border ${borderColor} text-center`}>
          <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="opacity-50 mb-4">No future purchases planned yet!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Plan Your First Purchase
          </button>
        </div>
      ) : (
        futurePurchases.map(purchase => {
          const percentage = (purchase.currentSavings / purchase.targetAmount) * 100;
          const remaining = purchase.targetAmount - purchase.currentSavings;
          const daysLeft = purchase.targetDate ? Math.ceil((new Date(purchase.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
          
          return (
            <div key={purchase.id} className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-lg">{purchase.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      purchase.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      purchase.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {purchase.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm opacity-70">
                    <span>Target: {currencySymbol}{purchase.targetAmount.toFixed(2)}</span>
                    {purchase.targetDate && (
                      <>
                        <span>•</span>
                        <span className={daysLeft < 30 ? 'text-orange-500' : ''}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Target date passed'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deletePurchase(purchase.id)}
                  className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-100'}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-purple-500">
                    {currencySymbol}{purchase.currentSavings.toFixed(2)}
                  </span>
                  <span className="text-sm opacity-70">
                    {currencySymbol}{remaining.toFixed(2)} to go
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 ${
                      percentage >= 100 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  >
                    {percentage >= 10 && (
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={purchase.currentSavings}
                  onChange={(e) => updateSavings(purchase.id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${borderColor} ${cardBg}`}
                  placeholder="Update savings"
                />
                <button
                  onClick={() => updateSavings(purchase.id, purchase.currentSavings + 50)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  +50
                </button>
                {percentage >= 100 && (
                  <button
                    onClick={() => markAsCompleted(purchase.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Purchase
                  </button>
                )}
              </div>

              {percentage >= 100 && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-semibold">
                    🎉 Goal Reached! You can now purchase this!
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">💡 Smart Planning Tips</h3>
        <ul className="space-y-2 text-sm">
          <li>• Set realistic timelines for your savings goals</li>
          <li>• Prioritize purchases by importance and urgency</li>
          <li>• Consider waiting periods to avoid impulse decisions</li>
          <li>• Research prices and look for deals before purchasing</li>
          <li>• Celebrate when you reach your savings targets!</li>
        </ul>
      </div>
    </div>
  );
};

export default FuturePlanner;