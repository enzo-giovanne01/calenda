
const monthYear = document.getElementById('monthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const toggleThemeButton = document.getElementById('toggleTheme');
const eventModal = document.getElementById('eventModal');
const closeModalButton = document.getElementById('closeModal');
const viewToggle = document.createElement('div');

// adiciona botões para navegar por anos
const prevYearButton = document.createElement('button');
const nextYearButton = document.createElement('button');
prevYearButton.id = 'prevYear';
nextYearButton.id = 'nextYear';
prevYearButton.textContent = 'Ano Anterior';
nextYearButton.textContent = 'Próximo Ano';
document.querySelector('header').appendChild(prevYearButton);
document.querySelector('header').appendChild(nextYearButton);

// Estado atual
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentView = 'month'; 
let currentWeekStart = new Date(); 
let currentDay = new Date(); 
let events = {}; 
let reminders = []; 

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];


viewToggle.id = 'viewToggle';
viewToggle.innerHTML = `
    <button data-view="day">Dia</button>
    <button data-view="week">Semana</button>
    <button data-view="month">Mês</button>
`;
document.body.insertBefore(viewToggle, document.getElementById('calendar'));

// Atualiza a visualização do calendário
function updateCalendar() {
    if (currentView === 'day') {
        renderDayView();
        openEventModal(getDateKey(currentDay)); // abre o modal automaticamente no formato dia
    } else if (currentView === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}
function removePastEvents() {
    const now = new Date(); // Data e hora atual

  
    Object.keys(events).forEach(dateKey => {
        events[dateKey] = events[dateKey].filter(event => {
            const eventEnd = new Date(`${dateKey}T${event.end}`);
            return eventEnd > now; 
        });

       
        if (events[dateKey].length === 0) {
            delete events[dateKey];
        }
    });

    updateCalendar(); // Atualiza o calendário
}
// verifica e remove eventos vencidos a cada minuto
setInterval(removePastEvents, 60000);
// remove eventos vencidos ao carregar a página
removePastEvents();

// atualiza os botões de navegação 
function updateNavigationButtons() {
    if (currentView === 'day') {
        prevMonthButton.textContent = 'Dia Anterior';
        nextMonthButton.textContent = 'Dia Seguinte';

        prevMonthButton.onclick = () => {
            currentDay.setDate(currentDay.getDate() - 1);
            updateCalendar();
        };

        nextMonthButton.onclick = () => {
            currentDay.setDate(currentDay.getDate() + 1);
            updateCalendar();
        };
    } else if (currentView === 'week') {
        prevMonthButton.textContent = 'Semana Anterior';
        nextMonthButton.textContent = 'Semana Seguinte';

        prevMonthButton.onclick = () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateCalendar();
        };

        nextMonthButton.onclick = () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateCalendar();
        };
    } else {
        prevMonthButton.textContent = 'Mês Anterior';
        nextMonthButton.textContent = 'Mês Seguinte';

        prevMonthButton.onclick = () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendar();
        };

        nextMonthButton.onclick = () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendar();
        };
    }

    //botões de ano
    prevYearButton.onclick = () => {
        currentYear--;
        updateCalendar();
    };

    nextYearButton.onclick = () => {
        currentYear++;
        updateCalendar();
    };
}


function scheduleReminder(event, dateKey) {
    const now = new Date();
    const eventDate = new Date(`${dateKey}T${event.start}`);
    const timeBeforeStart = eventDate - now;

    if (timeBeforeStart > 0) {
        const reminder = setTimeout(() => {
            alert(`Lembrete: ${event.title} começa em breve!`);
        }, timeBeforeStart - 5 * 60 * 1000); // 5 minutos antes do evento
        reminders.push(reminder);
    }
}


function renderMonthView() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Limpa o calendário existente

    // Atualiza o título do mês
    monthYear.textContent = `${months[currentMonth]} ${currentYear}`;

    // cabeçalho dos dias da semana
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    daysOfWeek.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.classList.add('header-cell');
        headerCell.textContent = day;
        calendar.appendChild(headerCell);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // adiciona espaços em branco antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        const blankCell = document.createElement('div');
        blankCell.classList.add('day-cell');
        calendar.appendChild(blankCell);
    }

    // adiciona os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;

        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (events[dateKey]) {
            dayCell.classList.add('has-events');
        }

        dayCell.addEventListener('click', () => openEventModal(dateKey));
        calendar.appendChild(dayCell);
    }

    updateNavigationButtons(); //atualiza os botões de navegação
}


function renderWeekView() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // limpa o calendário existente

    const startOfWeek = new Date(currentWeekStart);
    const daysOfWeek = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        daysOfWeek.push(date);
    }

    monthYear.textContent = `Semana de ${daysOfWeek[0].toLocaleDateString()} a ${daysOfWeek[6].toLocaleDateString()}`;

    daysOfWeek.forEach(date => {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = `${date.getDate()} ${months[date.getMonth()]}`;

        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (events[dateKey]) {
            dayCell.classList.add('has-events');
        }

        dayCell.addEventListener('click', () => openEventModal(dateKey));
        calendar.appendChild(dayCell);
    });

    updateNavigationButtons(); // atualiza os botões de navegação
}


