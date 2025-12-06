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
    'Unodi',
    'Duodi',
    'Triodi',
    'Quordi',
    'Quandi',
    'Sexdi',
    'Septadi',
    'Octodi',
    'Novedi'
];

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
    setInterval(updateDecimalTime, 86.4); // Update ~1000 times per decimal second
    
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
        dayElement.className = 'day-name';
        
        // Style the day name with first letter capitalized and rest in subscript style
        const firstLetter = dayName.charAt(0);
        const restOfName = dayName.slice(1);
        dayElement.innerHTML = `<span class="day-name-first">${firstLetter}</span><span class="day-name-rest">${restOfName}</span>`;
        
        dayNamesContainer.appendChild(dayElement);
    });
}

// Render calendar for current month
function renderCalendar() {
    const monthNameElement = document.getElementById('monthName');
    const yearDisplayElement = document.getElementById('yearDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const extraDaysContainer = document.getElementById('extraDays');
    
    monthNameElement.textContent = MONTH_NAMES[currentMonth];
    yearDisplayElement.textContent = currentYear;
    
    calendarGrid.innerHTML = '';
    extraDaysContainer.innerHTML = '';
    
    const currentDate = getCurrentDecimalDate();
    
    // Render regular calendar days (4 weeks, 9 days each)
    for (let week = 0; week < WEEKS_PER_MONTH; week++) {
        const weekRow = document.createElement('div');
        weekRow.className = 'week-row';
        
        for (let dayInWeek = 0; dayInWeek < DAYS_PER_WEEK; dayInWeek++) {
            const dayNumber = week * DAYS_PER_WEEK + dayInWeek + 1;
            const dayElement = createDayElement(dayNumber, currentDate);
            weekRow.appendChild(dayElement);
        }
        
        calendarGrid.appendChild(weekRow);
    }
    
    // Render extra days (only for December)
    if (currentMonth === 9) {
        const extraDaysCount = isLeapYear() ? EXTRA_DAYS_LEAP : EXTRA_DAYS_NORMAL;
        const extraDaysTitle = document.createElement('div');
        extraDaysTitle.className = 'extra-days-title';
        extraDaysTitle.textContent = 'Days Outside of Time';
        extraDaysContainer.appendChild(extraDaysTitle);
        
        const extraDaysGrid = document.createElement('div');
        extraDaysGrid.className = 'extra-days-grid';
        
        for (let i = 0; i < extraDaysCount; i++) {
            const extraDayElement = document.createElement('div');
            extraDayElement.className = 'extra-day calendar-day';
            
            const isCurrentExtraDay = currentDate.isExtraDay && currentDate.extraDayIndex === i;
            if (isCurrentExtraDay) {
                extraDayElement.classList.add('current-extra-day');
            }
            
            extraDayElement.innerHTML = `
                <div class="extra-day-number">${i + 1}</div>
                <div class="extra-day-name">${EXTRA_DAY_NAMES[i]}</div>
            `;
            
            extraDaysGrid.appendChild(extraDayElement);
        }
        
        extraDaysContainer.appendChild(extraDaysGrid);
    }
    
    setupProximityHoverEffect();
}

// Create a day element
function createDayElement(dayNumber, currentDate) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const isCurrentDay = !currentDate.isExtraDay && 
                         currentDate.month === currentMonth && 
                         currentDate.day === dayNumber;
    
    if (isCurrentDay) {
        dayElement.classList.add('current-day');
    }
    
    dayElement.innerHTML = `
        <div class="calendar-day-number">${dayNumber}</div>
    `;
    
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
    
    // Regular time display
    const regularTimeElement = document.getElementById('regularTime');
    regularTimeElement.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
    
    // Convert to decimal time
    const totalSecondsInDay = 24 * 60 * 60; // 86400
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
    
    // Decimal time: 1 day = 10 hours = 1000 minutes = 100000 seconds
    const decimalSecondsInDay = 100000;
    const totalDecimalSeconds = (currentSeconds / totalSecondsInDay) * decimalSecondsInDay;
    
    const decimalHours = Math.floor(totalDecimalSeconds / 10000);
    const decimalMinutes = Math.floor((totalDecimalSeconds % 10000) / 100);
    const decimalSeconds = Math.floor(totalDecimalSeconds % 100);
    
    document.getElementById('hours').textContent = decimalHours;
    document.getElementById('minutes').textContent = String(decimalMinutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(decimalSeconds).padStart(2, '0');
}

// Setup proximity-based hover effect
function setupProximityHoverEffect() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    document.addEventListener('mousemove', (e) => {
        calendarDays.forEach(day => {
            const rect = day.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(e.clientX - centerX, 2) + 
                Math.pow(e.clientY - centerY, 2)
            );
            
            // Maximum distance for effect (in pixels)
            const maxDistance = 300;
            const proximity = Math.max(0, 1 - (distance / maxDistance));
            
            // Apply scale and brightness based on proximity
            const scale = 1 + (proximity * 0.08);
            const brightness = 1 + (proximity * 0.15);
            
            if (!day.classList.contains('current-day') && !day.classList.contains('extra-day')) {
                day.style.transform = `scale(${scale})`;
                day.style.filter = `brightness(${brightness})`;
            } else {
                day.style.transform = `scale(${scale})`;
            }
        });
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        calendarDays.forEach(day => {
            day.style.transform = '';
            day.style.filter = '';
        });
    });
}
