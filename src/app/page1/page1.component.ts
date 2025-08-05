import { Component, OnInit } from '@angular/core';
import { Investment, Expense, MonthlyIncome, MonthlyBudget } from 'src/app/investment.model';
import { ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-page1',
  templateUrl: './page1.component.html',
  styleUrls: ['./page1.component.scss']
})
export class Page1Component implements OnInit {
  // Investment properties
  investmentTypes = ['FD', 'RD', 'PPF', 'Savings'];
  chartType: ChartType = 'pie';
  newInvestment: Investment = {
    type: 'FD',
    amount: 0,
    startDate: new Date(),
    durationMonths: 12,
    interestRate: 0
  };
  investments: Investment[] = [];
  totalByType: { [key: string]: number } = {};
  pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  // Expense properties
  expenseCategories = [
    'Food & Dining',
    'Petrol',
    'Tea & Coffee ',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Insurance',
    'Rent/EMI',
    'Others'
  ];
  newExpense: Expense = {
    id: '',
    category: 'Food & Dining',
    description: '',
    amount: 0,
    date: new Date(),
    type: 'one-time'
  };
  expenses: Expense[] = [];
  expensesByCategory: { [key: string]: number } = {};
  
  // Filter properties - NEW
  showFilters: boolean = false;
  expenseFilterMonth: string = new Date().toISOString().substring(0, 7);
  expenseFilterCategory: string = '';
  expenseFilterType: string = '';
  filteredExpenses: Expense[] = [];
  filteredExpensesByCategory: { [key: string]: number } = {};

  // Income properties
  incomeSources = [
    'Salary',
    'Freelance',
    'Business',
    'Investment Returns',
    'Rental Income',
    'Bonus',
    'Commission',
    'Part-time Job',
    'Others'
  ];
  newIncome: MonthlyIncome = {
    id: '',
    source: 'Salary',
    description: '',
    amount: 0,
    date: new Date(),
    type: 'monthly'
  };
  incomes: MonthlyIncome[] = [];
  incomesBySource: { [key: string]: number } = {};

  // Budget properties
  activeTab: string = 'investments';
  selectedMonth: string = new Date().toISOString().substring(0, 7);
  
  budgetChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  objectKeys = Object.keys;

  // ngOnInit() {
  //   this.loadFromLocal();
  //   this.updateBudgetSummary();
  //   this.filterExpensesByMonth();
  // }

