# 🌸 Hướng Dẫn Hệ Thống Giao Diện - Tone Màu Trắng Hồng Sữa

## 📖 Tổng Quan

Hệ thống giao diện đã được đồng bộ hoàn toàn theo tone màu **trắng – hồng sữa** với phong cách **dễ thương, nhẹ nhàng và hiện đại**, phù hợp cho cửa hàng đồ chơi dành cho mọi lứa tuổi.

---

## 🎨 Hệ Thống Màu Sắc (Color System)

### Màu Chủ Đạo (Primary Colors)

```javascript
primary: {
  50: '#fff1f7',   // Hồng cực nhạt - Background, hover states
  100: '#ffe4f0',  // Hồng sữa rất nhạt - Cards, sections
  200: '#ffd1e3',  // Hồng sữa nhạt - Borders, dividers
  300: '#ffb3d4',  // Hồng sữa - Badges, tags
  400: '#ff8cbf',  // Hồng pastel - Buttons, links
  500: '#ff6ba9',  // Hồng chính - Primary actions
  600: '#f73d8f',  // Hồng đậm - Hover states
  700: '#e6226d',  // Hồng rất đậm - Active states
  800: '#c01a5b',  // Hồng tối - Text emphasis
  900: '#9d174d',  // Hồng cực tối - Headings
}
```

### Màu Phụ (Secondary Colors)

- **Rose**: `#fecdd3` - Dùng cho accents và decorations
- **Cream**: `#fffbfc`, `#fff5f7` - Background gradient
- **Cute Pink**: `#ffc0cb` - Special highlights
- **Lavender**: `#e6e6fa` - Soft accents

### Màu Trạng Thái (Status Colors)

- **Success**: Green 100-700 - Còn hàng, thành công
- **Warning**: Yellow 100-700 - Sắp hết hàng, cảnh báo
- **Danger**: Red 100-700 - Hết hàng, lỗi
- **Info**: Blue 100-700 - Thông tin

---

## 🎭 Typography - Font Chữ

### Font Families

```css
font-display: 'Quicksand' - Headings, logo, titles
font-body: 'Nunito' - Body text, paragraphs
font-sans: 'Poppins' - Alternative, UI elements
```

### Lý Do Chọn Font

1. **Quicksand**: Bo tròn, dễ thương, hiện đại
2. **Nunito**: Dễ đọc, thân thiện, phù hợp với trẻ em
3. **Poppins**: Geometric, sạch sẽ, professional

### Cách Sử Dụng

```jsx
<h1 className="font-display font-bold">ToyStore</h1>
<p className="font-body text-gray-600">Mô tả sản phẩm...</p>
```

---

## 🎨 UI Components Đã Tạo

### 1. Button Component

**Location**: `src/components/ui/Button.jsx`

**Variants**:
- `primary` - Gradient hồng, dùng cho actions chính
- `secondary` - White với border hồng
- `outline` - Transparent với border
- `danger` - Red gradient cho delete/cancel
- `success` - Green gradient cho confirm

**Sizes**: `sm`, `md`, `lg`

**Usage**:
```jsx
import { Button } from '../components/ui';

<Button variant="primary" size="lg" onClick={handleClick}>
  Mua ngay
</Button>

<Button variant="outline" loading={isLoading}>
  Đang xử lý...
</Button>
```

### 2. Card Component

**Location**: `src/components/ui/Card.jsx`

**Features**:
- Auto hover effect (nâng lên khi hover)
- Customizable padding
- Bo góc mềm mại
- Shadow nhẹ

**Usage**:
```jsx
import { Card } from '../components/ui';

<Card hover padding="lg">
  <h3>Tiêu đề</h3>
  <p>Nội dung...</p>
</Card>
```

### 3. Input Component

**Location**: `src/components/ui/Input.jsx`

**Features**:
- Label với required indicator
- Error state với message
- Icon support
- Focus states với primary color

**Usage**:
```jsx
import { Input } from '../components/ui';

<Input 
  label="Email"
  type="email"
  required
  error={errors.email}
  icon={<Mail size={18} />}
/>
```

### 4. Badge Component

**Location**: `src/components/ui/Badge.jsx`

**Variants**: `primary`, `success`, `warning`, `danger`, `info`, `rose`

**Usage**:
```jsx
import { Badge } from '../components/ui';

<Badge variant="success">Còn hàng</Badge>
<Badge variant="danger">Hết hàng</Badge>
```

### 5. Modal Component

**Location**: `src/components/ui/Modal.jsx`

**Features**:
- Backdrop blur effect
- Animation fade in/scale
- Auto body scroll lock
- Customizable sizes

