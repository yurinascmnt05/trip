/**
 * Trip Finance - App.js
 */

const STORAGE_KEY = 'tripFinanceData';

let appState = {
    budget: 0,
    expenses: [],
    profileNames: 'Yuri & Danny',
    travelHistory: []
};

function initData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            appState = { ...appState, ...parsed }; // Merging seguro
        } catch (e) {}
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function setBudget(newBudget) {
    appState.budget = newBudget;
    saveData();
}

function addExpense(name, amount, category) {
    const expense = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date: new Date().toISOString()
    };
    appState.expenses.push(expense);
    saveData();
}

function deleteExpense(id) {
    appState.expenses = appState.expenses.filter(expense => expense.id !== id);
    saveData();
}

function updateProfileNames(newName) {
    appState.profileNames = newName;
    saveData();
}

function addTrip(title, dateStr) {
    const trip = {
        id: Date.now().toString(),
        title,
        date: dateStr
    };
    appState.travelHistory.push(trip);
    saveData();
}

function deleteTrip(id) {
    appState.travelHistory = appState.travelHistory.filter(trip => trip.id !== id);
    saveData();
}

function getTotalSpent() {
    return appState.expenses.reduce((total, expense) => total + expense.amount, 0);
}

function getBalance() {
    return appState.budget - getTotalSpent();
}

function getProgressPercentage() {
    if (appState.budget <= 0) return 0;
    const spent = getTotalSpent();
    const percentage = (spent / appState.budget) * 100;
    return Math.min(percentage, 100);
}

function exportData() {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-finance-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(jsonData) {
    try {
        const parsed = JSON.parse(jsonData);
        if (parsed.budget !== undefined && Array.isArray(parsed.expenses)) {
            // Garante campos novos caso seja backup de versão antiga
            appState = {
                budget: 0,
                expenses: [],
                profileNames: 'Yuri & Danny',
                travelHistory: [],
                ...parsed
            };
            saveData();
            return true;
        } else {
            alert('Erro na Importação: Arquivo JSON inválido.');
            return false;
        }
    } catch (e) {
        alert('Erro ao processar o arquivo JSON.');
        return false;
    }
}

const CATEGORY_ICONS = {
    'Alimentação': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 2v10a4 4 0 0 1-8 0V2M7 2v20M17 2v20M17 2a4 4 0 0 1 4 4v4h-8V6a4 4 0 0 1 4-4z"></path></svg>',
    'Transporte': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>',
    'Hospedagem': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    'Lazer': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    'Compras': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
    'Outros': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
};

const els = {
    displayBudget: document.getElementById('display-budget'), // Agora é clicável
    displaySpent: document.getElementById('display-spent'),
    displayBalance: document.getElementById('display-balance'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    
    // Formulário
    expenseForm: document.getElementById('expense-form'),
    expenseName: document.getElementById('expense-name'),
    expenseAmount: document.getElementById('expense-amount'),
    expenseCategory: document.getElementById('expense-category'), // Input hidden
    
    // Cards de Categoria
    categoryCards: document.querySelectorAll('.category-card'),
    
    // Histórico
    expensesList: document.getElementById('expenses-list'),
    
    // Sincronização
    exportBtn: document.getElementById('export-btn'),
    importFile: document.getElementById('import-file'),
    
    // Perfil
    travelerNames: document.getElementById('traveler-names'),
    editProfileBtn: document.getElementById('edit-profile-btn'),
    tripList: document.getElementById('trip-list'),
    newTripForm: document.getElementById('new-trip-form'),
    tripName: document.getElementById('trip-name'),
    tripDate: document.getElementById('trip-date')
};

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function updateDashboardUI() {
    if (!els.displayBudget) return;
    
    const totalSpent = getTotalSpent();
    const balance = getBalance();
    
    // Mantendo o ícone SVG de lápis no displayBudget
    els.displayBudget.innerHTML = `
        ${formatCurrency(appState.budget)}
        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
    `;
    els.displaySpent.textContent = `-${formatCurrency(totalSpent)}`;
    
    if (els.displayBalance) {
        els.displayBalance.textContent = `Restante: ${formatCurrency(balance)}`;
    }
    
    const percentage = getProgressPercentage();
    if (els.progressText) {
        els.progressText.textContent = `${Math.floor(percentage)}%`;
        let leftPos = percentage;
        
        // Mantém a badge visível colada no início (0%) ou centralizada onde a barra enche
        if (leftPos <= 5) {
            els.progressText.style.left = `0`;
        } else if (leftPos > 90) {
            els.progressText.style.left = `calc(100% - 32px)`;
        } else {
            els.progressText.style.left = `calc(${leftPos}% - 16px)`;
        }
    }
    
    if (els.progressBar) {
        els.progressBar.style.width = `${percentage}%`;
    }
}

function renderExpensesList() {
    if (!els.expensesList) return;
    
    els.expensesList.innerHTML = ''; 
    const sortedExpenses = [...appState.expenses].reverse();
    
    let currentMonth = '';

    sortedExpenses.forEach(expense => {
        const dateObj = new Date(expense.date);
        
        const monthStr = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
        const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
        
        if (capitalizedMonth !== currentMonth) {
            currentMonth = capitalizedMonth;
            const header = document.createElement('h4');
            header.className = 'date-header';
            header.textContent = currentMonth;
            els.expensesList.appendChild(header);
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'expense-item';
        
        const timeStr = dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        const dateStr = dateObj.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'});
        
        const iconSvg = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS['Outros'];
        
        itemDiv.innerHTML = `
            <div class="expense-info-wrap">
                <div class="expense-icon">
                    ${iconSvg}
                </div>
                <div class="expense-details">
                    <strong>${expense.name}</strong>
                    <span>${timeStr} - ${dateStr} | ${expense.category}</span>
                </div>
            </div>
            <div class="expense-value-actions" style="display: flex; align-items: center; gap: 12px;">
                <div class="expense-value">
                    -${formatCurrency(expense.amount)}
                </div>
                <button class="delete-btn" data-id="${expense.id}" title="Excluir Gasto" style="background: transparent; border: none; cursor: pointer; color: #ff6b6b; padding: 4px; display: flex; align-items: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        els.expensesList.appendChild(itemDiv);
    });
}

function renderTrips() {
    if (!els.tripList) return;
    
    if (els.travelerNames) {
        els.travelerNames.textContent = appState.profileNames || 'Yuri & Danny';
    }
    
    els.tripList.innerHTML = '';
    
    const sortedTrips = [...appState.travelHistory].reverse();
    
    sortedTrips.forEach(trip => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trip-item';
        
        const dateObj = new Date(trip.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: '2-digit'});
        
        itemDiv.innerHTML = `
            <div class="trip-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div class="trip-details" style="flex: 1;">
                <strong>${trip.title}</strong>
                <span>${dateStr}</span>
            </div>
            <button class="delete-trip-btn" data-id="${trip.id}" title="Excluir Viagem" style="background: transparent; border: none; cursor: pointer; color: #ff6b6b; padding: 4px; display: flex; align-items: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        els.tripList.appendChild(itemDiv);
    });
}

function refreshUI() {
    updateDashboardUI();
    renderExpensesList();
    renderTrips();
}

// ================= LISTENERS =================

// Edição Intuitiva do Orçamento
if (els.displayBudget) {
    els.displayBudget.addEventListener('click', () => {
        const current = appState.budget || 0;
        const newValueStr = prompt('Qual o novo valor do seu Orçamento Previsto? (Somente números)', current);
        
        if (newValueStr !== null) {
            const newValue = parseFloat(newValueStr.replace(',', '.'));
            if (!isNaN(newValue) && newValue >= 0) {
                setBudget(newValue);
                refreshUI();
            } else {
                alert('Por favor, insira um valor numérico válido.');
            }
        }
    });
}

// Seleção das Categorias no Grid
if (els.categoryCards && els.categoryCards.length > 0) {
    els.categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            els.categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            els.expenseCategory.value = card.dataset.value;
        });
    });
}

