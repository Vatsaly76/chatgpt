# Authentication Pages

A modern, responsive authentication system built with React and CSS variables for theming.

## Features

### 🎨 Design & UI
- **Seamless Design**: Clean, modern interface with smooth transitions
- **Mobile-First Responsive**: Optimized for all screen sizes starting from mobile
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **CSS Variables**: Centralized theming system for easy customization

### 🔐 Authentication Pages
- **Login Page**: Email and password fields with validation
- **Register Page**: First name, last name, email, and password fields
- **Theme Toggle**: Persistent theme switching with localStorage
- **Responsive Forms**: Optimized for both mobile and desktop

### 🎯 Technical Features
- **React Router**: Client-side routing between pages
- **Context API**: Global theme management
- **LocalStorage**: Theme preference persistence
- **System Theme Detection**: Respects user's OS theme preference
- **Accessible**: Proper ARIA labels and keyboard navigation

## Project Structure

```
src/
├── components/
│   ├── Home.jsx          # Landing page with navigation
│   ├── Login.jsx         # Login form component
│   └── Register.jsx      # Registration form component
├── contexts/
│   └── ThemeContext.jsx  # Theme management context
├── styles/
│   ├── theme.css         # CSS variables and global styles
│   └── auth.css          # Authentication-specific styles
├── App.jsx               # Main app component
├── AppRoutes.jsx         # Route configuration
└── main.jsx              # App entry point
```

## Theme System

The theme system uses CSS variables defined in `src/styles/theme.css`:

### Color Variables
- Primary colors for branding
- Text colors for different hierarchies
- Background colors for various surfaces
- Border and shadow colors

### Typography Variables
- Font families and sizes
- Font weights
- Line heights

### Spacing Variables
- Consistent spacing scale
- Border radius values
- Breakpoints for responsive design

### Dark Mode Support
- Automatic detection of system preference
- Manual toggle with persistence
- Smooth transitions between themes

## Usage

### Development
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Navigation
- `/` - Home page with navigation to auth pages
- `/login` - Login form
- `/register` - Registration form

### Theme Toggle
Click the theme toggle button (🌙/☀️) in the top-right corner to switch between light and dark modes.

## Responsive Breakpoints

- **Mobile**: Default (320px+)
- **Small**: 576px+
- **Medium**: 768px+
- **Large**: 992px+
- **Extra Large**: 1200px+

## Customization

To customize the theme, modify the CSS variables in `src/styles/theme.css`:

```css
:root {
  --primary-color: #007bff;
  --text-primary: #212529;
  --bg-primary: #ffffff;
  /* ... more variables */
}
```

## Form Validation

Both forms include:
- Required field validation
- Email format validation
- Password minimum length (6 characters)
- Real-time form state management

## Accessibility Features

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- High contrast ratios in both themes
