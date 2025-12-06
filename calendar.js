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
});

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
        dayElement.innerHTML = `<span class="day-name-first">${firstLetter}</span><span class="day-name-rest">${restOfName}</span>`;
        
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
        weekRow.className = 'week-row';
        
        // Add roman numeral
        const romanNumeral = document.createElement('div');
        romanNumeral.textContent = ROMAN_NUMERALS[week];
        weekRow.appendChild(romanNumeral);
        
        // Create day container
        const daysContainer = document.createElement('div');
        daysContainer.className = 'days-grid';
        
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
        extraDaysRow.className = 'extra-days-row';
        
        for (let i = 0; i < extraDaysCount; i++) {
            const extraDayElement = document.createElement('div');
            extraDayElement.className = 'extra-day-item';
            
            const isCurrentExtraDay = currentDate.isExtraDay && currentDate.extraDayIndex === i;
            if (isCurrentExtraDay) {
                extraDayElement.classList.add('current');
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
    dayElement.className = 'day-number';
    
    const isCurrentDay = !currentDate.isExtraDay && 
                         currentDate.month === currentMonth && 
                         currentDate.day === dayNumber;
    
    if (isCurrentDay) {
        dayElement.classList.add('current');
    }
    
    dayElement.textContent = dayNumber;
    
    return dayElement;
}

// Change month
function changeMonth(delta) {
    currentMonth += delta;
    
    if (currentMonth < 0) {
        currentMonth = MONTHS_PER_YEAR - 1;
        currentYear--;
    } else if (currentMonth >= MONTHS_PER_YEAR) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar();
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
