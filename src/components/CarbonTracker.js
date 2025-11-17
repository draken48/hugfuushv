import React, { useMemo } from 'react';
import { Leaf, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CarbonTracker = ({ expenses, categories, currencySymbol, darkMode, cardBg, borderColor }) => {
  
  // Carbon footprint calculation
  const carbonData = useMemo(() => {
    const footprints = {
      'Food & Dining': 2.5,
      'Transportation': 5.0,
      'Shopping': 3.0,
      'Entertainment': 1.0,
      'Bills & Utilities': 2.0,
      'Healthcare': 1.5,
      'Education': 0.5,
      'Others': 1.0
    };
    
    const categoryCarbon = {};
    expenses.forEach(exp => {
      const carbon = (exp.amount * (footprints[exp.category] || 1.0) / 10);
      categoryCarbon[exp.category] = (categoryCarbon[exp.category] || 0) + carbon;
    });
    
    return Object.entries(categoryCarbon).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: categories.find(c => c.name === name)?.color || '#CCC'
    })).sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  const totalCarbon = carbonData.reduce((sum, c) => sum + c.value, 0);
  const treesToOffset = Math.ceil(totalCarbon / 20);
  const carEquivalent = (totalCarbon / 4.6).toFixed(1);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const monthlyData = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const footprints = {
        'Food & Dining': 2.5, 'Transportation': 5.0, 'Shopping': 3.0,
        'Entertainment': 1.0, 'Bills & Utilities': 2.0, 'Healthcare': 1.5,
        'Education': 0.5, 'Others': 1.0
      };
      const carbon = (exp.amount * (footprints[exp.category] || 1.0) / 10);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + carbon;
    });
    
    return Object.entries(monthlyData)
      .sort()
      .slice(-6)
      .map(([month, carbon]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
        carbon: parseFloat(carbon.toFixed(2))
      }));
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Leaf className="w-8 h-8 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold">Carbon Footprint Tracker</h2>
          <p className="text-sm opacity-70">Track the environmental impact of your spending</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <Leaf className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm opacity-70">Total CO2 Emissions</p>
          <p className="text-3xl font-bold text-green-600">{totalCarbon.toFixed(1)} kg</p>
          <p className="text-xs opacity-70 mt-1">from your spending</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <Award className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm opacity-70">Trees to Offset</p>
          <p className="text-3xl font-bold text-blue-600">{treesToOffset} 🌳</p>
          <p className="text-xs opacity-70 mt-1">to neutralize impact</p>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <TrendingDown className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm opacity-70">Car Equivalent</p>
          <p className="text-3xl font-bold text-purple-600">{carEquivalent}%</p>
          <p className="text-xs opacity-70 mt-1">of yearly car emissions</p>
        </div>
      </div>

      {/* Environmental Impact Alert */}
      {totalCarbon > 100 && (
        <div className={`${darkMode ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-500'} border-l-4 p-4 rounded`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-orange-300' : 'text-orange-500'} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-semibold ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                High Environmental Impact Alert
              </p>
              <p className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                Your spending has generated {totalCarbon.toFixed(0)}kg of CO2 this month. Consider eco-friendly alternatives!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="text-lg font-bold mb-4">Carbon by Category</h3>
          {carbonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={carbonData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}kg`}
                >
                  {carbonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-20 opacity-50">No data yet</p>
          )}
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="text-lg font-bold mb-4">Monthly Trend</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value} kg CO2`, 'Carbon']}
                />
                <Bar dataKey="carbon" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-20 opacity-50">Not enough data</p>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">Category Impact Details</h3>
        <div className="space-y-3">
          {carbonData.map(cat => (
            <div key={cat.name} className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{cat.name}</span>
                <span className="text-lg font-bold text-green-600">{cat.value.toFixed(2)} kg</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${(cat.value / totalCarbon) * 100}%` }}
                />
              </div>
              <p className="text-xs opacity-70 mt-1">
                {((cat.value / totalCarbon) * 100).toFixed(1)}% of total emissions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Eco Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} bg-gradient-to-br from-green-500/10 to-blue-500/10`}>
        <h3 className="text-lg font-bold mb-4">🌱 Eco-Friendly Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2 text-green-600">Transportation</h4>
            <ul className="space-y-1 opacity-70">
              <li>• Use public transport or bike</li>
              <li>• Carpool when possible</li>
              <li>• Choose walking for short distances</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-green-600">Food & Dining</h4>
            <ul className="space-y-1 opacity-70">
              <li>• Buy local and seasonal produce</li>
              <li>• Reduce meat consumption</li>
              <li>• Avoid single-use packaging</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-green-600">Shopping</h4>
            <ul className="space-y-1 opacity-70">
              <li>• Buy second-hand when possible</li>
              <li>• Choose quality over quantity</li>
              <li>• Look for eco-certified products</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-green-600">Energy</h4>
            <ul className="space-y-1 opacity-70">
              <li>• Switch to renewable energy</li>
              <li>• Reduce heating/cooling usage</li>
              <li>• Unplug unused electronics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Offset Options */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">💚 Carbon Offset Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-green-500">
            <p className="font-semibold mb-2">Plant Trees</p>
            <p className="text-2xl font-bold text-green-600">{treesToOffset} trees</p>
            <p className="text-xs opacity-70 mt-2">Estimated cost: ${treesToOffset * 5}</p>
          </div>
          <div className="p-4 rounded-lg border border-blue-500">
            <p className="font-semibold mb-2">Renewable Energy</p>
            <p className="text-2xl font-bold text-blue-600">${(totalCarbon * 0.02).toFixed(0)}</p>
            <p className="text-xs opacity-70 mt-2">Monthly investment</p>
          </div>
          <div className="p-4 rounded-lg border border-purple-500">
            <p className="font-semibold mb-2">Carbon Credits</p>
            <p className="text-2xl font-bold text-purple-600">${(totalCarbon * 0.05).toFixed(0)}</p>
            <p className="text-xs opacity-70 mt-2">One-time purchase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonTracker;