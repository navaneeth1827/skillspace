
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				neon: {
					blue: '#00f3ff',
					purple: '#9b87f5',
					pink: '#ff00ff',
					green: '#00ff9f',
				},
				purple: {
					DEFAULT: '#9b87f5',
					light: '#7E69AB',
					bright: '#6E59A5',
					dark: '#1A1F2C',
					accent: '#D6BCFA'
				}
			},
			borderRadius: {
				lg: '1.5rem',
				md: '1.2rem',
				sm: '0.8rem'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-up': {
					from: { 
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					},
				},
				'slide-in-right': {
					from: { 
						transform: 'translateX(100%)',
						opacity: '0'
					},
					to: { 
						transform: 'translateX(0)',
						opacity: '1'
					},
				},
				'pulse-soft': {
					'0%, 100%': { 
						opacity: '1' 
					},
					'50%': { 
						opacity: '0.8' 
					},
				},
				'glow': {
					'0%, 100%': { 
						textShadow: '0 0 10px rgba(0, 243, 255, 0.5), 0 0 40px rgba(0, 243, 255, 0.3)' 
					},
					'50%': { 
						textShadow: '0 0 20px rgba(0, 243, 255, 0.8), 0 0 60px rgba(0, 243, 255, 0.6)' 
					},
				},
				'neon-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(0, 243, 255, 0.5), 0 0 10px rgba(0, 243, 255, 0.3)'
					},
					'50%': { 
						boxShadow: '0 0 15px rgba(0, 243, 255, 0.8), 0 0 30px rgba(0, 243, 255, 0.6)'
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-up': 'fade-up 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'pulse-soft': 'pulse-soft 3s infinite ease-in-out',
				'glow': 'glow 3s infinite ease-in-out',
				'neon-pulse': 'neon-pulse 3s infinite ease-in-out',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'purple-gradient': 'linear-gradient(to right, #9b87f5, #7E69AB)',
				'neon-gradient': 'linear-gradient(to right, #00f3ff, #ff00ff)',
				'cyber-gradient': 'linear-gradient(to right, #00f3ff, #00ff9f)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
