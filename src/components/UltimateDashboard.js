import React, { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Leaf, Clock, Heart, Brain,Flame, Sparkles } from 'lucide-react';

const UltimateDashboard = ({ expenses, budgets, goals, regretedPurchases, hourlyWage, currency, currencySymbol, darkMode, cardBg, borderColor }) => {
  
  // Financial Health Score Calculation
  const financialHealthScore = useMemo(() => {
    let score = 50;
    
    const monthlyTotal = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
    if (monthlyTotal < totalBudget * 0.8) score += 20;
    else if (monthlyTotal < totalBudget) score += 10;
    else if (monthlyTotal > totalBudget * 1.2) score -= 20;
    
    const goalsProgress = goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0) / (goals.length || 1);
    score += Math.min(goalsProgress * 20, 20);
    
    return Math.min(Math.max(score, 0), 100);
  }, [expenses, budgets, goals]);

  // Carbon Footprint Calculation
  const totalCarbon = useMemo(() => {
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
    
    return expenses.reduce((sum, exp) => {
      const footprint = (exp.amount * (footprints[exp.category] || 1.0) / 10);
      return sum + footprint;
    }, 0);
  }, [expenses]);

  // Time Value Calculation
  const monthlyTotal = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const hoursWorked = (monthlyTotal / hourlyWage).toFixed(1);

  // AI Insights
  const aiInsights = useMemo(() => {
    const insights = [];
    
    // Emotional Spending Pattern
    const happyPurchases = expenses.filter(e => e.mood === 'happy');
    const sadPurchases = expenses.filter(e => e.mood === 'sad');
    if (sadPurchases.length > happyPurchases.length * 0.3) {
      insights.push({
        icon: '🧠',
        title: 'Emotional Spending Alert',
        message: 'You tend to spend more when feeling down. Consider healthier coping mechanisms.',
        priority: 'high'
      });
    }
    
    // Carbon Impact
    if (totalCarbon > 100) {
      insights.push({
        icon: '🌍',
        title: 'High Environmental Impact',
        message: `Your spending generated ${totalCarbon.toFixed(0)}kg CO2. Try eco-friendly alternatives.`,
        priority: 'medium'
      });
    }
    
    // Time Investment
    insights.push({
      icon: '⏰',
      title: 'Time Investment Reality',
      message: `You worked ${hoursWorked} hours this month to fund your lifestyle. Is it worth it?`,
      priority: 'info'
    });
    
    // Investment Opportunity
    const potentialSavings = monthlyTotal * 0.2;
    const projectedGrowth = (potentialSavings * Math.pow(1.07, 10)).toFixed(0);
    insights.push({
      icon: '💰',
      title: 'Investment Opportunity',
      message: `Save ${currencySymbol}${potentialSavings.toFixed(0)}/mo → ${currencySymbol}${projectedGrowth} in 10 years (7% return)`,
      priority: 'high'
    });
    
    // Regret Pattern
    if (regretedPurchases.length > 0) {
      const regretTotal = regretedPurchases.reduce((sum, r) => sum + r.amount, 0);
      insights.push({
        icon: '😔',
        title: 'Regret Pattern Detected',
        message: `You've regretted ${regretedPurchases.length} purchases totaling ${currencySymbol}${regretTotal.toFixed(0)}. Learn from these!`,
        priority: 'medium'
      });
    }
    
    return insights;
  }, [expenses, totalCarbon, hoursWorked, monthlyTotal, currencySymbol, regretedPurchases]);

  // Spending Heatmap (Last 30 days)
  const spendingHeatmap = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      last30Days.push({
        date: dateStr,
        day: date.getDate(),
        amount: total,
        intensity: total > 100 ? 'high' : total > 50 ? 'medium' : total > 0 ? 'low' : 'none'
      });
    }
    return last30Days;
  }, [expenses]);

  // Financial Health Breakdown
  const healthBreakdown = [
    { category: 'Budget', score: monthlyTotal < Object.values(budgets).reduce((a,b) => a+b, 0) ? 90 : 50 },
    { category: 'Savings', score: goals.length > 0 ? 80 : 30 },
    { category: 'Planning', score: 75 },
    { category: 'Control', score: regretedPurchases.length < expenses.length * 0.1 ? 90 : 60 },
    { category: 'Awareness', score: 85 }
  ];

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiInsights.map((insight, idx) => (
          <div key={idx} className={`${cardBg} p-4 rounded-xl shadow-lg border-l-4 ${
            insight.priority === 'high' ? 'border-red-500' : 
            insight.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
          } ${borderColor}`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{insight.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm opacity-70">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-green-500">{financialHealthScore}</span>
            </div>
            <p className="text-sm font-semibold">Financial Health Score</p>
            <p className="text-xs opacity-70">Your overall wellbeing</p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: `${financialHealthScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-600">{totalCarbon.toFixed(0)}</span>
            </div>
            <p className="text-sm font-semibold">Carbon Footprint</p>
            <p className="text-xs opacity-70">kg CO2 this month</p>
            <p className="text-xs mt-2 text-green-600">🌱 Plant {Math.ceil(totalCarbon / 20)} trees to offset</p>
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-blue-500">{hoursWorked}</span>
            </div>
            <p className="text-sm font-semibold">Hours Worked</p>
            <p className="text-xs opacity-70">to fund lifestyle</p>
            <p className="text-xs mt-2 text-blue-500">@ {currencySymbol}{hourlyWage}/hr</p>
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold text-red-500">{regretedPurchases.length}</span>
            </div>
            <p className="text-sm font-semibold">Regret Tracker</p>
            <p className="text-xs opacity-70">purchases regretted</p>
            {regretedPurchases.length > 0 && (
              <p className="text-xs mt-2 text-red-500">
                {currencySymbol}{regretedPurchases.reduce((s, r) => s + r.amount, 0).toFixed(0)} wasted
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Spending Heatmap */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold">30-Day Spending Heatmap</h3>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {spendingHeatmap.map((day, idx) => (
            <div
              key={idx}
              className={`h-10 rounded flex items-center justify-center text-xs font-semibold transition-all hover:scale-110 cursor-pointer ${
                day.intensity === 'high' ? 'bg-red-500 text-white' :
                day.intensity === 'medium' ? 'bg-yellow-500 text-white' :
                day.intensity === 'low' ? 'bg-green-500 text-white' :
                'bg-gray-200 dark:bg-gray-700'
              }`}
              title={`${day.date}: ${currencySymbol}${day.amount.toFixed(2)}`}
            >
              {day.day}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>No spending
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>Low ($0-50)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>Medium ($50-100)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>High ($100+)
          </span>
        </div>
      </div>

      {/* Financial Health Radar */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold">Financial Health Breakdown</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={healthBreakdown}>
            <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
            <PolarAngleAxis dataKey="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <PolarRadiusAxis domain={[0, 100]} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Radar dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Tooltip contentStyle={{ 
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px'
            }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Future Projection */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} bg-gradient-to-br from-blue-500/10 to-purple-500/10`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold">Your Financial Future</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm opacity-70 mb-1">In 1 Year</p>
            <p className="text-2xl font-bold text-blue-500">
              {currencySymbol}{(monthlyTotal * 12).toFixed(0)}
            </p>
            <p className="text-xs opacity-70">at current rate</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">In 5 Years</p>
            <p className="text-2xl font-bold text-purple-500">
              {currencySymbol}{(monthlyTotal * 60).toFixed(0)}
            </p>
            <p className="text-xs opacity-70">without changes</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">If You Save 20%</p>
            <p className="text-2xl font-bold text-green-500">
              {currencySymbol}{(monthlyTotal * 0.2 * 12 * Math.pow(1.07, 5)).toFixed(0)}
            </p>
            <p className="text-xs opacity-70">in 5 years @ 7% return</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateDashboard;