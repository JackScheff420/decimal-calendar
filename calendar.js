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
    const bgColorOptions = document.querySelectorAll('.bg-color-option');
    const textColorOptions = document.querySelectorAll('.text-color-option');
    
    // Load saved colors
    const savedBgColor = localStorage.getItem('backgroundColor') || '#FFFFFF';
    const savedTextColor = localStorage.getItem('textColor') || '#000000';
    applyColors(savedBgColor, savedTextColor);
    
    // Toggle color picker popup
    const toggleHandler = (e) => {
        e.stopPropagation();
        colorPickerPopup.classList.toggle('hidden');
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
            applyColors(bgColor, textColor);
            localStorage.setItem('backgroundColor', bgColor);
            localStorage.setItem('textColor', textColor);
        });
    });
    
    // Handle text color selection
    textColorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const textColor = option.dataset.color;
            const currentBgColor = localStorage.getItem('backgroundColor') || '#FFFFFF';
            applyColors(currentBgColor, textColor);
            localStorage.setItem('textColor', textColor);
        });
    });
}

function applyColors(bgColor, textColor) {
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
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
            extraDayElement.className = 'extra-day-item cursor-pointer transition-all duration-200 opacity-80 relative p-2 md:p-4 rounded';
            
            const isCurrentExtraDay = currentDate.isExtraDay && currentDate.extraDayIndex === i;
            if (isCurrentExtraDay) {
                extraDayElement.classList.add('current', '!opacity-100', 'font-medium');
            }
            
            extraDayElement.textContent = i + 1;
            extraDaysRow.appendChild(extraDayElement);
        }
        
        extraDaysContainer.appendChild(extraDaysRow);
    }
}

// Create a day element
function createDayElement(dayNumber, currentDate) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day-number text-3xl md:text-5xl cursor-pointer transition-all duration-200 opacity-80 relative p-2 rounded';
    
    const isCurrentDay = !currentDate.isExtraDay && 
                         currentDate.month === currentMonth && 
                         currentDate.day === dayNumber;
    
    if (isCurrentDay) {
        dayElement.classList.add('current', '!opacity-100', 'font-medium');
    }
    
    dayElement.textContent = dayNumber;
    
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
        // Find the day element
        const dayElements = document.querySelectorAll('.day-number');
        if (dayElements[currentDate.day - 1]) {
            const element = dayElements[currentDate.day - 1];
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 600);
        }
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