function renderDayView() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; 

    const dateKey = getDateKey(currentDay);

    // atualiza o título com a data atual
    monthYear.textContent = `${currentDay.getDate()} ${months[currentDay.getMonth()]} ${currentDay.getFullYear()}`;

    const dayCell = document.createElement('div');
    dayCell.classList.add('day-cell');
    dayCell.textContent = `Eventos para ${dateKey}`;

    // lista de eventos do dia
    if (events[dateKey]) {
        events[dateKey].forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <p><strong>${event.title}</strong></p>
                <p>${event.start} - ${event.end}</p>
                <p>${event.description}</p>
            `;
            dayCell.appendChild(eventItem);
        });
    } else {
        dayCell.textContent += ' Nenhum evento.';
    }

    calendar.appendChild(dayCell);
    updateNavigationButtons(); 
}


function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}


function openEventModal(dateKey) {
    eventModal.style.display = 'block';

    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <h2>Eventos para ${dateKey}</h2>
        <div id="eventItems"></div>
        <form id="eventForm">
            <label for="eventTitle">Título:</label>
            <input type="text" id="eventTitle" required>

            <label for="startTime">Hora de Início:</label>
            <input type="time" id="startTime" required>

            <label for="endTime">Hora de Fim:</label>
            <input type="time" id="endTime" required>

            <label for="eventDescription">Descrição:</label>
            <textarea id="eventDescription"></textarea>

            <label for="eventRecurrence">Recorrência:</label>
            <select id="eventRecurrence">
                <option value="none">Nenhuma</option>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
            </select>

            <button type="submit">Salvar</button>
        </form>
    `;

    const eventItems = document.getElementById('eventItems');

    
    if (events[dateKey]) {
        events[dateKey].forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <p><strong>${event.title}</strong></p>
                <p>${event.description}</p>
                <p>${event.start} - ${event.end}</p>
                <button class="edit-event" data-index="${index}">Editar</button>
                <button class="delete-event" data-index="${index}">Excluir</button>
            `;
            eventItems.appendChild(eventItem);

        
            eventItem.querySelector('.delete-event').addEventListener('click', () => {
                events[dateKey].splice(index, 1);
                if (events[dateKey].length === 0) {
                    delete events[dateKey];
                }
                updateCalendar();
                openEventModal(dateKey); 
            });

           
            eventItem.querySelector('.edit-event').addEventListener('click', () => {
                document.getElementById('eventTitle').value = event.title;
                document.getElementById('startTime').value = event.start;
                document.getElementById('endTime').value = event.end;
                document.getElementById('eventDescription').value = event.description;
                document.getElementById('eventRecurrence').value = event.recurrence || 'none';

                
                events[dateKey].splice(index, 1);
                if (events[dateKey].length === 0) {
                    delete events[dateKey];
                }
            });
        });
    }

    // Adiciona evento ao formulário
    const eventForm = document.getElementById('eventForm');
    eventForm.onsubmit = (e) => {
        e.preventDefault();
        const newEvent = {
            title: document.getElementById('eventTitle').value,
            start: document.getElementById('startTime').value,
            end: document.getElementById('endTime').value,
            description: document.getElementById('eventDescription').value,
            recurrence: document.getElementById('eventRecurrence').value,
        };

        if (!events[dateKey]) {
            events[dateKey] = [];
        }
        events[dateKey].push(newEvent);

        // Agendar lembrete
        scheduleReminder(newEvent, dateKey);

        // Gerar eventos recorrentes
        if (newEvent.recurrence !== 'none') {
            generateRecurringEvents(newEvent, dateKey);
        }

        eventModal.style.display = 'none'; // Fecha o modal
        updateCalendar(); // Atualiza o calendário
    };
}

// Gera eventos recorrentes
function generateRecurringEvents(event, dateKey) {
    const recurrence = event.recurrence;
    const baseDate = new Date(dateKey);
    for (let i = 1; i <= 10; i++) { // Limite de 10 recorrências para evitar loop infinito
        let nextDate;
        if (recurrence === 'daily') {
            nextDate = new Date(baseDate);
            nextDate.setDate(baseDate.getDate() + i);
        } else if (recurrence === 'weekly') {
            nextDate = new Date(baseDate);
            nextDate.setDate(baseDate.getDate() + i * 7);
        } else if (recurrence === 'monthly') {
            nextDate = new Date(baseDate);
            nextDate.setMonth(baseDate.getMonth() + i);
        }

        const nextDateKey = getDateKey(nextDate);
        if (!events[nextDateKey]) {
            events[nextDateKey] = [];
        }
        events[nextDateKey].push({ ...event, recurrence: 'none' }); // Evita recorrência infinita
    }
}


closeModalButton.addEventListener('click', () => {
    eventModal.style.display = 'none';
});

// Alterna o tema
if (toggleThemeButton) {
    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });
}


viewToggle.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        currentView = e.target.dataset.view;
        if (currentView === 'week') {
            const today = new Date();
            const dayOfWeek = today.getDay();
            currentWeekStart = new Date(today);
            currentWeekStart.setDate(today.getDate() - dayOfWeek);
        } else if (currentView === 'day') {
            currentDay = new Date();
        }
        updateCalendar();
    }
})

// Inicializa o calendário
updateCalendar();