// Submissão do Formulário
if (els.expenseForm) {
    els.expenseForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const name = els.expenseName.value.trim();
        const amount = parseFloat(els.expenseAmount.value);
        const category = els.expenseCategory.value;
        
        if (!category) {
            alert('Por favor, selecione uma Categoria clicando nos ícones acima!');
            return;
        }
        
        if (name && !isNaN(amount) && amount > 0) {
            addExpense(name, amount, category); 
            refreshUI();
            
            // Resetar formulário
            els.expenseForm.reset();
            els.expenseCategory.value = '';
            els.categoryCards.forEach(c => c.classList.remove('selected'));
            
            alert('Gasto adicionado com sucesso!');
        }
    });
}

// Export/Import
if (els.exportBtn) els.exportBtn.addEventListener('click', () => exportData());
if (els.importFile) {
    els.importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const success = importData(event.target.result);
            if (success) {
                refreshUI(); 
                alert('Dados sincronizados com sucesso!');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    });
}

// Lidar com a deleção na lista (Event Delegation)
if (els.expensesList) {
    els.expensesList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            const id = btn.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                deleteExpense(id);
                refreshUI(); // Atualiza barra de progresso, saldo e lista na hora
            }
        }
    });
}

// Lógica da Aba Perfil
if (els.editProfileBtn) {
    els.editProfileBtn.addEventListener('click', () => {
        const currentName = appState.profileNames || 'Yuri & Danny';
        const newName = prompt('Quem está viajando?', currentName);
        if (newName && newName.trim() !== '') {
            updateProfileNames(newName.trim());
            refreshUI();
        }
    });
}

if (els.newTripForm) {
    els.newTripForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = els.tripName.value.trim();
        const dateStr = els.tripDate.value;
        
        if (title && dateStr) {
            addTrip(title, dateStr);
            refreshUI();
            els.newTripForm.reset();
            alert('Viagem registrada com sucesso!');
        }
    });
}

if (els.tripList) {
    els.tripList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-trip-btn');
        if (btn) {
            const id = btn.dataset.id;
            if (confirm('Tem certeza que deseja apagar este histórico de viagem?')) {
                deleteTrip(id);
                refreshUI();
            }
        }
    });
}

// Iniciar
initApp();

function initApp() {
    initData();
    refreshUI();
}
