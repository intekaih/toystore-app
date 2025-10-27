/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌸 Tone màu hồng sữa chủ đạo
        primary: {
          50: '#fff1f7',   // Hồng cực nhạt
          100: '#ffe4f0',  // Hồng sữa rất nhạt
          200: '#ffd1e3',  // Hồng sữa nhạt
          300: '#ffb3d4',  // Hồng sữa
          400: '#ff8cbf',  // Hồng pastel
          500: '#ff6ba9',  // Hồng chính
          600: '#f73d8f',  // Hồng đậm
          700: '#e6226d',  // Hồng rất đậm
          800: '#c01a5b',  // Hồng tối
          900: '#9d174d',  // Hồng cực tối
        },
        // 🎀 Màu hồng phụ (rose)
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // 🤍 Màu nền trắng kem
        cream: {
          50: '#fffbfc',
          100: '#fff5f7',
          200: '#ffeff3',
          300: '#ffe9ee',
        },
        // 💝 Màu accent dễ thương
        cute: {
          pink: '#ffc0cb',
          lavender: '#e6e6fa',
          peach: '#ffd5c2',
          mint: '#f0fff4',
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'Poppins', 'ui-sans-serif', 'system-ui'],
        display: ['Quicksand', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'cute': '1rem',      // 16px - Bo góc dễ thương
        'bubble': '1.5rem',  // 24px - Bo góc bong bóng
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(255, 107, 169, 0.1), 0 4px 6px -2px rgba(255, 107, 169, 0.05)',
        'cute': '0 4px 20px -2px rgba(255, 107, 169, 0.15)',
        'bubble': '0 8px 30px -5px rgba(255, 107, 169, 0.2)',
      },
      animation: {
        'bounce-soft': 'bounce 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
