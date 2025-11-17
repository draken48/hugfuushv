import React, { useMemo } from 'react';
import { Clock, TrendingUp, Calculator, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TimeValueTracker = ({ expenses, categories, hourlyWage, setHourlyWage, currencySymbol, darkMode, cardBg, borderColor }) => {
  
  // Calculate time value for each expense
  const expensesWithTime = useMemo(() => {
    return expenses.map(exp => ({
      ...exp,
      hoursWorked: (exp.amount / hourlyWage).toFixed(2)
    }));
  }, [expenses, hourlyWage]);

  const totalHoursWorked = expensesWithTime.reduce((sum, exp) => sum + parseFloat(exp.hoursWorked), 0);
  const monthlyHours = expensesWithTime.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  }).reduce((sum, exp) => sum + parseFloat(exp.hoursWorked), 0);

  // Category time breakdown
  const categoryTimeData = useMemo(() => {
    const breakdown = {};
    expensesWithTime.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + parseFloat(exp.hoursWorked);
    });
    return Object.entries(breakdown).map(([name, hours]) => ({
      name,
      hours: parseFloat(hours.toFixed(2)),
      color: categories.find(c => c.name === name)?.color || '#CCC'
    })).sort((a, b) => b.hours - a.hours);
  }, [expensesWithTime, categories]);

  const workDaysEquivalent = (monthlyHours / 8).toFixed(1);
  const workWeeksEquivalent = (monthlyHours / 40).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold">Time Value Tracker</h2>
          <p className="text-sm opacity-70">See how many hours you work to afford your lifestyle</p>
        </div>
      </div>

      {/* Hourly Wage Setting */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Your Hourly Wage</h3>
            <p className="text-xs opacity-70">This helps calculate how many hours you work for each purchase</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{currencySymbol}</span>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(parseFloat(e.target.value) || 25)}
              className={`w-24 px-3 py-2 rounded border ${borderColor} ${cardBg} text-lg font-bold`}
              min="1"
              step="0.5"
            />
            <span className="text-sm opacity-70">/hour</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <Clock className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm opacity-70">Monthly Hours Worked</p>
          <p className="text-3xl font-bold text-blue-600">{monthlyHours.toFixed(1)} hrs</p>
          <p className="text-xs opacity-70 mt-1">to fund your lifestyle</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <Calculator className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm opacity-70">Work Days Equivalent</p>
          <p className="text-3xl font-bold text-purple-600">{workDaysEquivalent}</p>
          <p className="text-xs opacity-70 mt-1">days (8 hrs/day)</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm opacity-70">Work Weeks Equivalent</p>
          <p className="text-3xl font-bold text-green-600">{workWeeksEquivalent}</p>
          <p className="text-xs opacity-70 mt-1">weeks (40 hrs/week)</p>
        </div>
      </div>

      {/* Reality Check */}
      <div className={`${darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-100 border-yellow-500'} border-l-4 p-4 rounded`}>
        <div className="flex items-start gap-2">
          <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-yellow-300' : 'text-yellow-500'} flex-shrink-0 mt-0.5`} />
          <div>
            <p className={`font-semibold ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
              💡 Reality Check
            </p>
            <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
              You worked {monthlyHours.toFixed(0)} hours this month ({workDaysEquivalent} work days) to maintain your current lifestyle. 
              Is this time investment worth it? Consider what else you could do with {monthlyHours.toFixed(0)} hours.
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Hours Worked by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} angle={-45} textAnchor="end" height={100} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} hours`, 'Time']}
            />
            <Bar dataKey="hours" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Recent Purchases - Time Cost</h3>
        <div className="space-y-3">
          {expensesWithTime.slice(0, 10).map(expense => (
            <div key={expense.id} className={`p-4 rounded-lg border ${borderColor} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{categories.find(c => c.name === expense.category)?.icon}</span>
                <div>
                  <h4 className="font-semibold">{expense.description}</h4>
                  <div className="flex gap-3 text-sm opacity-70">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-500">⏱️ {expense.hoursWorked} hrs</p>
                <p className="text-sm opacity-70">{currencySymbol}{expense.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Details */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Time Investment by Category</h3>
        <div className="space-y-3">
          {categoryTimeData.map(cat => (
            <div key={cat.name} className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{cat.name}</span>
                <span className="text-lg font-bold text-blue-600">{cat.hours.toFixed(1)} hrs</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${(cat.hours / totalHoursWorked) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs opacity-70">
                <span>{((cat.hours / totalHoursWorked) * 100).toFixed(1)}% of total time</span>
                <span>{(cat.hours / 8).toFixed(1)} work days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-Saving Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} bg-gradient-to-br from-blue-500/10 to-purple-500/10`}>
        <h3 className="text-lg font-bold mb-4">⏰ Think Before You Buy</h3>
        <div className="space-y-3 text-sm">
          <p>Before making a purchase, ask yourself:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Is this worth X hours of my life?</strong> Calculate: Cost ÷ Hourly Wage = Hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Could I spend this time differently?</strong> What could you do with those hours instead?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Does this purchase buy back my time?</strong> Some purchases save time (dishwasher, tools)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>What's the cost per use?</strong> Divide price by expected uses for true value</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              Example: A ${200} item costs {(200 / hourlyWage).toFixed(1)} hours of work at your wage. 
              That's {((200 / hourlyWage) / 8).toFixed(1)} full work days!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeValueTracker;