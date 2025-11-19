
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
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1400px',
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			fontSize: {
				'xs': ['clamp(0.75rem, 0.17vw + 0.76rem, 0.8rem)', { lineHeight: '1rem' }],
				'sm': ['clamp(0.875rem, 0.25vw + 0.87rem, 0.94rem)', { lineHeight: '1.25rem' }],
				'base': ['clamp(1rem, 0.34vw + 0.91rem, 1.13rem)', { lineHeight: '1.5rem' }],
				'lg': ['clamp(1.125rem, 0.34vw + 1.03rem, 1.31rem)', { lineHeight: '1.75rem' }],
				'xl': ['clamp(1.25rem, 0.61vw + 1.1rem, 1.56rem)', { lineHeight: '1.75rem' }],
				'2xl': ['clamp(1.5rem, 0.87vw + 1.27rem, 1.88rem)', { lineHeight: '2rem' }],
				'3xl': ['clamp(1.875rem, 1.26vw + 1.52rem, 2.25rem)', { lineHeight: '2.25rem' }],
				'4xl': ['clamp(2.25rem, 1.83vw + 1.8rem, 2.81rem)', { lineHeight: '2.5rem' }],
				'5xl': ['clamp(3rem, 2.46vw + 2.39rem, 3.75rem)', { lineHeight: '1' }],
				'6xl': ['clamp(3.75rem, 3.54vw + 2.77rem, 4.69rem)', { lineHeight: '1' }],
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
				// Design Token System
				'xs': 'var(--spacing-xs)',
				'sm': 'var(--spacing-sm)',
				'md': 'var(--spacing-md)',
				'lg': 'var(--spacing-lg)',
				'xl': 'var(--spacing-xl)',
				'2xl': 'var(--spacing-2xl)',
				'3xl': 'var(--spacing-3xl)',
			},
			size: {
				'xs': 'var(--size-xs)',
				'sm': 'var(--size-sm)',
				'md': 'var(--size-md)',
				'lg': 'var(--size-lg)',
				'xl': 'var(--size-xl)',
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
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
				}
			},
			'.dark': {
				analytics: {
					bg: 'hsl(210, 11%, 4%)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Design Token System
				'xs': 'var(--radius-xs)',
				'sm-token': 'var(--radius-sm)',
				'md-token': 'var(--radius-md)',
				'lg-token': 'var(--radius-lg)',
				'xl': 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				'full': 'var(--radius-full)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-gentle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(93, 135, 255, 0.3)' },
					'50%': { boxShadow: '0 0 30px rgba(93, 135, 255, 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-gentle': 'pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'fade-in-down': 'fade-in-down 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite linear',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'glow': 'glow 2s ease-in-out infinite'
			},
			boxShadow: {
				'modern': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 12px -3px rgba(0, 0, 0, 0.1)',
				'modern-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 8px 24px -6px rgba(0, 0, 0, 0.15)',
				'modern-xl': '0 8px 32px -8px rgba(0, 0, 0, 0.15), 0 16px 48px -12px rgba(0, 0, 0, 0.2)',
				'glow-primary': '0 0 20px rgba(93, 135, 255, 0.3)',
				'glow-success': '0 0 20px rgba(57, 176, 105, 0.3)',
				'inner-modern': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
			},
			backdropBlur: {
				xs: '2px',
				'3xl': '64px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
