import initSqlJs from 'sql.js';

class SQLiteManager {
  constructor() {
    this.db = null;
    this.SQL = null;
  }

  async initialize(userId) {
    try {
      this.SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      // Load existing database or create new one
      const savedDb = localStorage.getItem(`finote_db_${userId}`);
      
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new this.SQL.Database(uint8Array);
      } else {
        this.db = new this.SQL.Database();
        this.createTables();
      }

      return true;
    } catch (error) {
      console.error('SQLite initialization error:', error);
      return false;
    }
  }

  createTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        tags TEXT,
        mood TEXT,
        recurring INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target REAL NOT NULL,
        current REAL DEFAULT 0,
        deadline TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        frequency TEXT NOT NULL,
        next_billing TEXT,
        cancel_reminder INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS regrets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_id INTEGER,
        regret_date TEXT,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS future_purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_savings REAL DEFAULT 0,
        target_date TEXT,
        priority TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  saveDatabase(userId) {
    if (this.db) {
      const data = this.db.export();
      const buffer = Array.from(data);
      localStorage.setItem(`finote_db_${userId}`, JSON.stringify(buffer));
    }
  }

  // Expenses operations
  addExpense(expense) {
    const stmt = this.db.prepare(`
      INSERT INTO expenses (amount, category, description, date, tags, mood, recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      expense.amount,
      expense.category,
      expense.description,
      expense.date,
      JSON.stringify(expense.tags || []),
      expense.mood || 'neutral',
      expense.recurring ? 1 : 0
    ]);
    stmt.free();
  }

  getAllExpenses() {
    const result = this.db.exec('SELECT * FROM expenses ORDER BY date DESC');
    if (result.length === 0) return [];
    
    const expenses = [];
    const columns = result[0].columns;
    const values = result[0].values;
    
    values.forEach(row => {
      const expense = {};
      columns.forEach((col, idx) => {
        expense[col] = row[idx];
        if (col === 'tags') {
          expense[col] = JSON.parse(row[idx] || '[]');
        }
      });
      expenses.push(expense);
    });
    
    return expenses;
  }

  deleteExpense(id) {
    this.db.run('DELETE FROM expenses WHERE id = ?', [id]);
  }

  // Budgets operations
  setBudget(category, amount) {
    this.db.run(`
      INSERT OR REPLACE INTO budgets (category, amount, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [category, amount]);
  }

  getAllBudgets() {
    const result = this.db.exec('SELECT category, amount FROM budgets');
    if (result.length === 0) return {};
    
    const budgets = {};
    result[0].values.forEach(row => {
      budgets[row[0]] = row[1];
    });
    
    return budgets;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default new SQLiteManager();