  // Tab Management
  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'budget') {
      this.updateBudgetSummary();
    }
  }

  // NEW: Filter toggle method
  toggleFilters() {
    this.showFilters = !this.showFilters;
    this.saveFilterSettings();
  }

  // NEW: Clear filters method
  clearFilters() {
    this.expenseFilterMonth = new Date().toISOString().substring(0, 7);
    this.expenseFilterCategory = '';
    this.expenseFilterType = '';
    this.filterExpensesByMonth();
    this.saveFilterSettings();
  }

  // // Investment Methods
  // addInvestment() {
  //   if (this.newInvestment.type === 'PPF') {
  //     this.newInvestment.durationMonths = 180; // 15 years
  //   }
    
  //   this.investments.push({ ...this.newInvestment });
  //   this.saveToLocal();
  //   console.log('New investment added:', this.newInvestment);
  //   this.updateChart();
    
  //   // Reset form
  //   this.newInvestment = {
  //     type: 'FD',
  //     amount: 0,
  //     startDate: new Date(),
  //     durationMonths: 12,
  //     interestRate: 0
  //   };
  //   this.updateBudgetSummary();
  // }

  // Expense Methods
  addExpense() {
    this.newExpense.id = this.generateId();
    this.expenses.push({ ...this.newExpense });
    this.saveToLocal();
    console.log('New expense added:', this.newExpense);
    this.updateExpenseSummary();
    this.filterExpensesByMonth();
    
    // Reset form
    this.newExpense = {
      id: '',
      category: 'Food & Dining',
      description: '',
      amount: 0,
      date: new Date(),
      type: 'one-time'
    };
    this.updateBudgetSummary();
  }

  deleteExpense(expenseId: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
      this.saveToLocal();
      this.updateExpenseSummary();
      this.filterExpensesByMonth();
      this.updateBudgetSummary();
    }
  }

  // Income Methods
  addIncome() {
    this.newIncome.id = this.generateId();
    this.incomes.push({ ...this.newIncome });
    this.saveToLocal();
    console.log('New income added:', this.newIncome);
    this.updateIncomeSummary();
    
    // Reset form
    this.newIncome = {
      id: '',
      source: 'Salary',
      description: '',
      amount: 0,
      date: new Date(),
      type: 'monthly'
    };
    this.updateBudgetSummary();
  }

  deleteIncome(incomeId: string) {
    if (confirm('Are you sure you want to delete this income?')) {
      this.incomes = this.incomes.filter(income => income.id !== incomeId);
      this.saveToLocal();
      this.updateIncomeSummary();
      this.updateBudgetSummary();
    }
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // UPDATED: Expense filtering methods
  filterExpensesByMonth() {
    if (!this.expenseFilterMonth) {
      this.filteredExpenses = [...this.expenses];
    } else {
      const [year, month] = this.expenseFilterMonth.split('-').map(Number);
      
      this.filteredExpenses = this.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth() + 1;
        
        let dateMatch = false;
        
        if (expense.type === 'monthly') {
          // For monthly expenses, show if the expense was active during the selected month
          dateMatch = expenseYear <= year && (expenseYear < year || expenseMonth <= month);
        } else {
          // For one-time expenses, show only if they occurred in the selected month
          dateMatch = expenseYear === year && expenseMonth === month;
        }
        
        const categoryMatch = !this.expenseFilterCategory || expense.category === this.expenseFilterCategory;
        const typeMatch = !this.expenseFilterType || expense.type === this.expenseFilterType;
        
        return dateMatch && categoryMatch && typeMatch;
      });
    }
    
    this.updateFilteredExpenseSummary();
    this.saveFilterSettings();
  }

  updateFilteredExpenseSummary() {
    this.filteredExpensesByCategory = {};
    this.filteredExpenses.forEach(expense => {
      this.filteredExpensesByCategory[expense.category] = 
        (this.filteredExpensesByCategory[expense.category] || 0) + expense.amount;
    });
  }

  getFilteredExpenseTotal(): number {
    return this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  updateExpenseSummary() {
    this.expensesByCategory = {};
    this.expenses.forEach(expense => {
      this.expensesByCategory[expense.category] = 
        (this.expensesByCategory[expense.category] || 0) + expense.amount;
    });
  }

  updateIncomeSummary() {
    this.incomesBySource = {};
    this.incomes.forEach(income => {
      this.incomesBySource[income.source] = 
        (this.incomesBySource[income.source] || 0) + income.amount;
    });
  }

  getTotalOneTimeExpenses(): number {
    return this.expenses
      .filter(expense => expense.type === 'one-time')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalMonthlyExpenses(): number {
    return this.expenses
      .filter(expense => expense.type === 'monthly')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalExpenses(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  getTotalMonthlyIncome(): number {
    return this.incomes
      .filter(income => income.type === 'monthly')
      .reduce((sum, income) => sum + income.amount, 0);
  }

  getTotalOneTimeIncome(): number {
    return this.incomes
      .filter(income => income.type === 'one-time')
      .reduce((sum, income) => sum + income.amount, 0);
  }

  getTotalIncome(): number {
    return this.incomes.reduce((sum, income) => sum + income.amount, 0);
  }

  // Budget Methods
  updateBudgetSummary() {
    const monthlyIncome = this.getMonthlyIncomeForMonth(this.selectedMonth);
    const monthlyExpenses = this.getMonthlyExpensesForMonth(this.selectedMonth);
    const monthlyInvestments = this.getMonthlyInvestmentsForMonth(this.selectedMonth);
    const remaining = monthlyIncome - monthlyExpenses - monthlyInvestments;

    // Update budget chart
    this.budgetChartData = {
      labels: ['Expenses', 'Investments', 'Remaining'],
      datasets: [{
        data: [monthlyExpenses, monthlyInvestments, Math.max(0, remaining)],
        backgroundColor: [
          '#FF6384', // Red for expenses
          '#36A2EB', // Blue for investments
          '#4BC0C0'  // Teal for remaining
        ]
      }]
    };
  }

  getMonthlyIncomeForMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    
    return this.incomes
      .filter(income => {
        if (income.type === 'monthly') {
          const incomeDate = new Date(income.date);
          // Monthly income counts if it started before or during the selected month
          return incomeDate.getFullYear() < year || 
                 (incomeDate.getFullYear() === year && incomeDate.getMonth() <= monthNum - 1);
        } else {
          // One-time income only counts if it's in the selected month
          const incomeDate = new Date(income.date);
          return incomeDate.getFullYear() === year && 
                 incomeDate.getMonth() === monthNum - 1;
        }
      })
      .reduce((sum, income) => sum + income.amount, 0);
  }

  getMonthlyExpensesForMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    
    return this.expenses
      .filter(expense => {
        if (expense.type === 'monthly') {
          const expenseDate = new Date(expense.date);
          // Monthly expenses count if they started before or during the selected month
          return expenseDate.getFullYear() < year || 
                 (expenseDate.getFullYear() === year && expenseDate.getMonth() <= monthNum - 1);
        } else {
          // One-time expenses only count if they're in the selected month
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year && 
                 expenseDate.getMonth() === monthNum - 1;
        }
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  getMonthlyInvestmentsForMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    const selectedDate = new Date(year, monthNum - 1, 1);
    
    return this.investments
      .filter(investment => {
        if (investment.type === 'PPF' || investment.type === 'RD') {
          const startDate = new Date(investment.startDate);
          const endDate = this.invEndDate(startDate, investment.durationMonths);
          
          return selectedDate >= startDate && selectedDate <= endDate;
        }
        return false; // FD and Savings are one-time investments
      })
      .reduce((sum, investment) => sum + investment.amount, 0);
  }

  getRemainingAmount(): number {
    return this.getMonthlyIncomeForMonth(this.selectedMonth) - 
           this.getMonthlyExpensesForMonth(this.selectedMonth) - 
           this.getMonthlyInvestmentsForMonth(this.selectedMonth);
  }

  getMonthDisplay(month: string): string {
    if (!month) return 'All Time';
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  // UPDATED: Storage Methods with filter settings
  saveToLocal() {
    const data = {
      investments: this.investments,
      expenses: this.expenses,
      incomes: this.incomes,
      filterSettings: {
        showFilters: this.showFilters,
        expenseFilterMonth: this.expenseFilterMonth,
        expenseFilterCategory: this.expenseFilterCategory,
        expenseFilterType: this.expenseFilterType
      }
    };
    localStorage.setItem('financialData', JSON.stringify(data));
  }

  // NEW: Save filter settings separately
  saveFilterSettings() {
    const data = JSON.parse(localStorage.getItem('financialData') || '{}');
    data.filterSettings = {
      showFilters: this.showFilters,
      expenseFilterMonth: this.expenseFilterMonth,
      expenseFilterCategory: this.expenseFilterCategory,
      expenseFilterType: this.expenseFilterType
    };
    localStorage.setItem('financialData', JSON.stringify(data));
  }

  loadFromLocal() {
    const saved = localStorage.getItem('financialData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Load investments
        if (parsed.investments) {
          this.investments = parsed.investments.map((inv: any) => ({
            ...inv,
            startDate: new Date(inv.startDate)
          }));
          this.updateChart();
        }
        
        // Load expenses
        if (parsed.expenses) {
          this.expenses = parsed.expenses.map((exp: any) => ({
            ...exp,
            date: new Date(exp.date)
          }));
          this.updateExpenseSummary();
        }
        
        // Load incomes
        if (parsed.incomes) {
          this.incomes = parsed.incomes.map((inc: any) => ({
            ...inc,
            date: new Date(inc.date)
          }));
          this.updateIncomeSummary();
        }

        // NEW: Load filter settings
        if (parsed.filterSettings) {
          this.showFilters = parsed.filterSettings.showFilters || false;
          this.expenseFilterMonth = parsed.filterSettings.expenseFilterMonth || new Date().toISOString().substring(0, 7);
          this.expenseFilterCategory = parsed.filterSettings.expenseFilterCategory || '';
          this.expenseFilterType = parsed.filterSettings.expenseFilterType || '';
        }
        
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }

  // clearAllInvestments() {
  //   if (confirm('Are you sure you want to clear all investments? This cannot be undone.')) {
  //     this.investments = [];
  //     this.saveToLocal();
  //     this.updateChart();
  //     this.updateBudgetSummary();
  //   }
  // }

  clearAllExpenses() {
    if (confirm('Are you sure you want to clear all expenses? This cannot be undone.')) {
      this.expenses = [];
      this.saveToLocal();
      this.updateExpenseSummary();
      this.filterExpensesByMonth();
      this.updateBudgetSummary();
    }
  }

  clearAllIncomes() {
    if (confirm('Are you sure you want to clear all incomes? This cannot be undone.')) {
      this.incomes = [];
      this.saveToLocal();
      this.updateIncomeSummary();
      this.updateBudgetSummary();
    }
  }

  // Investment calculation methods (keeping all existing methods)
  invEndDate(start: Date, duration: number): Date {
    const result = new Date(start);
    result.setMonth(result.getMonth() + duration);
    return result;
  }

  getMonthsElapsed(startDate: Date): number {
    const now = new Date();
    const start = new Date(startDate);

    
    
      // Calculate the difference in months
    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months += now.getMonth() - start.getMonth();
    
    // If the current date is after the start date in the month, count this month
    if (now.getDate() >= start.getDate()) {
      months += 1;
    }
    
    return Math.max(0, months);
  }
  

  getMaturityAndCurrentValue(investment: Investment): {
    currentValue: number;
    maturityValue: number;
    investedSoFar: number;
  } {
    const r = investment.interestRate / 100;
    const monthsElapsed = this.getMonthsElapsed(investment.startDate);
    const totalMonths = investment.type === 'PPF' ? 180 : investment.durationMonths;
    
    let current = 0, maturity = 0, invested = 0;

    switch (investment.type) {
      case 'FD':
        invested = investment.amount;
        const yearsElapsed = monthsElapsed / 12;
        const totalYears = totalMonths / 12;
        
        current = investment.amount * Math.pow(1 + r, yearsElapsed);
        maturity = investment.amount * Math.pow(1 + r, totalYears);
        break;

      case 'RD':
        invested = investment.amount * monthsElapsed;
        
        current = 0;
        for (let month = 1; month <= monthsElapsed; month++) {
         const monthsEarningInterest = monthsElapsed - month;
           current += investment.amount * Math.pow(1 + r/12, monthsEarningInterest);
        }
        
        maturity = 0;
        for (let month = 1; month <= totalMonths; month++) {
          const monthsEarningInterest = totalMonths - month + 1;
          maturity += investment.amount * Math.pow(1 + r/12, monthsEarningInterest - 1);
        }
        break;

      case 'PPF':
        const monthsElapsedPPF = Math.min(180, monthsElapsed);
        invested = investment.amount * monthsElapsedPPF;

          // PPF calculation with yearly compounding but monthly contributions
        const yearlyContributions = investment.amount * 12;
        const yearsElapsedPPF = Math.floor(monthsElapsedPPF / 12);
        const remainingMonths = monthsElapsedPPF % 12;
        
        current = 0;
        // const monthlyRate = Math.pow(1 + r, 1/12) - 1;
        
        for (let year = 1; year <= yearsElapsedPPF; year++) {
               const yearsEarningInterest = yearsElapsedPPF - year + 1;
        current += yearlyContributions * Math.pow(1 + r, yearsEarningInterest);
        }

           current += investment.amount * remainingMonths;
        
        maturity = 0;
       for (let year = 1; year <= 15; year++) {
           const yearsEarningInterest = 15 - year + 1;
           maturity += yearlyContributions * Math.pow(1 + r, yearsEarningInterest);
        }
        break;

      case 'Savings':
        invested = investment.amount;
        const savingsYears = monthsElapsed / 12;
        current = investment.amount * (1 + r * savingsYears);
        maturity = investment.amount * (1 + r * (totalMonths / 12));
        break;
    }

    return {
      currentValue: Math.round(current),
      maturityValue: Math.round(maturity),
      investedSoFar: Math.round(invested)
    };
  }

  updateChart() {
    const grouped: { [key: string]: number } = {};
    this.totalByType = {};

    this.investments.forEach(inv => {
      const { maturityValue, investedSoFar } = this.getMaturityAndCurrentValue(inv);
      grouped[inv.type] = (grouped[inv.type] || 0) + maturityValue;
      this.totalByType[inv.type] = (this.totalByType[inv.type] || 0) + investedSoFar;
    });

    this.pieChartData = {
      labels: Object.keys(grouped),
      datasets: [{
        data: Object.values(grouped),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    };

    console.log('Updated pie data:', this.pieChartData);
    console.log('Total by type:', this.totalByType);
  }

  // Helper methods for display
  getEndDateDisplay(investment: Investment): string {
    if (investment.type === 'PPF') {
      return 'After 15 Years';
    }
    return this.invEndDate(investment.startDate, investment.durationMonths).toLocaleDateString('en-GB');
  }

  getAmountDisplay(investment: Investment): string {
    if (investment.type === 'FD' || investment.type === 'Savings') {
      return `₹${investment.amount.toLocaleString()}`;
    } else if (investment.type === 'PPF') {
      return `₹${investment.amount.toLocaleString()} / Month (₹${(investment.amount * 12).toLocaleString()} / Year)`;
    } else {
      return `₹${investment.amount.toLocaleString()} / Month`;
    }
  }

  getTotalInvested(): number {
    return Object.keys(this.totalByType).reduce((sum, key) => sum + this.totalByType[key], 0);
  }

  getTotalCurrentValue(): number {
    return this.investments.reduce((sum, inv) => sum + this.getMaturityAndCurrentValue(inv).currentValue, 0);
  }

  getTotalMaturityValue(): number {
    return this.investments.reduce((sum, inv) => sum + this.getMaturityAndCurrentValue(inv).maturityValue, 0);
  }

getMonthlyBreakdown(investment: Investment): string[] {
  if (investment.type !== 'RD' && investment.type !== 'PPF') {
    return [];
  }

  const breakdown: string[] = [];
  const startDate = new Date(investment.startDate);
  const today = new Date();

  const dueDay = startDate.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let current = new Date(startDate);

  while (
    current.getFullYear() < today.getFullYear() ||
    (current.getFullYear() === today.getFullYear() && current.getMonth() < today.getMonth()) ||
    (current.getFullYear() === today.getFullYear() &&
     current.getMonth() === today.getMonth() &&
     dueDay <= today.getDate())
  ) {
    const monthName = monthNames[current.getMonth()];
    const year = current.getFullYear().toString().slice(-2);

    breakdown.push(`${monthName} ${year}: ₹${investment.amount.toLocaleString()}`);

    current.setMonth(current.getMonth() + 1);
  }

  return breakdown;
}


  hasMonthlyBreakdown(investment: Investment): boolean {
    return (investment.type === 'RD' || investment.type === 'PPF') && 
           this.getMonthsElapsed(investment.startDate) > 0;
  }
  getTotalMonthlySpend(): number {
  return this.getMonthlyExpensesForMonth(this.selectedMonth) 
  
  // + 
  //        this.getMonthlyInvestmentsForMonth(this.selectedMonth);
}














// Add these methods to your Page1Component class

/**
 * Automatically generate monthly investment expenses based on active investments
 * Call this method periodically or when loading the component
 */
generateAutomaticInvestmentExpenses() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get all active monthly investments (RD, PPF)
  const monthlyInvestments = this.investments.filter(inv => 
    inv.type === 'RD' || inv.type === 'PPF'
  );

  monthlyInvestments.forEach(investment => {
    const startDate = new Date(investment.startDate);
    const endDate = this.invEndDate(startDate, investment.durationMonths);
    
    // Check if investment is active for current month
    if (today >= startDate && today <= endDate) {
      // Generate expense ID for this month and investment
      const expenseId = `auto_${investment.type}_${currentYear}_${currentMonth}_${this.investments.indexOf(investment)}`;
      
      // Check if expense already exists for this month
      const existingExpense = this.expenses.find(exp => exp.id === expenseId);
      
      if (!existingExpense) {
        // Create automatic expense entry
        const autoExpense: Expense = {
          id: expenseId,
          category: 'Investment', // Add 'Investment' to your expenseCategories array
          description: `Auto: ${investment.type} Monthly Payment`,
          amount: investment.amount,
          date: new Date(currentYear, currentMonth, startDate.getDate()),
          type: 'monthly'
        };
        
        this.expenses.push(autoExpense);
        console.log(`Auto-generated expense for ${investment.type}:`, autoExpense);
      }
    }
  });
  
  // Update summaries and save
  this.updateExpenseSummary();
  this.filterExpensesByMonth();
  this.saveToLocal();
}

/**
 * Generate expenses for all past months where investments were active
 * Use this for initial setup or data migration
 */
generateHistoricalInvestmentExpenses() {
  const monthlyInvestments = this.investments.filter(inv => 
    inv.type === 'RD' || inv.type === 'PPF'
  );

  monthlyInvestments.forEach(investment => {
    const startDate = new Date(investment.startDate);
    const endDate = this.invEndDate(startDate, investment.durationMonths);
    const today = new Date();
    
    // Generate expenses for each month from start to current or end date
    let currentDate = new Date(startDate);
    
     while (currentDate <= endDate && currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const expenseId = `auto_${investment.type}_${year}_${month}_${this.investments.indexOf(investment)}`;
      const existingExpense = this.expenses.find(exp => exp.id === expenseId);
      
      if (!existingExpense) {
        const autoExpense: Expense = {
          id: expenseId,
          category: 'Investment',
          description: `Auto: ${investment.type} Monthly Payment`,
          amount: investment.amount,
          date: new Date(year, month, startDate.getDate()),
          type: 'monthly'
        };
        
        this.expenses.push(autoExpense);
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  });
  
  this.updateExpenseSummary();
  this.filterExpensesByMonth();
  this.saveToLocal();
}

/**
 * Check for due investments and generate expenses
 * Call this method when the app loads or on a schedule
 */
checkAndGenerateInvestmentExpenses() {
  const today = new Date();
  
  this.investments.forEach(investment => {
    if (investment.type === 'RD' || investment.type === 'PPF') {
      const startDate = new Date(investment.startDate);
      const endDate = this.invEndDate(startDate, investment.durationMonths);
      
      // Check if today is the due date for this investment
      const isDueToday = today.getDate() === startDate.getDate() && 
                        today >= startDate && today <= endDate;
      
      if (isDueToday) {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const expenseId = `auto_${investment.type}_${currentYear}_${currentMonth}_${this.investments.indexOf(investment)}`;
        
        const existingExpense = this.expenses.find(exp => exp.id === expenseId);
        
        if (!existingExpense) {
          const autoExpense: Expense = {
            id: expenseId,
            category: 'Investment',
            description: `Auto: ${investment.type} Monthly Payment - Due Today`,
            amount: investment.amount,
            date: new Date(),
            type: 'monthly'
          };
          
          this.expenses.push(autoExpense);
          this.updateExpenseSummary();
          this.filterExpensesByMonth();
          this.saveToLocal();
          
          // Optional: Show notification to user
          alert(`Investment due today: ${investment.type} - ₹${investment.amount}`);
        }
      }
    }
  });
}

/**
 * Remove auto-generated expenses for investments that are no longer active
 */
cleanupInactiveInvestmentExpenses() {
  const activeInvestmentIds = this.investments
    .filter(inv => inv.type === 'RD' || inv.type === 'PPF')
    .map((inv, index) => index);
  
  // Remove auto-generated expenses for investments that no longer exist
  this.expenses = this.expenses.filter(expense => {
    if (expense.id.startsWith('auto_')) {
      const parts = expense.id.split('_');
      const investmentIndex = parseInt(parts[parts.length - 1]);
      return activeInvestmentIds.includes(investmentIndex);
    }
    return true; // Keep non-auto expenses
  });
  
  this.updateExpenseSummary();
  this.filterExpensesByMonth();
  this.saveToLocal();
}

// Modified ngOnInit to include automatic expense generation
ngOnInit() {

  this.loadFromLocal();
  
  // Add 'Investment' to expense categories if not present
  if (!this.expenseCategories.includes('Investment')) {
    this.expenseCategories.push('Investment');
  }
  
  // Generate automatic investment expenses
  this.generateAutomaticInvestmentExpenses();
  
  // Optional: Generate historical expenses (uncomment if needed)
  // this.generateHistoricalInvestmentExpenses();
  
  this.updateBudgetSummary();
  this.filterExpensesByMonth();
  
  // Optional: Set up periodic check (every day)
  this.setupPeriodicExpenseCheck();
}

/**
 * Set up periodic checking for investment due dates
 * This would run daily to check for new investment payments
 */
setupPeriodicExpenseCheck() {
  // Check once when app loads
  this.checkAndGenerateInvestmentExpenses();
  
  // Optional: Set up interval to check daily (24 hours)
  setInterval(() => {
    this.checkAndGenerateInvestmentExpenses();
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
}

/**
 * Method to manually trigger expense generation (for testing)
 */
manuallyGenerateInvestmentExpenses() {
  if (confirm('Generate automatic investment expenses for all active investments?')) {
    this.generateHistoricalInvestmentExpenses();
    alert('Investment expenses generated successfully!');
  }
}
















// Add these helper methods to your Page1Component class

/**
 * Check if there are any auto-generated expenses
 */
hasAutoGeneratedExpenses(): boolean {
  return this.expenses.some(expense => expense.id.startsWith('auto_'));
}

/**
 * Get total auto-generated expenses for current month
 */
getAutoExpensesForCurrentMonth(): number {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return this.expenses
    .filter(expense => {
      if (!expense.id.startsWith('auto_')) return false;
      
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Get total of all auto-generated expenses
 */
getTotalAutoExpenses(): number {
  return this.expenses
    .filter(expense => expense.id.startsWith('auto_'))
    .reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Get upcoming investment due dates
 */
getUpcomingInvestmentDueDates(): Array<{investment: Investment, dueDate: Date, amount: number}> {
  const today = new Date();
  const upcomingDues: Array<{investment: Investment, dueDate: Date, amount: number}> = [];
  
  this.investments.forEach(investment => {
    if (investment.type === 'RD' || investment.type === 'PPF') {
      const startDate = new Date(investment.startDate);
      const endDate = this.invEndDate(startDate, investment.durationMonths);
      
      // Calculate next due date
      const nextDue = new Date(today.getFullYear(), today.getMonth(), startDate.getDate());
      
      // If this month's due date has passed, move to next month
      if (nextDue < today) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }
      
      // Check if investment is still active
      if (nextDue <= endDate) {
        upcomingDues.push({
          investment: investment,
          dueDate: nextDue,
          amount: investment.amount
        });
      }
    }
  });
  
  return upcomingDues.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

/**
 * Modified addInvestment method to generate automatic expenses
 */
addInvestment() {
  if (this.newInvestment.type === 'PPF') {
    this.newInvestment.durationMonths = 180; // 15 years
  }
  
  this.investments.push({ ...this.newInvestment });
  
  // Generate automatic expenses for the new investment if it's monthly
  if (this.newInvestment.type === 'RD' || this.newInvestment.type === 'PPF') {
    this.generateAutomaticInvestmentExpenses();
  }
  
  this.saveToLocal();
  console.log('New investment added:', this.newInvestment);
  this.updateChart();
  
  // Reset form
  this.newInvestment = {
    type: 'FD',
    amount: 0,
    startDate: new Date(),
    durationMonths: 12,
    interestRate: 0
  };
  this.updateBudgetSummary();
}

/**
 * Modified clearAllInvestments to also clear auto-generated expenses
 */
clearAllInvestments() {
  if (confirm('Are you sure you want to clear all investments? This will also remove auto-generated expenses.')) {
    // Remove auto-generated expenses first
    this.expenses = this.expenses.filter(expense => !expense.id.startsWith('auto_'));
    
    // Clear investments
    this.investments = [];
    
    this.saveToLocal();
    this.updateChart();
    this.updateExpenseSummary();
    this.filterExpensesByMonth();
    this.updateBudgetSummary();
  }
}

/**
 * Check if an expense is auto-generated
 */
isAutoGeneratedExpense(expense: Expense): boolean {
  return expense.id.startsWith('auto_');
}

/**
 * Get the source investment for an auto-generated expense
 */
getSourceInvestmentForExpense(expense: Expense): Investment | null {
  if (!this.isAutoGeneratedExpense(expense)) return null;
  
  const parts = expense.id.split('_');
  if (parts.length >= 4) {
    const investmentIndex = parseInt(parts[parts.length - 1]);
    return this.investments[investmentIndex] || null;
  }
  
  return null;
}
}