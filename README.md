# Decimal Calendar

A minimalistic web application that displays a decimal calendar system with decimal time.

## Features

- **Decimal Calendar System**
  - 10 months per year (Primember through December)
  - 36 days per month
  - 9-day weeks (Unodi through Novedi)
  - 4 weeks per month
  - 360 regular days + 5-6 extra days ("Days Outside of Time")

- **Decimal Time**
  - 10 decimal hours per day
  - 100 decimal minutes per hour
  - 100 decimal seconds per minute
  - Real-time conversion from standard time

- **Interactive Features**
  - Month navigation (previous/next)
  - Proximity-based hover effects
  - Current day highlighting
  - Animated decimal clock
  - Responsive design for mobile and desktop

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/JackScheff420/decimal-calendar.git
   cd decimal-calendar
   ```

2. Open `index.html` in a web browser, or serve it with a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

## Calendar System

The decimal calendar year starts at the spring equinox (approximately March 20) and divides the year as follows:

- **10 Months**: Each with exactly 36 days
- **9-Day Weeks**: Named Unodi, Duodi, Triodi, Quordi, Quandi, Sexdi, Septadi, Octodi, Novedi
- **Extra Days**: 5 days (6 in leap years) at the end of December, called "Days Outside of Time"
  - Primdia, Secdia, Terdia, Quadia, Quindia, (Sexdia in leap years)

## Decimal Time

The decimal time system divides each day into:
- 1 day = 10 decimal hours
- 1 decimal hour = 100 decimal minutes
- 1 decimal minute = 100 decimal seconds

Time is displayed in the format `H:MM:SS`

## Technologies Used

- HTML5
- CSS3 (custom styling with responsive design)
- Vanilla JavaScript (no frameworks)

## License

MIT
