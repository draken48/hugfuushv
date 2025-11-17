
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import {
  Wallet, TrendingUp, Target, Award, MessageSquare, Settings as SettingsIcon, Plus,
  Moon, Sun, Zap, AlertCircle, Rocket, ThumbsDown, Leaf, Clock, Gift, CreditCard, LogOut
} from 'lucide-react';

import AnimatedLogin from './components/AnimatedLogin';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import BudgetManager from './components/BudgetManager';
import GoalsManager from './components/GoalsManager';
import Settings from './components/Settings';
import AddExpenseModal from './components/AddExpenseModal';
import UltimateDashboard from './components/UltimateDashboard';
import RegretTracker from './components/RegretTracker';
import CarbonTracker from './components/CarbonTracker';
import TimeValueTracker from './components/TimeValueTracker';
import FuturePlanner from './components/FuturePlanner';
import SubscriptionManager from './components/SubscriptionManager';
import sqliteManager from './utils/sqliteManager';
import { autoCategorizeMerchant } from './utils/aiHelpers';

// Revolutionary components
import EnhancedReceiptScanner from './components/EnhancedReceiptScanner';

import './styles/App.css';

const CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6384', icon: '🍔' },
  { name: 'Transportation', color: '#36A2EB', icon: '🚗' },
  { name: 'Shopping', color: '#FFCE56', icon: '🛍️' },
  { name: 'Entertainment', color: '#4BC0C0', icon: '🎬' },
  { name: 'Bills & Utilities', color: '#9966FF', icon: '💡' },
  { name: 'Healthcare', color: '#FF9F40', icon: '🏥' },
  { name: 'Education', color: '#FF6384', icon: '📚' },
  { name: 'Others', color: '#C9CBCF', icon: '📦' }
];

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$'
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  const [currentView, setCurrentView] = useState('ultimate');
  const [darkMode, setDarkMode] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [notifications, setNotifications] = useState(true);

  // Revolutionary features state
  const [regretedPurchases, setRegretedPurchases] = useState([]);
  const [futurePurchases, setFuturePurchases] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [hourlyWage, setHourlyWage] = useState(25);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const initialized = await sqliteManager.initialize(currentUser.uid);
          setDbInitialized(initialized);

          if (initialized) {
            loadDataFromSQLite(currentUser.uid);
          }
        } catch (error) {
          console.error('Database initialization error:', error);
        }
      } else {
        setUser(null);
        setDbInitialized(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load data from SQLite and localStorage
  const loadDataFromSQLite = (uid) => {
    try {
      const sqlExpenses = sqliteManager.getAllExpenses();
      const sqlBudgets = sqliteManager.getAllBudgets();

      if (sqlExpenses.length > 0) {
        setExpenses(sqlExpenses.map(exp => ({
          ...exp,
          tags: Array.isArray(exp.tags) ? exp.tags : []
        })));
      } else {
        const sampleExpenses = [
          {
            amount: 45.50,
            category: 'Food & Dining',
            description: 'Lunch at cafe',
            date: new Date().toISOString().split('T')[0],
            tags: ['lunch'],
            mood: 'happy',
            recurring: false
          },
          {
            amount: 120,
            category: 'Shopping',
            description: 'New shoes',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            tags: ['clothing'],
            mood: 'neutral',
            recurring: false
          },
          {
            amount: 30,
            category: 'Transportation',
            description: 'Uber ride',
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            tags: ['commute'],
            mood: 'neutral',
            recurring: false
          }
        ];

        sampleExpenses.forEach(exp => sqliteManager.addExpense(exp));
        setExpenses(sqliteManager.getAllExpenses());
      }

      const budgetData = Object.keys(sqlBudgets).length > 0 ? sqlBudgets : null;
      if (budgetData) {
        setBudgets(budgetData);
      } else {
        const defaultBudgets = {};
        CATEGORIES.forEach(cat => {
          defaultBudgets[cat.name] = 500;
          sqliteManager.setBudget(cat.name, 500);
        });
        setBudgets(defaultBudgets);
      }

      const userData = localStorage.getItem(`finote_user_${uid}`);
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.regretedPurchases) setRegretedPurchases(parsed.regretedPurchases);
        if (parsed.futurePurchases) setFuturePurchases(parsed.futurePurchases);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.streak) setStreak(parsed.streak);
        if (parsed.badges) setBadges(parsed.badges);
        if (parsed.settings) {
          setDarkMode(parsed.settings.darkMode || false);
          setCurrency(parsed.settings.currency || 'USD');
          setHourlyWage(parsed.settings.hourlyWage || 25);
          setNotifications(parsed.settings.notifications !== false);
        }
      } else {
        setSubscriptions([
          {
            id: Date.now(),
            name: 'Netflix',
            amount: 15.99,
            frequency: 'monthly',
            nextBilling: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            cancelReminder: true
          },
          {
            id: Date.now() + 1,
            name: 'Spotify',
            amount: 9.99,
            frequency: 'monthly',
            nextBilling: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            cancelReminder: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading from SQLite:', error);
    }
  };

  // Save data to SQLite and localStorage
  useEffect(() => {
    if (user && dbInitialized) {
      try {
        sqliteManager.saveDatabase(user.uid);

        const userData = {
          goals,
          regretedPurchases,
          futurePurchases,
          subscriptions,
          streak,
          badges,
          settings: { darkMode, currency, notifications, hourlyWage }
        };
        localStorage.setItem(`finote_user_${user.uid}`, JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving ', error);
      }
    }
  }, [
    expenses, budgets, goals, regretedPurchases, futurePurchases, subscriptions,
    darkMode, currency, streak, badges, notifications, hourlyWage, user, dbInitialized
  ]);

  // Add expense, linked to receipt scanner and manual entry
  const addExpense = (expenseData) => {
    const expense = {
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category || autoCategorizeMerchant(expenseData.description)
    };

    try {
      sqliteManager.addExpense(expense);
      const allExpenses = sqliteManager.getAllExpenses();
      setExpenses(allExpenses);

      setStreak(prev => prev + 1);

      const newExpensesCount = allExpenses.length;
      if (newExpensesCount === 10 && !badges.includes('First 10')) {
        setBadges([...badges, 'First 10']);
      }
      if (newExpensesCount === 50 && !badges.includes('Half Century')) {
        setBadges([...badges, 'Half Century']);
      }
      if (newExpensesCount === 100 && !badges.includes('Century Master')) {
        setBadges([...badges, 'Century Master']);
      }

      if (streak >= 7 && !badges.includes('Week Warrior')) {
        setBadges([...badges, 'Week Warrior']);
      }
      if (streak >= 30 && !badges.includes('Monthly Master')) {
        setBadges([...badges, 'Monthly Master']);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = (id, updatedData) => {
    try {
      sqliteManager.deleteExpense(id);
      sqliteManager.addExpense({ ...updatedData, id });
      setExpenses(sqliteManager.getAllExpenses());
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        sqliteManager.deleteExpense(id);
        setExpenses(sqliteManager.getAllExpenses());
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const updateBudgets = (newBudgets) => {
    try {
      Object.entries(newBudgets).forEach(([category, amount]) => {
        sqliteManager.setBudget(category, amount);
      });
      setBudgets(newBudgets);
    } catch (error) {
      console.error('Error updating budgets:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        if (user && dbInitialized) {
          sqliteManager.saveDatabase(user.uid);
        }
        await signOut(auth);
        setUser(null);
        setExpenses([]);
        setBudgets({});
        setGoals([]);
        setRegretedPurchases([]);
        setFuturePurchases([]);
        setSubscriptions([]);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const getBudgetAlerts = () => {
    const categoryTotals = {};
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    });

    const alerts = [];
    Object.entries(categoryTotals).forEach(([category, spent]) => {
      const budget = budgets[category];
      if (budget && spent > budget) {
        alerts.push({
          category,
          spent,
          budget,
          overBy: spent - budget
        });
      }
    });
    return alerts;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Finote Ultimate...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AnimatedLogin onLoginSuccess={(user) => setUser(user)} />;
  }

  const budgetAlerts = getBudgetAlerts();
  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${theme} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardBg} shadow-md sticky top-0 z-50 border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Finote Ultimate</h1>
              <p className="text-xs opacity-70">Welcome, {user.email?.split('@')[0]}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded-full">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{streak}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${cardBg} border-b ${borderColor} sticky top-[73px] z-40 overflow-x-auto`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-2">
            {[
              { id: 'ultimate', icon: Rocket, label: 'Ultimate' },
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'expenses', icon: Wallet, label: 'Expenses' },
              { id: 'budget', icon: Target, label: 'Budget' },
              { id: 'goals', icon: Award, label: 'Goals' },
              { id: 'regret', icon: ThumbsDown, label: 'Regret' },
              { id: 'carbon', icon: Leaf, label: 'Carbon' },
              { id: 'time', icon: Clock, label: 'Time Value' },
              { id: 'future', icon: Gift, label: 'Future Plans' },
              { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' },
              // New/experimental features
              { id: 'wealth', icon: Award, label: '' },
              { id: 'social', icon: MessageSquare, label: '' },
              { id: 'bill', icon: SettingsIcon, label: '' },
              { id: 'leader', icon: Gift, label: '' },
              { id: 'alerts', icon: AlertCircle, label: 'Alerts' },
              { id: 'receipt', icon: CreditCard, label: 'Receipt Scanner' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  currentView === item.id
                    ? 'bg-blue-500 text-white'
                    : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (currentView === 'dashboard' || currentView === 'ultimate') && (
          <div className="mb-6">
            {budgetAlerts.map(alert => (
              <div key={alert.category} className={`${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-500'} border-l-4 p-4 mb-2 rounded`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-500'}`} />
                  <p className={darkMode ? 'text-red-200' : 'text-red-700'}>
                    <strong>{alert.category}</strong> budget exceeded by {CURRENCY_SYMBOLS[currency]}{alert.overBy.toFixed(2)}!
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Core Views */}
        {currentView === 'ultimate' && (
          <UltimateDashboard
            expenses={expenses}
            budgets={budgets}
            goals={goals}
            regretedPurchases={regretedPurchases}
            hourlyWage={hourlyWage}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            expenses={expenses}
            categories={CATEGORIES}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            badges={badges}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'expenses' && (
          <ExpensesList
            expenses={expenses}
            categories={CATEGORIES}
            updateExpense={updateExpense}
            deleteExpense={deleteExpense}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'budget' && (
          <BudgetManager
            expenses={expenses}
            categories={CATEGORIES}
            budgets={budgets}
            setBudgets={updateBudgets}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'goals' && (
          <GoalsManager
            goals={goals}
            setGoals={setGoals}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'regret' && (
          <RegretTracker
            expenses={expenses}
            regretedPurchases={regretedPurchases}
            setRegretedPurchases={setRegretedPurchases}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'carbon' && (
          <CarbonTracker
            expenses={expenses}
            categories={CATEGORIES}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'time' && (
          <TimeValueTracker
            expenses={expenses}
            categories={CATEGORIES}
            hourlyWage={hourlyWage}
            setHourlyWage={setHourlyWage}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'future' && (
          <FuturePlanner
            futurePurchases={futurePurchases}
            setFuturePurchases={setFuturePurchases}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'subscriptions' && (
          <SubscriptionManager
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'settings' && (
          <Settings
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currency={currency}
            setCurrency={setCurrency}
            notifications={notifications}
            setNotifications={setNotifications}
            expenses={expenses}
            setExpenses={setExpenses}
            budgets={budgets}
            setBudgets={setBudgets}
            goals={goals}
            setGoals={setGoals}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {/* Revolutionary Components */}
        {currentView === 'receipt' && (
          <EnhancedReceiptScanner
            onExpenseExtracted={addExpense}
            categories={CATEGORIES}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {/* Uncomment and implement if you want these views */}
        {/* {currentView === 'wealth' && (...)} */}
        {/* {currentView === 'social' && (...)} */}
        {/* {currentView === 'bill' && (...)} */}
        {/* {currentView === 'leader' && (...)} */}
        {/* {currentView === 'alerts' && (...)} */}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center z-50 animate-pulse"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onAdd={addExpense}
          categories={CATEGORIES}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;
