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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
    });
}

// Color Picker Management
function initializeColorPicker() {
    const colorPickerToggle = document.getElementById('colorPickerToggle');
    const colorPickerPopup = document.getElementById('colorPickerPopup');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // Load saved accent color
    const savedColor = localStorage.getItem('accentColor') || '#000000';
    setAccentColor(savedColor);
    
    // Toggle color picker popup
    colorPickerToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        colorPickerPopup.classList.toggle('hidden');
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!colorPickerPopup.contains(e.target) && e.target !== colorPickerToggle) {
            colorPickerPopup.classList.add('hidden');
        }
    });
    
    // Handle color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.dataset.color;
            setAccentColor(color);
            localStorage.setItem('accentColor', color);
            colorPickerPopup.classList.add('hidden');
        });
    });
}

function setAccentColor(color) {
    // Calculate a lighter hover color (add 40% lightness)
    const hoverColor = lightenColor(color, 40);
    document.documentElement.style.setProperty('--color-accent', color);
    document.documentElement.style.setProperty('--color-accent-hover', hoverColor);
}

function lightenColor(hex, percent) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Increase each channel
    const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
    const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
    const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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
        dayElement.innerHTML = `<span class="text-2xl md:text-3xl">${firstLetter}</span><span class="text-xs md:text-sm">${restOfName}</span>`;
        
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
        weekRow.className = 'flex items-center gap-4 md:gap-8';
        
        // Add roman numeral
        const romanNumeral = document.createElement('div');
        romanNumeral.className = 'w-4 md:w-8 text-center text-xs md:text-3xl';
        romanNumeral.textContent = ROMAN_NUMERALS[week];
        weekRow.appendChild(romanNumeral);
        
        // Create day container
        const daysContainer = document.createElement('div');
        daysContainer.className = 'grid grid-cols-9 gap-4 md:gap-8 flex-1 text-center';
        
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
        extraDaysRow.className = 'flex justify-center items-center gap-8 md:gap-12 text-3xl md:text-4xl text-center';
        
        for (let i = 0; i < extraDaysCount; i++) {
            const extraDayElement = document.createElement('div');
            extraDayElement.className = 'cursor-pointer transition-all duration-200 opacity-80 hover:scale-105 hover:font-normal relative p-2 md:p-4 rounded group';
            
            const isCurrentExtraDay = currentDate.isExtraDay && currentDate.extraDayIndex === i;
            if (isCurrentExtraDay) {
                extraDayElement.classList.add('!opacity-100', 'font-medium');
            }
            
            extraDayElement.innerHTML = `
                ${i + 1}
                <span class="absolute inset-0 border-2 border-current rounded opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300 animate-[borderFadeOut_0.6s_ease_forwards]"></span>
            `;
            extraDaysRow.appendChild(extraDayElement);
        }
        
        extraDaysContainer.appendChild(extraDaysRow);
    }
}

// Create a day element
function createDayElement(dayNumber, currentDate) {
    const dayElement = document.createElement('div');
    dayElement.className = 'text-3xl md:text-5xl cursor-pointer transition-all duration-200 opacity-80 hover:scale-105 hover:font-normal relative p-2 rounded group';
    
    const isCurrentDay = !currentDate.isExtraDay && 
                         currentDate.month === currentMonth && 
                         currentDate.day === dayNumber;
    
    if (isCurrentDay) {
        dayElement.classList.add('!opacity-100', 'font-medium');
    }
    
    dayElement.innerHTML = `
        ${dayNumber}
        <span class="absolute inset-0 border-2 border-current rounded opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300 animate-[borderFadeOut_0.6s_ease_forwards]"></span>
    `;
    
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
            }, 300);
        }, 300);
    } else {
        // Already on current month, just ensure we're showing it
        renderCalendar();
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
