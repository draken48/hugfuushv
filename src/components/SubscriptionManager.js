import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, AlertCircle, Bell } from 'lucide-react';

const SubscriptionManager = ({ subscriptions, setSubscriptions, currencySymbol, darkMode, cardBg, borderColor }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    nextBilling: '',
    cancelReminder: true
  });

  const addSubscription = () => {
    if (!newSub.name || !newSub.amount) {
      alert('Please enter subscription name and amount');
      return;
    }

    setSubscriptions([...subscriptions, {
      id: Date.now(),
      ...newSub,
      amount: parseFloat(newSub.amount),
      startDate: new Date().toISOString()
    }]);

    setNewSub({
      name: '',
      amount: '',
      frequency: 'monthly',
      nextBilling: '',
      cancelReminder: true
    });
    setShowAddForm(false);
  };

  const deleteSubscription = (id) => {
    if (window.confirm('Cancel this subscription?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  const toggleReminder = (id) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === id ? { ...s, cancelReminder: !s.cancelReminder } : s
    ));
  };

  // Calculate totals
  const monthlyTotal = subscriptions
    .filter(s => s.frequency === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);
  
  const yearlyFromMonthly = monthlyTotal * 12;
  const yearlyTotal = subscriptions
    .filter(s => s.frequency === 'yearly')
    .reduce((sum, s) => sum + s.amount, 0);
  const totalYearly = yearlyFromMonthly + yearlyTotal;

  // Check upcoming renewals
  const upcomingRenewals = subscriptions.filter(s => {
    if (!s.nextBilling) return false;
    const daysUntil = Math.ceil((new Date(s.nextBilling) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">Subscription Manager</h2>
            <p className="text-sm opacity-70">Track and manage recurring payments</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <CreditCard className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm opacity-70">Active Subscriptions</p>
          <p className="text-3xl font-bold text-blue-600">{subscriptions.length}</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <p className="text-sm opacity-70 mb-2">Monthly Cost</p>
          <p className="text-3xl font-bold text-purple-600">{currencySymbol}{monthlyTotal.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-1">per month</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <p className="text-sm opacity-70 mb-2">Yearly Cost</p>
          <p className="text-3xl font-bold text-orange-600">{currencySymbol}{totalYearly.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-1">per year</p>
        </div>
      </div>

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <div className={`${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-500'} border-l-4 p-4 rounded`}>
          <div className="flex items-start gap-2">
            <Bell className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-blue-500'} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Upcoming Renewals This Week
              </p>
              <ul className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'} mt-1`}>
                {upcomingRenewals.map(sub => {
                  const daysUntil = Math.ceil((new Date(sub.nextBilling) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <li key={sub.id}>• {sub.name} - {currencySymbol}{sub.amount} in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="font-semibold mb-4">Add New Subscription</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Subscription name (e.g., Netflix)"
              value={newSub.name}
              onChange={(e) => setNewSub({...newSub, name: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newSub.amount}
                onChange={(e) => setNewSub({...newSub, amount: e.target.value})}
                className={`px-4 py-2 rounded border ${borderColor} ${cardBg}`}
              />
              <select
                value={newSub.frequency}
                onChange={(e) => setNewSub({...newSub, frequency: e.target.value})}
                className={`px-4 py-2 rounded border ${borderColor} ${cardBg}`}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <input
              type="date"
              value={newSub.nextBilling}
              onChange={(e) => setNewSub({...newSub, nextBilling: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
              placeholder="Next billing date"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newSub.cancelReminder}
                onChange={(e) => setNewSub({...newSub, cancelReminder: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">Send cancellation reminders</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={addSubscription}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Subscription
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

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl shadow-lg border ${borderColor} text-center`}>
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="opacity-50 mb-4">No subscriptions tracked yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Your First Subscription
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => {
            const daysUntil = sub.nextBilling ? Math.ceil((new Date(sub.nextBilling) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            
            return (
              <div key={sub.id} className={`${cardBg} p-4 rounded-lg border ${borderColor} flex items-center justify-between`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{sub.name}</h4>
                    {sub.cancelReminder && <Bell className="w-4 h-4 text-blue-500" title="Reminders enabled" />}
                  </div>
                  <div className="flex gap-3 text-sm opacity-70">
                    <span className="font-semibold text-blue-500">{currencySymbol}{sub.amount.toFixed(2)}</span>
                    <span>•</span>
                    <span>{sub.frequency}</span>
                    {sub.nextBilling && (
                      <>
                        <span>•</span>
                        <span className={daysUntil <= 7 ? 'text-orange-500 font-semibold' : ''}>
                          Next: {new Date(sub.nextBilling).toLocaleDateString()}
                          {daysUntil !== null && daysUntil >= 0 && ` (${daysUntil}d)`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(sub.id)}
                    className={`p-2 rounded ${sub.cancelReminder ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}
                    title="Toggle reminders"
                  >
                    <Bell className={`w-4 h-4 ${sub.cancelReminder ? 'text-blue-500' : 'opacity-30'}`} />
                  </button>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-100'}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Annual Savings Calculator */}
      {subscriptions.length > 0 && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} bg-gradient-to-br from-orange-500/10 to-red-500/10`}>
          <h3 className="text-lg font-bold mb-4">💰 Savings Opportunity</h3>
          <p className="text-sm mb-3">
            Your subscriptions cost <strong>{currencySymbol}{totalYearly.toFixed(2)}</strong> per year.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="opacity-70">Cancel 1 subscription</p>
              <p className="text-xl font-bold text-green-600">
                Save {currencySymbol}{(monthlyTotal * 12 / subscriptions.length).toFixed(0)}/yr
              </p>
            </div>
            <div>
              <p className="opacity-70">Cancel 25% of subscriptions</p>
              <p className="text-xl font-bold text-green-600">
                Save {currencySymbol}{(totalYearly * 0.25).toFixed(0)}/yr
              </p>
            </div>
            <div>
              <p className="opacity-70">Cancel 50% of subscriptions</p>
              <p className="text-xl font-bold text-green-600">
                Save {currencySymbol}{(totalYearly * 0.5).toFixed(0)}/yr
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">💡 Subscription Tips</h3>
        <ul className="space-y-2 text-sm">
          <li>• Review all subscriptions quarterly - cancel what you don't use</li>
          <li>• Set calendar reminders before free trials end</li>
          <li>• Share family plans with friends/family to split costs</li>
          <li>• Look for annual plans - often 20-30% cheaper than monthly</li>
          <li>• Consider pausing seasonal subscriptions when not needed</li>
          <li>• Use services like Privacy.com for virtual cards to easily cancel</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionManager;