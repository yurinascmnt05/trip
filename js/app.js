/**
 * Trip Finance - App.js (Conectado ao Firebase Firestore)
 * Sincronização automática em tempo real entre dispositivos.
 */

// 1. Sua configuração oficial do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnPakKmHLv4OJyiaKGHSiutvWiKIX1fHY",
    authDomain: "tripfinance-e0317.firebaseapp.com",
    projectId: "tripfinance-e0317",
    storageBucket: "tripfinance-e0317.firebasestorage.app",
    messagingSenderId: "77973862918",
    appId: "1:77973862918:web:3ba6f68c9ec57c7bf6e187"
};

// 2. Inicializar o app e o banco de dados
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const DOC_REF = db.collection("tripData").doc("casalBackup");

let appState = {
    budget: 0,
    expenses: [],
    profileNames: 'Yuri & Danny',
    travelHistory: []
};

// ================= FIREBASE SYNC ENGINE =================

// Escuta mudanças no banco em TEMPO REAL (Qualquer celular que atualizar)
function initDataRealtime() {
    DOC_REF.onSnapshot((doc) => {
        if (doc.exists) {
            appState = { ...appState, ...doc.data() };
            refreshUI();
            checkOnboarding(); // Verifica se precisa pedir o orçamento após carregar os dados
        } else {
            // Se for a primeira vez abrindo o app, cria o documento zerado na nuvem
            saveDataToCloud();
            checkOnboarding();
        }
    }, (error) => {
        console.error("Erro ao sincronizar com o Firebase:", error);
    });
}

// Salva o estado atual na nuvem
function saveDataToCloud() {
    DOC_REF.set(appState).catch((err) => {
        console.error("Erro ao salvar no Firebase:", err);
        alert("Erro de conexão ao tentar salvar os dados.");
    });
}

// Funções de manipulação atualizadas para disparar o salvamento na nuvem
function setBudget(newBudget) {
    appState.budget = newBudget;
    saveDataToCloud();
}

function addExpense(name, amount, category) {
    const currentUser = localStorage.getItem('trip_current_user') || 'Alguém';
    const expense = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date: new Date().toISOString(),
        addedBy: currentUser
    };
    appState.expenses.push(expense);
    saveDataToCloud();
}

function deleteExpense(id) {
    appState.expenses = appState.expenses.filter(exp => exp.id !== id);
    saveDataToCloud();
}

function updateProfileNames(newName) {
    appState.profileNames = newName;
    saveDataToCloud();
}

function addTrip(title, dateStr) {
    appState.travelHistory.push({
        id: Date.now().toString(),
        title,
        date: dateStr
    });
    saveDataToCloud();
}

function deleteTrip(id) {
    appState.travelHistory = appState.travelHistory.filter(trip => trip.id !== id);
    saveDataToCloud();
}

// ================= MATEMÁTICA E UI =================

function getTotalSpent() {
    return appState.expenses.reduce((total, exp) => total + exp.amount, 0);
}

function getBalance() {
    return appState.budget - getTotalSpent();
}

function getProgressPercentage() {
    if (appState.budget <= 0) return 0;
    const spent = getTotalSpent();
    return Math.min((spent / appState.budget) * 100, 100);
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    displayBudget: document.getElementById('display-budget'),
    displaySpent: document.getElementById('display-spent'),
    displayBalance: document.getElementById('display-balance'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    expenseForm: document.getElementById('expense-form'),
    expenseName: document.getElementById('expense-name'),
    expenseAmount: document.getElementById('expense-amount'),
    expenseCategory: document.getElementById('expense-category'),
    categoryCards: document.querySelectorAll('.category-card'),
    expensesList: document.getElementById('expenses-list'),
    travelerNames: document.getElementById('traveler-names'),
    editProfileBtn: document.getElementById('edit-profile-btn'),
    tripList: document.getElementById('trip-list'),
    newTripForm: document.getElementById('new-trip-form'),
    tripName: document.getElementById('trip-name'),
    tripDate: document.getElementById('trip-date'),
    
    // Onboarding Modals
    modalIdentity: document.getElementById('modal-identity'),
    identityInput: document.getElementById('identity-input'),
    btnSaveIdentity: document.getElementById('btn-save-identity')
};

function updateDashboardUI() {
    if (!els.displayBudget) return;
    const totalSpent = getTotalSpent();
    const balance = getBalance();

    els.displayBudget.innerHTML = `
        ${formatCurrency(appState.budget)}
        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
    `;
    if (els.displaySpent) els.displaySpent.textContent = `-${formatCurrency(totalSpent)}`;
    if (els.displayBalance) els.displayBalance.textContent = `Restante: ${formatCurrency(balance)}`;

    const percentage = getProgressPercentage();
    if (els.progressText) {
        els.progressText.textContent = `${Math.floor(percentage)}%`;
        let leftPos = percentage;
        if (leftPos <= 5) leftPos = 0;
        else if (leftPos > 90) leftPos = 90;
        els.progressText.style.left = leftPos === 0 ? "0" : `calc(${leftPos}% - 16px)`;
    }
    if (els.progressBar) els.progressBar.style.width = `${percentage}%`;
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
        const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        const iconSvg = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS['Outros'];

        itemDiv.innerHTML = `
            <div class="expense-info-wrap">
                <div class="expense-icon">${iconSvg}</div>
                <div class="expense-details">
                    <strong>${expense.name}</strong>
                    <span>${timeStr} - ${dateStr} | ${expense.category}</span>
                    <small style="display:block; margin-top: 2px; font-size: 11px; color: var(--text-muted);">Adicionado por ${expense.addedBy || 'Alguém'}</small>
                </div>
            </div>
            <div class="expense-value-actions" style="display: flex; align-items: center; gap: 12px;">
                <div class="expense-value">-${formatCurrency(expense.amount)}</div>
                <button class="delete-btn" data-id="${expense.id}" style="background:transparent; border:none; cursor:pointer; color:#ff6b6b; padding:4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        els.expensesList.appendChild(itemDiv);
    });
}

function renderTrips() {
    if (!els.tripList) return;
    if (els.travelerNames) els.travelerNames.textContent = appState.profileNames || 'Yuri & Danny';
    els.tripList.innerHTML = '';

    [...appState.travelHistory].reverse().forEach(trip => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trip-item';
        const dateObj = new Date(trip.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

        itemDiv.innerHTML = `
            <div class="trip-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
            <div class="trip-details" style="flex: 1;"><strong>${trip.title}</strong><span>${dateStr}</span></div>
            <button class="delete-trip-btn" data-id="${trip.id}" style="background:transparent; border:none; cursor:pointer; color:#ff6b6b; padding:4px;">
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

// ================= ONBOARDING LOGIC =================

function checkOnboarding() {
    const currentUser = localStorage.getItem('trip_current_user');
    
    if (!currentUser) {
        if (els.modalIdentity) els.modalIdentity.classList.add('active');
    }
}

if (els.btnSaveIdentity) {
    els.btnSaveIdentity.addEventListener('click', () => {
        const name = els.identityInput.value.trim();
        if (name) {
            localStorage.setItem('trip_current_user', name);
            els.modalIdentity.classList.remove('active');
        } else {
            alert('Por favor, informe o seu nome para continuar.');
        }
    });
}

// ================= EVENT LISTENERS =================

if (els.displayBudget) {
    els.displayBudget.addEventListener('click', () => {
        const current = appState.budget || 0;
        const val = prompt('Novo valor do Orçamento Total:', current);
        if (val !== null && !isNaN(parseFloat(val))) setBudget(parseFloat(val));
    });
}

if (els.categoryCards) {
    els.categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            els.categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            els.expenseCategory.value = card.dataset.value;
        });
    });
}

if (els.expenseForm) {
    els.expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = els.expenseName.value.trim();
        const amount = parseFloat(els.expenseAmount.value);
        const category = els.expenseCategory.value;

        if (!category) return alert('Selecione uma categoria clicando em um dos cards!');
        if (name && amount > 0) {
            addExpense(name, amount, category);
            els.expenseForm.reset();
            els.expenseCategory.value = '';
            els.categoryCards.forEach(c => c.classList.remove('selected'));
        }
    });
}

if (els.expensesList) {
    els.expensesList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn && confirm('Excluir gasto?')) deleteExpense(btn.dataset.id);
    });
}

if (els.editProfileBtn) {
    els.editProfileBtn.addEventListener('click', () => {
        const val = prompt('Quem está viajando?', appState.profileNames);
        if (val && val.trim()) updateProfileNames(val.trim());
    });
}

if (els.newTripForm) {
    els.newTripForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (els.tripName.value && els.tripDate.value) {
            addTrip(els.tripName.value.trim(), els.tripDate.value);
            els.newTripForm.reset();
        }
    });
}

if (els.tripList) {
    els.tripList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-trip-btn');
        if (btn && confirm('Excluir viagem?')) deleteTrip(btn.dataset.id);
    });
}

// INICIAR CONEXÃO EM TEMPO REAL E VERIFICAR IDENTIDADE
checkOnboarding(); // Verifica identidade logo de cara (antes mesmo da nuvem carregar)
initDataRealtime();