**Usage**:
```jsx
import { Modal } from '../components/ui';

<Modal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Xác nhận"
  size="md"
>
  <p>Nội dung modal...</p>
</Modal>
```

### 6. Loading Component

**Location**: `src/components/ui/Loading.jsx`

**Features**:
- Cute spinner với primary color
- Full screen hoặc inline
- Custom text

**Usage**:
```jsx
import { Loading } from '../components/ui';

<Loading text="Đang tải..." />
<Loading fullScreen size="lg" />
```

### 7. ProductCard Component ⭐

**Location**: `src/components/ui/ProductCard.jsx`

**Features**:
- Hover overlay với quick actions
- Stock status badges
- Category badges
- Price formatting
- Image error handling
- Add to cart button

**Usage**:
```jsx
import { ProductCard } from '../components/ui';

<ProductCard 
  product={product}
  onAddToCart={handleAddToCart}
  onQuickView={handleQuickView}
  onFavorite={handleFavorite}
/>
```

---

## 🏗️ Layout Components

### MainLayout

**Location**: `src/layouts/MainLayout.jsx`

**Structure**:
```
┌─────────────────────┐
│      Navbar         │
├─────────────────────┤
│                     │
│      Content        │
│      (children)     │
│                     │
├─────────────────────┤
│      Footer         │
└─────────────────────┘
```

**Usage**:
```jsx
import MainLayout from '../layouts/MainLayout';

<MainLayout>
  <YourPageContent />
</MainLayout>
```

---

## 🎨 Design Tokens

### Border Radius

```javascript
rounded-cute: '1rem'    // 16px - Standard cute radius
rounded-bubble: '1.5rem' // 24px - Extra cute for cards
rounded-full: '9999px'   // Perfect circles
```

### Shadows

```javascript
shadow-soft: Nhẹ nhàng cho cards, inputs
shadow-cute: Trung bình cho hover states
shadow-bubble: Đậm hơn cho modals, popups
```

### Spacing Philosophy

- **Padding**: `p-4` (16px), `p-6` (24px), `p-8` (32px)
- **Gap**: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)
- **Margin**: `mb-4`, `mt-6`, `mx-auto`

**Nguyên tắc**: Sử dụng scale 4px (0.25rem) để đảm bảo consistency

---

## 🎭 Animation & Transitions

### Keyframe Animations

```css
animate-float: Float lên xuống (decorative icons)
animate-bounce-soft: Bounce nhẹ (logo, mascots)
animate-wiggle: Lắc nhẹ (interactive elements)
animate-fade-in: Fade in smooth
animate-scale-in: Scale from 0.9 to 1
animate-slide-up: Slide up from bottom
```

### Transition Classes

```javascript
transition-all duration-300: Standard transitions
hover:-translate-y-1: Lift on hover
hover:scale-105: Grow on hover
```

---

## 📱 Responsive Design

### Breakpoints (TailwindCSS defaults)

- **sm**: 640px - Small tablets
- **md**: 768px - Tablets
- **lg**: 1024px - Laptops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large screens

### Mobile-First Approach

```jsx
// Default mobile
<div className="grid grid-cols-1 gap-4">
  
// Tablet và lớn hơn
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 🚀 Cách Sử Dụng Trong Project

### Import UI Components

```jsx
// Import tất cả
import { Button, Card, Input, Badge, Modal, Loading, ProductCard } from '../components/ui';

// Hoặc import riêng
import Button from '../components/ui/Button';
```

### Sử Dụng Trong Pages

```jsx
import MainLayout from '../layouts/MainLayout';
import { Button, ProductCard, Loading } from '../components/ui';

