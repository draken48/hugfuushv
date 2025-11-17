import React, { useMemo, useState } from 'react';
import { Users, TrendingUp, TrendingDown, Award, Shield, Info, Target, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const SocialComparison = ({ expenses, hourlyWage, currencySymbol, darkMode, cardBg, borderColor }) => {
  const [incomeRange, setIncomeRange] = useState('30-50k');

  // Calculate user's monthly spending
  const userMonthlySpending = useMemo(() => {
    const thisMonth = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + exp.amount, 0);
    
    return thisMonth;
  }, [expenses]);

  // Calculate by category
  const userCategorySpending = useMemo(() => {
    const breakdown = {};
    expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    return breakdown;
  }, [expenses]);

  // Simulated anonymous data (in production, this would come from Firebase/backend)
  const comparisonData = {
    '20-30k': { 
      avg: 1800, 
      median: 1650, 
      top25: 1300, 
      bottom25: 2200, 
      users: 1247,
      categories: {
        'Food & Dining': 400,
        'Transportation': 300,
        'Shopping': 250,
        'Entertainment': 200,
        'Bills & Utilities': 450,
        'Healthcare': 100,
        'Education': 50,
        'Others': 50
      }
    },
    '30-50k': { 
      avg: 2800, 
      median: 2600, 
      top25: 2100, 
      bottom25: 3400, 
      users: 3892,
      categories: {
        'Food & Dining': 600,
        'Transportation': 450,
        'Shopping': 400,
        'Entertainment': 300,
        'Bills & Utilities': 700,
        'Healthcare': 200,
        'Education': 100,
        'Others': 50
      }
    },
    '50-75k': { 
      avg: 4200, 
      median: 3900, 
      top25: 3200, 
      bottom25: 5100, 
      users: 2156,
      categories: {
        'Food & Dining': 900,
        'Transportation': 650,
        'Shopping': 700,
        'Entertainment': 500,
        'Bills & Utilities': 900,
        'Healthcare': 350,
        'Education': 150,
        'Others': 50
      }
    },
    '75-100k': { 
      avg: 5800, 
      median: 5400, 
      top25: 4500, 
      bottom25: 7000, 
      users: 876,
      categories: {
        'Food & Dining': 1200,
        'Transportation': 900,
        'Shopping': 1000,
        'Entertainment': 700,
        'Bills & Utilities': 1200,
        'Healthcare': 500,
        'Education': 250,
        'Others': 50
      }
    },
    '100k+': { 
      avg: 8500, 
      median: 7800, 
      top25: 6200, 
      bottom25: 10500, 
      users: 423,
      categories: {
        'Food & Dining': 1800,
        'Transportation': 1300,
        'Shopping': 1500,
        'Entertainment': 1000,
        'Bills & Utilities': 1600,
        'Healthcare': 800,
        'Education': 400,
        'Others': 100
      }
    }
  };

  const currentData = comparisonData[incomeRange];
  
  // User's percentile
  const percentile = useMemo(() => {
    if (userMonthlySpending <= currentData.top25) return 'top25';
    if (userMonthlySpending <= currentData.median) return 'top50';
    if (userMonthlySpending <= currentData.avg) return 'average';
    if (userMonthlySpending <= currentData.bottom25) return 'below';
    return 'bottom25';
  }, [userMonthlySpending, currentData]);

  const percentileMessages = {
    top25: { text: 'Top 25% Saver', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900', icon: '🏆', message: 'You spend less than 75% of people in your income range!' },
    top50: { text: 'Above Average', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900', icon: '👍', message: 'You spend less than 50% of people in your income range!' },
    average: { text: 'Average Spender', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900', icon: '📊', message: 'Your spending is close to the average.' },
    below: { text: 'Below Average', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900', icon: '⚠️', message: 'You spend more than most people in your income range.' },
    bottom25: { text: 'High Spender', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900', icon: '🔥', message: 'You spend more than 75% of people in your income range.' }
  };

  const currentPercentile = percentileMessages[percentile];

  // Chart data
  const chartData = [
    { name: 'Top 25%\nSavers', value: currentData.top25, color: '#10B981' },
    { name: 'Median', value: currentData.median, color: '#3B82F6' },
    { name: 'You', value: userMonthlySpending, color: '#8B5CF6' },
    { name: 'Average', value: currentData.avg, color: '#F59E0B' },
    { name: 'Bottom 25%', value: currentData.bottom25, color: '#EF4444' }
  ].sort((a, b) => a.value - b.value);

  // Category comparison
  const categoryComparison = Object.keys(currentData.categories).map(cat => ({
    category: cat,
    user: userCategorySpending[cat] || 0,
    average: currentData.categories[cat],
    diff: (userCategorySpending[cat] || 0) - currentData.categories[cat]
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold">Social Spending Comparison</h2>
          <p className="text-sm opacity-70">See how you compare (100% anonymous)</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className={`${cardBg} p-4 rounded-xl shadow border border-blue-500 flex items-start gap-3`}>
        <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-600">Your Privacy is Protected</p>
          <p className="text-sm opacity-70 mt-1">
            All data is anonymous and aggregated. We never share individual spending details. 
            Only statistical averages are shown.
          </p>
        </div>
      </div>

      {/* Income Range Selector */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <label className="block text-sm font-semibold mb-3">Select Your Income Range:</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.keys(comparisonData).map(range => (
            <button
              key={range}
              onClick={() => setIncomeRange(range)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                incomeRange === range
                  ? 'bg-blue-500 text-white shadow-lg'
                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
              }`}
            >
              ${range}
            </button>
          ))}
        </div>
        <p className="text-xs opacity-70 mt-2">
          {comparisonData[incomeRange].users.toLocaleString()} users in this range
        </p>
      </div>

      {/* Your Position */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border-2 ${
        percentile === 'top25' || percentile === 'top50' ? 'border-green-500' : 
        percentile === 'average' ? 'border-blue-500' : 'border-orange-500'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl">{currentPercentile.icon}</span>
              <h3 className={`text-2xl font-bold ${currentPercentile.color}`}>
                {currentPercentile.text}
              </h3>
            </div>
            <p className="text-sm opacity-70">{currentPercentile.message}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-70">Your Monthly Spending</p>
            <p className="text-3xl font-bold text-purple-600">
              {currencySymbol}{userMonthlySpending.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-sm opacity-70">vs Top 25%</p>
            <p className={`text-xl font-bold ${
              userMonthlySpending <= currentData.top25 ? 'text-green-600' : 'text-red-600'
            }`}>
              {userMonthlySpending <= currentData.top25 ? (
                <><TrendingDown className="w-5 h-5 inline" /> Better</>
              ) : (
                <><TrendingUp className="w-5 h-5 inline" /> +{currencySymbol}{(userMonthlySpending - currentData.top25).toFixed(0)}</>
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70">vs Median</p>
            <p className={`text-xl font-bold ${
              userMonthlySpending <= currentData.median ? 'text-green-600' : 'text-red-600'
            }`}>
              {userMonthlySpending <= currentData.median ? (
                <><TrendingDown className="w-5 h-5 inline" /> Better</>
              ) : (
                <><TrendingUp className="w-5 h-5 inline" /> +{currencySymbol}{(userMonthlySpending - currentData.median).toFixed(0)}</>
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70">vs Average</p>
            <p className={`text-xl font-bold ${
              userMonthlySpending <= currentData.avg ? 'text-green-600' : 'text-red-600'
            }`}>
              {userMonthlySpending <= currentData.avg ? (
                <><TrendingDown className="w-5 h-5 inline" /> Better</>
              ) : (
                <><TrendingUp className="w-5 h-5 inline" /> +{currencySymbol}{(userMonthlySpending - currentData.avg).toFixed(0)}</>
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70">Potential Savings</p>
            <p className="text-xl font-bold text-blue-600">
              {currencySymbol}{Math.max(0, userMonthlySpending - currentData.top25).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Comparison Chart */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Visual Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px'
              }}
              formatter={(value) => `${currencySymbol}${value.toFixed(0)}`}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Comparison */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Category Breakdown Comparison</h3>
        <div className="space-y-3">
          {categoryComparison.map(cat => (
            <div key={cat.category} className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm opacity-70">
                    You: {currencySymbol}{cat.user.toFixed(0)}
                  </span>
                  <span className="text-sm opacity-70">
                    Avg: {currencySymbol}{cat.average.toFixed(0)}
                  </span>
                  <span className={`text-sm font-semibold ${
                    cat.diff <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {cat.diff <= 0 ? '✓' : '✗'} {Math.abs(cat.diff).toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`absolute h-4 rounded-full ${
                    cat.user <= cat.average ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((cat.user / cat.average) * 100, 100)}%` }}
                />
                <div className="absolute left-0 top-0 w-full h-4 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {((cat.user / cat.average) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} ${currentPercentile.bgColor}`}>
        <h3 className="text-lg font-bold mb-4">💡 Personalized Insights</h3>
        <div className="space-y-3 text-sm">
          {percentile === 'top25' || percentile === 'top50' ? (
            <>
              <p>🎉 <strong>Great job!</strong> You're spending less than most people in your income range.</p>
              <p>• Your spending discipline puts you ahead of {percentile === 'top25' ? '75%' : '50%'} of your peers.</p>
              <p>• You could save an extra {currencySymbol}{(userMonthlySpending * 0.1).toFixed(0)}/month with minor optimizations.</p>
              <p>• Consider investing your surplus for long-term wealth building.</p>
            </>
          ) : percentile === 'average' ? (
            <>
              <p>📊 You're close to the average spending for your income range.</p>
              <p>• Potential to save {currencySymbol}{(userMonthlySpending - currentData.top25).toFixed(0)}/month by matching top savers.</p>
              <p>• Focus on reducing your highest spending categories first.</p>
              <p>• Small changes can move you into the top 50% of savers.</p>
            </>
          ) : (
            <>
              <p>⚠️ You're spending more than most people in your income range.</p>
              <p>• You could save {currencySymbol}{(userMonthlySpending - currentData.median).toFixed(0)}/month to match the median.</p>
              <p>• Review your budget and identify areas to cut back.</p>
              <p>• Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.</p>
            </>
          )}
        </div>
      </div>

      {/* Community Stats */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Community Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20">
            <p className="text-3xl mb-2">🏆</p>
            <p className="font-semibold">Top Saver</p>
            <p className="text-xs opacity-70">Save 40%+ monthly</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <p className="text-3xl mb-2">💎</p>
            <p className="font-semibold">Consistent Tracker</p>
            <p className="text-xs opacity-70">30+ day streak</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-semibold">Goal Crusher</p>
            <p className="text-xs opacity-70">3+ goals achieved</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20">
            <p className="text-3xl mb-2">🌟</p>
            <p className="font-semibold">Budget Master</p>
            <p className="text-xs opacity-70">Under budget 6mo+</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor} text-xs opacity-70`}>
        <Info className="w-4 h-4 inline mr-1" />
        <strong>Disclaimer:</strong> This comparison uses aggregated anonymous data. 
        Individual circumstances vary. Use this as a general guide, not financial advice.
      </div>
    </div>
  );
};

export default SocialComparison;