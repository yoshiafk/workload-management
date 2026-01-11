/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary)",
        background: "var(--color-bg-primary)",
        foreground: "var(--color-text-primary)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-text-inverse)",
        },
        secondary: {
          DEFAULT: "var(--color-bg-secondary)",
          foreground: "var(--color-text-primary)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "var(--color-text-inverse)",
        },
        muted: {
          DEFAULT: "var(--color-bg-tertiary)",
          foreground: "var(--color-text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--color-primary-light)",
          foreground: "var(--color-primary)",
        },
        popover: {
          DEFAULT: "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
        card: {
          DEFAULT: "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Glassmorphism Utilities
      backgroundImage: {
        'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4))',
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