const MyPage = () => {
  return (
    <MainLayout>
      <div className="container-cute py-8">
        <h1 className="text-4xl font-display font-bold text-gradient-primary">
          Tiêu đề
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
```

---

## 🎨 Utility Classes Thường Dùng

### Container & Layout

```css
container-cute: Max-width container với padding responsive
flex items-center justify-between: Flexbox common pattern
grid grid-cols-1 md:grid-cols-3: Responsive grid
```

### Text Styling

```css
text-gradient-primary: Gradient hồng cho headings
text-gradient-pink: Gradient hồng đậm hơn
font-display font-bold: Heading style
font-body text-gray-600: Body text style
```

### Background & Borders

```css
bg-gradient-to-br from-primary-50 to-rose-50: Background gradient nhẹ
border-2 border-primary-100: Border nhẹ
rounded-cute shadow-soft: Card style standard
```

### Interactive States

```css
hover:bg-primary-50: Background hover
hover:-translate-y-2: Lift hover
hover:shadow-cute: Shadow hover
transition-all duration-300: Smooth transition
```

---

## 📊 Cấu Trúc Thư Mục

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx        ✅ Đã tạo
│   │   ├── Card.jsx          ✅ Đã tạo
│   │   ├── Input.jsx         ✅ Đã tạo
│   │   ├── Badge.jsx         ✅ Đã tạo
│   │   ├── Modal.jsx         ✅ Đã tạo
│   │   ├── Loading.jsx       ✅ Đã tạo
│   │   ├── ProductCard.jsx   ✅ Đã tạo
│   │   ├── Footer.jsx        ✅ Đã tạo
│   │   └── index.js          ✅ Export file
│   ├── Navbar.js             ✅ Đã cập nhật
│   ├── ProductFilterBar.js   ✅ Đã cập nhật
│   └── ... (other components)
├── layouts/
│   └── MainLayout.jsx        ✅ Đã tạo
├── pages/
│   ├── Homepage.js           ✅ Đã cập nhật
│   └── Products/
│       └── ProductList.js    ✅ Đã cập nhật
└── index.css                 ✅ Đã cập nhật với TailwindCSS
```

---

## 🎯 Best Practices

### 1. Consistency

- Luôn dùng `rounded-cute` cho buttons, cards
- Dùng `shadow-soft` làm default shadow
- Spacing theo scale 4px

### 2. Color Usage

- **Primary (hồng)**: Actions, links, highlights
- **White**: Backgrounds, cards
- **Gray**: Text, borders
- **Success/Warning/Danger**: Status indicators only

### 3. Typography

- Headings: `font-display font-bold`
- Body: `font-body`
- Size scale: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.

### 4. Accessibility

- Always provide alt text for images
- Use semantic HTML
- Ensure sufficient color contrast
- Make interactive elements keyboard accessible

---

## 🔄 Mở Rộng Sau Này

### 1. Theme System (Future)

Có thể mở rộng để support multiple themes:

```javascript
// theme.config.js
const themes = {
  pink: { /* current theme */ },
  blue: { /* blue theme */ },
  purple: { /* purple theme */ }
};
```

### 2. Dark Mode (Optional)

Thêm dark mode variant nếu cần:

```javascript
className="bg-white dark:bg-gray-800"
```

### 3. Animation Library

Có thể tích hợp Framer Motion cho animations phức tạp hơn:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

### 4. Internationalization (i18n)

Thêm đa ngôn ngữ với react-i18next:

```jsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('homepage.welcome')}</h1>
```

---

## 📝 Component Development Checklist

Khi tạo component mới:

- [ ] Sử dụng màu từ theme (primary, rose, cream)
- [ ] Bo góc `rounded-cute` hoặc `rounded-bubble`
- [ ] Shadow `shadow-soft` cho default
- [ ] Transition `transition-all duration-300`
- [ ] Responsive với breakpoints `md:`, `lg:`
- [ ] PropTypes hoặc TypeScript (nếu dùng TS)
- [ ] Accessibility attributes
- [ ] Documentation trong code
- [ ] Example usage trong docs

---

## 🎨 Color Reference Quick Guide

| Use Case | Color Class | Hex |
|----------|-------------|-----|
| Primary Button | `bg-primary-500` | #ff6ba9 |
| Hover Button | `bg-primary-600` | #f73d8f |
| Card Background | `bg-white` | #ffffff |
| Section Background | `bg-primary-50` | #fff1f7 |
| Border Light | `border-primary-100` | #ffe4f0 |
| Border Medium | `border-primary-200` | #ffd1e3 |
| Text Primary | `text-gray-800` | - |
| Text Secondary | `text-gray-600` | - |
| Success | `bg-green-100` | - |
| Warning | `bg-yellow-100` | - |
| Danger | `bg-red-100` | - |

---

## 🚀 Getting Started

### 1. Cài Đặt Dependencies

```bash
npm install
```

### 2. Chạy Development Server

```bash
npm start
```

### 3. Build Production

```bash
npm run build
```

---

## 📞 Support

Nếu có thắc mắc về hệ thống giao diện:

1. Đọc documentation này
2. Xem example code trong các pages đã cập nhật
3. Check component source code trong `src/components/ui/`

---

## 🎉 Kết Luận

Hệ thống giao diện đã được thiết kế toàn diện với:

✅ **Tone màu nhất quán** - Trắng hồng sữa dễ thương
✅ **Components tái sử dụng** - 7+ UI components
✅ **Responsive design** - Mobile-first approach
✅ **Animations mượt mà** - Smooth transitions & keyframes
✅ **Accessibility** - Semantic HTML & ARIA
✅ **Developer friendly** - Easy to use & extend

**Chỉ thay đổi giao diện, không thay đổi logic xử lý!** ✨
