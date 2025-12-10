// Decimal Calendar Configuration
const DECIMAL_YEAR = 22;
const MONTHS_PER_YEAR = 10;
const DAYS_PER_MONTH = 36;
const WEEKS_PER_MONTH = 4;
const DAYS_PER_WEEK = 9;
const EXTRA_DAYS_NORMAL = 5;
const EXTRA_DAYS_LEAP = 6;

// Spring equinox as year start (approximately March 20)
const SPRING_EQUINOX_GREGORIAN = new Date(new Date().getFullYear(), 2, 20); // March 20

const MONTH_NAMES = [
    'Primember',
    'Secember',
    'Terember',
    'Quattember',
    'Quintember',
    'Sextember',
    'September',
    'October',
    'November',
    'December'
];

const DAY_NAMES = [
    'Primdia',
    'Secdia',
    'Terdia',
    'Quadia',
    'Quindia',
    'Sexdia',
    'Seddia',
    'Octadia',
    'Nondia'
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV'];

const EXTRA_DAY_NAMES = [
    'Primdia',
    'Secdia',
    'Terdia',
    'Quadia',
    'Quindia',
    'Sexdia'
];

// State
let currentMonth = 0;
let currentYear = DECIMAL_YEAR;
let selectedDay = null; // { day: number, month: number, year: number, isExtraDay: boolean, extraDayIndex: number }

// Storage for appointments and notes (per day)
let dayData = {}; // { "day-month-year": { appointments: [], notes: [] } }

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('calendarData');
    if (saved) {
        dayData = JSON.parse(saved);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('calendarData', JSON.stringify(dayData));
}

// Get key for a specific day
function getDayKey(day, month, year, isExtraDay, extraDayIndex) {
    if (isExtraDay) {
        return `extra-${extraDayIndex}-${month}-${year}`;
    }
    return `${day}-${month}-${year}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeCalendar();
    updateDecimalTime();
    setInterval(updateDecimalTime, 864); // Update approximately once per decimal second (~0.864 standard seconds)
    
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);
    
    // Initialize theme
    initializeTheme();
    
    // Initialize color picker
    initializeColorPicker();
    
    // Add button event listeners
    document.getElementById('addAppointmentBtn').addEventListener('click', addAppointment);
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
});

// Default color schemes
const DEFAULT_LIGHT_BG = '#FFFFFF';
const DEFAULT_LIGHT_TEXT = '#000000';
const DEFAULT_DARK_BG = '#111827';
const DEFAULT_DARK_TEXT = '#F9FAFB';

// Current mode state
let currentMode = 'light';

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    
    // Check for saved theme preference or default to light
    currentMode = localStorage.getItem('theme') || 'light';
    applyThemeMode(currentMode);
    
    // Update icon visibility
    updateThemeIcon(currentMode, sunIcon, moonIcon);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        currentMode = currentMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', currentMode);
        applyThemeMode(currentMode);
        updateThemeIcon(currentMode, sunIcon, moonIcon);
        updateColorPickerSelection();
    });
}

function updateThemeIcon(mode, sunIcon, moonIcon) {
    if (mode === 'dark') {
        sunIcon.classList.remove('hidden');
        sunIcon.classList.add('block');
        moonIcon.classList.remove('block');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.remove('block');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        moonIcon.classList.add('block');
    }
}

function applyThemeMode(mode) {
    const body = document.body;
    
    let bgColor, textColor;
    
    if (mode === 'dark') {
        body.classList.add('dark-mode');
        // Load dark mode colors
        bgColor = localStorage.getItem('darkModeBg') || DEFAULT_DARK_BG;
        textColor = localStorage.getItem('darkModeText') || DEFAULT_DARK_TEXT;
    } else {
        body.classList.remove('dark-mode');
        // Load light mode colors
        bgColor = localStorage.getItem('lightModeBg') || DEFAULT_LIGHT_BG;
        textColor = localStorage.getItem('lightModeText') || DEFAULT_LIGHT_TEXT;
    }
    
    body.style.backgroundColor = bgColor;
    body.style.color = textColor;
    
    // Update footer button colors to match theme
    updateFooterButtonColors(bgColor, textColor);
}

function updateFooterButtonColors(bgColor, textColor) {
    const themeToggle = document.getElementById('themeToggle');
    const colorPickerToggle = document.getElementById('colorPickerToggle');
    
    // Calculate a slightly different shade for the buttons
    const buttonBg = adjustBrightness(bgColor, 0.1);
    
    if (themeToggle) {
        themeToggle.style.backgroundColor = buttonBg;
        themeToggle.style.color = textColor;
    }
    
    if (colorPickerToggle) {
        colorPickerToggle.style.backgroundColor = buttonBg;
        colorPickerToggle.style.color = textColor;
    }
}

function adjustBrightness(hex, factor) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // If dark background, lighten; if light background, darken
    const multiplier = brightness < 128 ? 1 + factor : 1 - factor;
    
    const newR = Math.min(255, Math.max(0, Math.round(r * multiplier)));
    const newG = Math.min(255, Math.max(0, Math.round(g * multiplier)));
    const newB = Math.min(255, Math.max(0, Math.round(b * multiplier)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Color Picker Management
function initializeColorPicker() {
    const colorPickerToggle = document.getElementById('colorPickerToggle');
    const colorPickerPopup = document.getElementById('colorPickerPopup');
    const bgColorOptions = document.querySelectorAll('.bg-color-option');
    const textColorOptions = document.querySelectorAll('.text-color-option');
    
    // Initial selection update
    updateColorPickerSelection();
    
    // Toggle color picker popup
    const toggleHandler = (e) => {
        e.stopPropagation();
        colorPickerPopup.classList.toggle('hidden');
        if (!colorPickerPopup.classList.contains('hidden')) {
            updateColorPickerSelection();
        }
    };
    colorPickerToggle.addEventListener('click', toggleHandler);
    
    // Close popup when clicking outside
    const closeHandler = (e) => {
        if (!colorPickerPopup.contains(e.target) && e.target !== colorPickerToggle) {
            colorPickerPopup.classList.add('hidden');
        }
    };
    document.addEventListener('click', closeHandler);
    
    // Handle background color selection
    bgColorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const bgColor = option.dataset.bg;
            const textColor = option.dataset.text;
            
            // Save colors for current mode
            if (currentMode === 'dark') {
                localStorage.setItem('darkModeBg', bgColor);
                localStorage.setItem('darkModeText', textColor);
            } else {
                localStorage.setItem('lightModeBg', bgColor);
                localStorage.setItem('lightModeText', textColor);
            }
            
            // Apply immediately
            document.body.style.backgroundColor = bgColor;
            document.body.style.color = textColor;
            
            // Update footer buttons
            updateFooterButtonColors(bgColor, textColor);
            
            updateColorPickerSelection();
        });
    });
    
    // Handle text color selection
    textColorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const textColor = option.dataset.color;
            
            // Get current background color
            const currentBgColor = currentMode === 'dark' 
                ? localStorage.getItem('darkModeBg') || DEFAULT_DARK_BG
                : localStorage.getItem('lightModeBg') || DEFAULT_LIGHT_BG;
            
            // Save text color for current mode
            if (currentMode === 'dark') {
                localStorage.setItem('darkModeText', textColor);
            } else {
                localStorage.setItem('lightModeText', textColor);
            }
            
            // Apply immediately
            document.body.style.color = textColor;
            
            // Update footer buttons
            updateFooterButtonColors(currentBgColor, textColor);
            
            updateColorPickerSelection();
        });
    });
}

function updateColorPickerSelection() {
    const bgColorOptions = document.querySelectorAll('.bg-color-option');
    const textColorOptions = document.querySelectorAll('.text-color-option');
    
    // Get current colors based on mode
    let currentBg, currentText;
    if (currentMode === 'dark') {
        currentBg = localStorage.getItem('darkModeBg') || DEFAULT_DARK_BG;
        currentText = localStorage.getItem('darkModeText') || DEFAULT_DARK_TEXT;
    } else {
        currentBg = localStorage.getItem('lightModeBg') || DEFAULT_LIGHT_BG;
        currentText = localStorage.getItem('lightModeText') || DEFAULT_LIGHT_TEXT;
    }
    
    // Update background color selections
    bgColorOptions.forEach(option => {
        const indicator = option.querySelector('.selected-indicator');
        if (option.dataset.bg === currentBg) {
            option.classList.add('selected');
            if (indicator) indicator.classList.remove('hidden');
        } else {
            option.classList.remove('selected');
            if (indicator) indicator.classList.add('hidden');
        }
    });
    
    // Update text color selections
    textColorOptions.forEach(option => {
        const indicator = option.querySelector('.selected-indicator');
        if (option.dataset.color === currentText) {
            option.classList.add('selected');
            if (indicator) indicator.classList.remove('hidden');
        } else {
            option.classList.remove('selected');
            if (indicator) indicator.classList.add('hidden');
        }
    });
}

// Calculate current decimal date
function getCurrentDecimalDate() {
    const now = new Date();
    const currentYearEquinox = new Date(now.getFullYear(), 2, 20); // March 20
    
    // Check if we're before or after this year's equinox
    let yearEquinox;
    if (now < currentYearEquinox) {
        yearEquinox = new Date(now.getFullYear() - 1, 2, 20);
    } else {
        yearEquinox = currentYearEquinox;
    }
    
    // Days since year start
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceYearStart = Math.floor((now - yearEquinox) / msPerDay);
    
    // Calculate decimal month and day
    const totalDaysInRegularMonths = MONTHS_PER_YEAR * DAYS_PER_MONTH; // 360
    
    if (daysSinceYearStart < totalDaysInRegularMonths) {
        const month = Math.floor(daysSinceYearStart / DAYS_PER_MONTH);
        const day = (daysSinceYearStart % DAYS_PER_MONTH) + 1;
        return { month, day, isExtraDay: false, extraDayIndex: -1 };
    } else {
        // Extra days
        const extraDayIndex = daysSinceYearStart - totalDaysInRegularMonths;
        return { month: 9, day: -1, isExtraDay: true, extraDayIndex };
    }
}

// Check if current year is leap year (simplified - every 4 years)
function isLeapYear() {
    const gregorianYear = new Date().getFullYear();
    return gregorianYear % 4 === 0 && (gregorianYear % 100 !== 0 || gregorianYear % 400 === 0);
}

// Initialize calendar
function initializeCalendar() {
    const currentDate = getCurrentDecimalDate();
    currentMonth = currentDate.month;
    currentYear = DECIMAL_YEAR;
    
    renderDayNames();
    renderCalendar();
}

// Render day names header
function renderDayNames() {
    const dayNamesContainer = document.getElementById('dayNames');
    dayNamesContainer.innerHTML = '';
    
    DAY_NAMES.forEach((dayName, index) => {
        const dayElement = document.createElement('div');
        
        // Style the day name with large first letter and small rest
        const firstLetter = dayName.charAt(0);
        const restOfName = dayName.slice(1).toLowerCase();
        dayElement.innerHTML = `<span class="text-xl md:text-2xl">${firstLetter}</span><span class="text-xs">${restOfName}</span>`;
        
        dayNamesContainer.appendChild(dayElement);
    });
}

// Render calendar for current month
function renderCalendar() {
    const monthNameElement = document.getElementById('monthName');
    const monthNumberElement = document.getElementById('monthNumber');
    const yearDisplayElement = document.getElementById('yearDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const extraDaysContainer = document.getElementById('extraDays');
    
    monthNameElement.textContent = MONTH_NAMES[currentMonth];
    monthNumberElement.textContent = ' ' + (currentMonth + 1);
    yearDisplayElement.textContent = currentYear;
    
    calendarGrid.innerHTML = '';
    extraDaysContainer.innerHTML = '';
    
    const currentDate = getCurrentDecimalDate();
    
    // Render regular calendar days (4 weeks, 9 days each)
    for (let week = 0; week < WEEKS_PER_MONTH; week++) {
        const weekRow = document.createElement('div');
        weekRow.className = 'flex items-center gap-2 md:gap-4';
        
        // Add roman numeral
        const romanNumeral = document.createElement('div');
        romanNumeral.className = 'w-4 md:w-6 text-center text-xs md:text-2xl';
        romanNumeral.textContent = ROMAN_NUMERALS[week];
        weekRow.appendChild(romanNumeral);
        
        // Create day container
        const daysContainer = document.createElement('div');
        daysContainer.className = 'grid grid-cols-9 gap-2 md:gap-4 flex-1 text-center';
        
        for (let dayInWeek = 0; dayInWeek < DAYS_PER_WEEK; dayInWeek++) {
            const dayNumber = week * DAYS_PER_WEEK + dayInWeek + 1;
            const dayElement = createDayElement(dayNumber, currentDate);
            daysContainer.appendChild(dayElement);
        }
        
        weekRow.appendChild(daysContainer);
        calendarGrid.appendChild(weekRow);
    }
    
    // Render extra days (only for December)
    if (currentMonth === 9) {
        const extraDaysCount = isLeapYear() ? EXTRA_DAYS_LEAP : EXTRA_DAYS_NORMAL;
        
        const extraDaysRow = document.createElement('div');
        extraDaysRow.className = 'flex justify-center items-center gap-4 md:gap-8 text-2xl md:text-3xl text-center';
        
        for (let i = 0; i < extraDaysCount; i++) {
            const extraDayElement = document.createElement('div');
            extraDayElement.className = 'extra-day-item cursor-pointer transition-all duration-200 opacity-80 relative p-2 md:p-4 rounded';
            
            const isCurrentExtraDay = currentDate.isExtraDay && currentDate.extraDayIndex === i;
            if (isCurrentExtraDay) {
                extraDayElement.classList.add('current', '!opacity-100', 'font-medium');
            }
            
            // Check if this extra day is selected
            const isSelected = selectedDay && 
                               selectedDay.isExtraDay && 
                               selectedDay.extraDayIndex === i;
            
            if (isSelected) {
                extraDayElement.classList.add('selected');
            }
            
            extraDayElement.textContent = i + 1;
            
            // Add click handler
            extraDayElement.addEventListener('click', () => {
                selectDay(i + 1, true, i);
            });
            
            extraDaysRow.appendChild(extraDayElement);
        }
        
        extraDaysContainer.appendChild(extraDaysRow);
    }
}

// Create a day element
function createDayElement(dayNumber, currentDate) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day-number text-2xl md:text-4xl cursor-pointer transition-all duration-200 opacity-80 relative p-1 rounded';
    
    const isCurrentDay = !currentDate.isExtraDay && 
                         currentDate.month === currentMonth && 
                         currentDate.day === dayNumber;
    
    if (isCurrentDay) {
        dayElement.classList.add('current', '!opacity-100', 'font-medium');
    }
    
    // Check if this day is selected
    const isSelected = selectedDay && 
                       !selectedDay.isExtraDay && 
                       selectedDay.month === currentMonth && 
                       selectedDay.day === dayNumber;
    
    if (isSelected) {
        dayElement.classList.add('selected');
    }
    
    dayElement.textContent = dayNumber;
    
    // Add click handler
    dayElement.addEventListener('click', () => {
        selectDay(dayNumber, false, -1);
    });
    
    return dayElement;
}

// Change month
function changeMonth(delta) {
    const calendarGrid = document.getElementById('calendarGrid');
    const extraDaysContainer = document.getElementById('extraDays');
    
    // Apply exit animation
    if (delta > 0) {
        calendarGrid.classList.add('slide-out-left');
        extraDaysContainer.classList.add('slide-out-left');
    } else {
        calendarGrid.classList.add('slide-out-right');
        extraDaysContainer.classList.add('slide-out-right');
    }
    
    // Wait for exit animation to complete
    setTimeout(() => {
        // Update month
        currentMonth += delta;
        
        if (currentMonth < 0) {
            currentMonth = MONTHS_PER_YEAR - 1;
            currentYear--;
        } else if (currentMonth >= MONTHS_PER_YEAR) {
            currentMonth = 0;
            currentYear++;
        }
        
        // Remove exit animation classes
        calendarGrid.classList.remove('slide-out-left', 'slide-out-right');
        extraDaysContainer.classList.remove('slide-out-left', 'slide-out-right');
        
        // Apply enter animation
        if (delta > 0) {
            calendarGrid.classList.add('slide-in-right');
            extraDaysContainer.classList.add('slide-in-right');
        } else {
            calendarGrid.classList.add('slide-in-left');
            extraDaysContainer.classList.add('slide-in-left');
        }
        
        // Render calendar
        renderCalendar();
        
        // Remove enter animation classes after animation completes
        setTimeout(() => {
            calendarGrid.classList.remove('slide-in-left', 'slide-in-right');
            extraDaysContainer.classList.remove('slide-in-left', 'slide-in-right');
        }, 300);
    }, 300);
}

// Go to today's date
function goToToday() {
    const currentDate = getCurrentDecimalDate();
    const calendarGrid = document.getElementById('calendarGrid');
    const extraDaysContainer = document.getElementById('extraDays');
    
    // Only animate if we're changing months
    if (currentMonth !== currentDate.month) {
        // Determine direction
        const delta = currentDate.month - currentMonth;
        
        // Apply exit animation
        if (delta > 0) {
            calendarGrid.classList.add('slide-out-left');
            extraDaysContainer.classList.add('slide-out-left');
        } else {
            calendarGrid.classList.add('slide-out-right');
            extraDaysContainer.classList.add('slide-out-right');
        }
        
        // Wait for exit animation to complete
        setTimeout(() => {
            // Update to current month
            currentMonth = currentDate.month;
            currentYear = DECIMAL_YEAR;
            
            // Remove exit animation classes
            calendarGrid.classList.remove('slide-out-left', 'slide-out-right');
            extraDaysContainer.classList.remove('slide-out-left', 'slide-out-right');
            
            // Apply enter animation
            if (delta > 0) {
                calendarGrid.classList.add('slide-in-right');
                extraDaysContainer.classList.add('slide-in-right');
            } else {
                calendarGrid.classList.add('slide-in-left');
                extraDaysContainer.classList.add('slide-in-left');
            }
            
            // Render calendar
            renderCalendar();
            
            // Remove enter animation classes after animation completes
            setTimeout(() => {
                calendarGrid.classList.remove('slide-in-left', 'slide-in-right');
                extraDaysContainer.classList.remove('slide-in-left', 'slide-in-right');
                // Highlight today's date
                highlightTodayDate(currentDate);
            }, 300);
        }, 300);
    } else {
        // Already on current month, just highlight today
        highlightTodayDate(currentDate);
    }
}

// Highlight today's date with animation
function highlightTodayDate(currentDate) {
    if (currentDate.isExtraDay) {
        // Find the extra day element
        const extraDayElements = document.querySelectorAll('.extra-day-item');
        if (extraDayElements[currentDate.extraDayIndex]) {
            const element = extraDayElements[currentDate.extraDayIndex];
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 600);
        }
    } else {
        // Find the current day element by matching its content
        const dayElements = document.querySelectorAll('.day-number');
        dayElements.forEach(element => {
            if (element.textContent.trim() === String(currentDate.day)) {
                element.classList.add('highlight');
                setTimeout(() => {
                    element.classList.remove('highlight');
                }, 600);
            }
        });
    }
}

// Select a day and update detail view
function selectDay(day, isExtraDay, extraDayIndex) {
    selectedDay = {
        day: day,
        month: currentMonth,
        year: currentYear,
        isExtraDay: isExtraDay,
        extraDayIndex: extraDayIndex
    };
    
    // Update the calendar view to reflect selection
    renderCalendar();
    
    // Update the detail view
    updateDetailView();
}

// Update the detail view with selected day information
function updateDetailView() {
    const detailView = document.getElementById('detailView');
    
    if (!selectedDay) {
        detailView.classList.add('hidden');
        return;
    }
    
    detailView.classList.remove('hidden');
    
    // Format the date string
    let dateString = '';
    if (selectedDay.isExtraDay) {
        dateString = `${EXTRA_DAY_NAMES[selectedDay.extraDayIndex]} ${selectedDay.extraDayIndex + 1}.${selectedDay.month + 1}.${selectedDay.year}`;
    } else {
        const dayOfWeek = (selectedDay.day - 1) % DAYS_PER_WEEK;
        dateString = `${DAY_NAMES[dayOfWeek]} ${selectedDay.day}.${selectedDay.month + 1}.${selectedDay.year}`;
    }
    
    document.getElementById('detailDate').textContent = dateString;
    
    // Here we'll add logic to load/display events and notes for the selected day
    // For now, we'll show placeholder content
    updateDetailContent();
}

// Update detail content (appointments and notes)
function updateDetailContent() {
    const appointmentsContainer = document.getElementById('detailAppointments');
    const notesContainer = document.getElementById('detailNotes');
    
    // Clear existing content
    appointmentsContainer.innerHTML = '';
    notesContainer.innerHTML = '';
    
    // Get data for selected day
    const dayKey = getDayKey(
        selectedDay.day, 
        selectedDay.month, 
        selectedDay.year, 
        selectedDay.isExtraDay, 
        selectedDay.extraDayIndex
    );
    
    const data = dayData[dayKey] || { appointments: [], notes: [] };
    
    // Render appointments
    data.appointments.forEach((appointment, index) => {
        const li = createEditableItem(appointment, 'appointment', index);
        appointmentsContainer.appendChild(li);
    });
    
    // Render notes
    data.notes.forEach((note, index) => {
        const li = createEditableItem(note, 'note', index);
        notesContainer.appendChild(li);
    });
}

// Create an editable list item
function createEditableItem(text, type, index) {
    const li = document.createElement('li');
    li.className = 'editable-item';
    li.textContent = text;
    
    // Double-click to edit
    li.addEventListener('dblclick', () => {
        editItem(li, text, type, index);
    });
    
    // Right-click to delete
    li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        deleteItem(type, index);
    });
    
    return li;
}

// Edit an item
function editItem(element, currentText, type, index) {
    element.classList.add('editing');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();
    
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
            updateItemText(type, index, newText);
        }
        updateDetailContent();
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            updateDetailContent();
        }
    });
}

// Update item text
function updateItemText(type, index, newText) {
    const dayKey = getDayKey(
        selectedDay.day, 
        selectedDay.month, 
        selectedDay.year, 
        selectedDay.isExtraDay, 
        selectedDay.extraDayIndex
    );
    
    if (!dayData[dayKey]) {
        dayData[dayKey] = { appointments: [], notes: [] };
    }
    
    if (type === 'appointment') {
        dayData[dayKey].appointments[index] = newText;
    } else {
        dayData[dayKey].notes[index] = newText;
    }
    
    saveData();
}

// Delete an item
function deleteItem(type, index) {
    const dayKey = getDayKey(
        selectedDay.day, 
        selectedDay.month, 
        selectedDay.year, 
        selectedDay.isExtraDay, 
        selectedDay.extraDayIndex
    );
    
    if (!dayData[dayKey]) return;
    
    if (type === 'appointment') {
        dayData[dayKey].appointments.splice(index, 1);
    } else {
        dayData[dayKey].notes.splice(index, 1);
    }
    
    saveData();
    updateDetailContent();
}

// Add new appointment
function addAppointment() {
    if (!selectedDay) return;
    
    const dayKey = getDayKey(
        selectedDay.day, 
        selectedDay.month, 
        selectedDay.year, 
        selectedDay.isExtraDay, 
        selectedDay.extraDayIndex
    );
    
    if (!dayData[dayKey]) {
        dayData[dayKey] = { appointments: [], notes: [] };
    }
    
    const newAppointment = prompt('Neuer Termin (z.B. "Meeting (3.50 Uhr)")');
    if (newAppointment && newAppointment.trim()) {
        dayData[dayKey].appointments.push(newAppointment.trim());
        saveData();
        updateDetailContent();
    }
}

// Add new note
function addNote() {
    if (!selectedDay) return;
    
    const dayKey = getDayKey(
        selectedDay.day, 
        selectedDay.month, 
        selectedDay.year, 
        selectedDay.isExtraDay, 
        selectedDay.extraDayIndex
    );
    
    if (!dayData[dayKey]) {
        dayData[dayKey] = { appointments: [], notes: [] };
    }
    
    const newNote = prompt('Neue Notiz');
    if (newNote && newNote.trim()) {
        dayData[dayKey].notes.push(newNote.trim());
        saveData();
        updateDetailContent();
    }
}

// Update decimal time display
function updateDecimalTime() {
    const now = new Date();
    
    // Convert to decimal time
    const totalSecondsInDay = 24 * 60 * 60; // 86400
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
    
    // Decimal time: 1 day = 10 hours = 1000 minutes = 100000 seconds
    const decimalSecondsInDay = 100000;
    const totalDecimalSeconds = (currentSeconds / totalSecondsInDay) * decimalSecondsInDay;
    
    const decimalHours = Math.floor(totalDecimalSeconds / 10000);
    const decimalMinutes = Math.floor((totalDecimalSeconds % 10000) / 100);
    const decimalSeconds = Math.floor(totalDecimalSeconds % 100);
    
    const timeString = `${String(decimalHours).padStart(2, '0')}:${String(decimalMinutes).padStart(2, '0')}:${String(decimalSeconds).padStart(2, '0')}`;
    document.getElementById('decimalTime').textContent = timeString;
}
