# Ratio Calculator

A modern, responsive web-based ratio calculator with instant live calculations. Perfect for calculating aspect ratios, screen resolutions, image dimensions, and video formats.

![Ratio Calculator](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **Instant Calculations** - Real-time calculations without page reload or form submission
- **Dynamic Ratio Management** - Add or remove aspect ratio pairs on the fly
- **Visual Feedback** - Clear indicators for correct and incorrect ratio matches
- **Default Ratios** - Pre-loaded with common ratios: 16:9, 9:16, 4:3, 3:4
- **Input Validation** - Smart validation preventing leading zeros and non-numeric input
- **Modern Dark Theme** - Beautiful gradient aesthetics with smooth animations
- **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **Accessibility** - ARIA labels and keyboard navigation support
- **No Dependencies** - Pure HTML, CSS, and JavaScript

## 🚀 Demo

Simply open `index.html` in any modern web browser to start using the calculator.

## 📋 Use Cases

- **Screen Resolution Calculations** - Calculate dimensions for different aspect ratios
- **Video Production** - Determine correct resolutions for various formats
- **Image Editing** - Find proper dimensions while maintaining aspect ratios
- **Web Design** - Calculate responsive breakpoints and image sizes
- **Photography** - Work with different print and display dimensions

## 🎯 How It Works

### Three Calculation Modes

1. **Width Only** - Enter width (A) and ratio to calculate height
   - Example: `1920 × ? [16:9]` → `1920 × 1080 [16:9]`

2. **Width & Correct Height** - Validates if dimensions match the ratio
   - Example: `1920 × 1080 [16:9]` → ✓ Correct

3. **Width & Incorrect Height** - Shows mismatch with visual feedback
   - Example: `1920 × 1000 [16:9]` → ✗ False (shows correct: 1080)

## 📁 Project Structure

```
ratio-calc/
├── index.html      # HTML structure
├── style.css       # All styling and animations
├── script.js       # Application logic
├── LICENSE         # MIT License
└── README.md       # This file
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript** - No frameworks or libraries
- **Google Fonts** - Inter font family

## 💻 Installation & Usage

### Local Usage

1. Clone or download this repository:
   ```bash
   git clone https://github.com/grohon/ratio-calc.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ratio-calc
   ```

3. Open `index.html` in your browser:
   - Double-click the file, or
   - Use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Or using PHP
     php -S localhost:8000
     ```

4. Visit `http://localhost:8000` in your browser

### Web Deployment

Simply upload all files to your web server or hosting service. The app is static and requires no server-side processing.

## 🎨 Features Breakdown

### Input Validation
- Only accepts positive integers
- Prevents leading zeros (e.g., "016" → "16")
- Real-time validation on every keystroke

### Dynamic Ratio Rows
- Add unlimited custom ratio pairs
- Remove any ratio row (minimum one required)
- Smooth animations for adding/removing

### Visual Feedback System
- ✅ **Green borders** - Correct ratios
- ❌ **Red borders** - Incorrect ratios
- **Strikethrough** - Incorrect user values
- **Color highlighting** - Correct calculated values

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly buttons and inputs

## 🔧 Customization

### Changing Default Ratios

Edit the `init()` function in `script.js`:

```javascript
function init() {
  addRatioRow(16, 9);   // 16:9
  addRatioRow(9, 16);   // 9:16
  addRatioRow(4, 3);    // 4:3
  addRatioRow(3, 4);    // 3:4
  attachEventListeners();
}
```

### Changing Color Scheme

Edit CSS variables in `style.css`:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-color: #10b981;
  --error-color: #ef4444;
  /* ... more colors */
}
```

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Abu Foysal**

- GitHub: [@grohon](https://github.com/grohon)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Design inspiration from modern web applications
- Font: [Inter](https://fonts.google.com/specimen/Inter) by Google Fonts
- Icons: Unicode characters (no external dependencies)

## 📊 Version History

- **1.0.0** (2025-01-25)
  - Initial release
  - Core functionality with instant calculations
  - 4 default aspect ratios
  - Modern dark theme
  - Full responsive design
  - Accessibility features

---

<p align="center">Made with ❤️ by Abu Foysal</p>
