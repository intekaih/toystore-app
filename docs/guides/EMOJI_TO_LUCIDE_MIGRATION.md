# 🎨 EMOJI TO LUCIDE ICONS MIGRATION GUIDE

## 📌 Thông tin

**Icon Library đang dùng:** Lucide React (https://lucide.dev/)
**Đã cài đặt:** ✅ lucide-react
**Version:** Check trong `frontend/package.json`

## 🎯 Bảng ánh xạ Emoji → Lucide Icons

```javascript
// Import từ lucide-react
import {
  // Navigation & Actions
  Home,              // 🏠
  Package,           // 📦
  ShoppingCart,      // 🛒
  Users,             // 👥
  TrendingUp,        // 📈
  
  // CRUD Operations
  Plus,              // ➕
  Edit,              // ✏️
  Edit2,             // ✏️ (alternative)
  Trash2,            // 🗑️
  X,                 // ❌
  Check,             // ✅
  Save,              // 💾
  
  // Files & Folders
  Folder,            // 📁
  FolderOpen,        // 📂
  File,              // 📄
  FileText,          // 📝
  
  // Media
  Camera,            // 📷
  Image,             // 🖼️
  Video,             // 🎥
  
  // UI Elements
  Tag,               // 🏷️
  Tags,              // 🏷️ (multiple)
  Search,            // 🔍
  Settings,          // ⚙️
  Filter,            // 🎯
  
  // Time & Status
  Clock,             // ⏳
  Loader,            // ⏳ (loading spinner)
  Calendar,          // 📅
  
  // Business
  BarChart3,         // 📊
  Target,            // 🎯
  Award,             // 🏆
  
  // Special
  Gamepad2,          // 🎮
  Sparkles,          // ✨
  Star,              // ⭐
} from 'lucide-react';
```

## 📝 Các file cần update (Ưu tiên cao)

### 1. Components (8 files)
- [ ] `AutocompleteInput.jsx`
- [ ] `CategoryModal.js`
- [ ] `CategoryTable.js`
- [ ] `ProductModal.jsx`

### 2. Pages - Admin (7 files)
- [ ] `BrandManagementPage.jsx`
- [ ] `ProductManagementPage.jsx`
- [ ] `VoucherManagementPage.jsx`
- [ ] `UserManagementPage.js`
- [ ] `StatisticsPage.jsx`
- [ ] `CategoryManagementPage.js`

### 3. Pages - Public (2 files)
- [ ] `ProductDetail.js`
- [ ] `RegisterPage.js`

### 4. Layouts (1 file)
- [ ] `AdminLayout.jsx`

### 5. Services (1 file)
- [ ] `staffService.js`

## 🔄 Pattern chuyển đổi

### ❌ BEFORE (Emoji):
```jsx
<button>
  ➕ Thêm mới
</button>

<h2>✏️ Cập nhật sản phẩm</h2>

<span className="text-3xl">📦</span>
```

### ✅ AFTER (Lucide):
```jsx
import { Plus, Edit, Package } from 'lucide-react';

<button className="flex items-center gap-2">
  <Plus size={16} />
  Thêm mới
</button>

<h2 className="flex items-center gap-2">
  <Edit size={18} />
  Cập nhật sản phẩm
</h2>

<Package size={32} className="text-gray-600" />
```

## 🎨 Styling với Lucide Icons

### Size presets:
```jsx
<Icon size={12} />  // Extra small
<Icon size={16} />  // Small
<Icon size={18} />  // Medium
<Icon size={20} />  // Default
<Icon size={24} />  // Large
<Icon size={32} />  // Extra large
<Icon size={48} />  // Hero
```

### Colors:
```jsx
// Inline color
<Icon color="#ec4899" />

// Tailwind classes
<Icon className="text-pink-500" />
<Icon className="text-blue-600" />
<Icon className="text-red-500" />
```

### Stroke width:
```jsx
<Icon strokeWidth={1.5} />  // Thin
<Icon strokeWidth={2} />    // Default
<Icon strokeWidth={2.5} />  // Bold
```

## 📦 Chi tiết từng file cần update

### 1. ProductModal.jsx
```jsx
// Add imports
import { 
  Plus, 
  Edit, 
  FileText, 
  Tag, 
  FolderOpen, 
  Camera, 
  Folder,
  Check,
  Save,
  Loader 
} from 'lucide-react';

// Replace:
'➕ Thêm sản phẩm mới' → <><Plus size={18} /> Thêm sản phẩm mới</>
'✏️ Cập nhật sản phẩm' → <><Edit size={18} /> Cập nhật sản phẩm</>
'📝 Thông tin cơ bản' → <><FileText size={16} /> Thông tin cơ bản</>
'🏷️ Phân loại' → <><Tag size={16} /> Phân loại</>
'📂' → <FolderOpen size={16} />
'🏷️' → <Tag size={16} />
'📷 Hình ảnh' → <><Camera size={16} /> Hình ảnh</>
'📁 Chọn ảnh' → <><Folder size={16} /> Chọn ảnh</>
'⏳ Đang xử lý' → <><Loader className="animate-spin" size={16} /> Đang xử lý</>
'✅ Tạo mới' → <><Check size={16} /> Tạo mới</>
'💾 Cập nhật' → <><Save size={16} /> Cập nhật</>
```

### 2. BrandManagementPage.jsx
```jsx
import { Tag, Plus, Edit, Trash2, Check, Save } from 'lucide-react';

// Replace:
'🏷️' (title) → <Tag size={32} />
'➕' (button) → <Plus size={18} />
'✏️ Sửa' → <><Edit size={16} /> Sửa</>
'🗑️ Xóa' → <><Trash2 size={16} /> Xóa</>
'✅ Tạo mới' → <><Check size={16} /> Tạo mới</>
'💾 Cập nhật' → <><Save size={16} /> Cập nhật</>
```

### 3. ProductManagementPage.jsx
```jsx
import { Package, FolderOpen, Plus } from 'lucide-react';

// Replace:
'📦' (title) → <Package size={32} />
'📁 Tất cả' → <><FolderOpen size={16} /> Tất cả</>
'➕' (button) → <Plus size={18} />
```

### 4. AdminLayout.jsx
```jsx
import { Gamepad2, Package } from 'lucide-react';

// Replace:
'🎮' (logo) → <Gamepad2 size={24} className="animate-bounce-soft" />
icon: '📦' → icon: <Package size={18} />
```

### 5. AutocompleteInput.jsx
```jsx
import { Plus } from 'lucide-react';

// Replace in createText:
<span className="create-icon">➕</span> 
→ 
<Plus size={16} className="text-pink-500" />
```

## 🔧 Utility Helper Component (Optional)

Tạo wrapper component cho consistent styling:

```jsx
// src/components/ui/Icon.jsx
import React from 'react';
import * as Icons from 'lucide-react';

export const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  color,
  strokeWidth = 2,
  ...props 
}) => {
  const LucideIcon = Icons[name];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }
  
  return (
    <LucideIcon 
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

// Usage:
<Icon name="Plus" size={16} className="text-pink-500" />
```

## ⚡ Quick Find & Replace (VS Code)

1. **Find:** `➕`
   **Replace:** `<Plus size={16} />`

2. **Find:** `✏️`
   **Replace:** `<Edit size={16} />`

3. **Find:** `🗑️`
   **Replace:** `<Trash2 size={16} />`

4. **Find:** `📦`
   **Replace:** `<Package size={20} />`

5. **Find:** `📁`
   **Replace:** `<Folder size={16} />`

6. **Find:** `📂`
   **Replace:** `<FolderOpen size={16} />`

7. **Find:** `🏷️`
   **Replace:** `<Tag size={16} />`

8. **Find:** `📝`
   **Replace:** `<FileText size={16} />`

9. **Find:** `📷`
   **Replace:** `<Camera size={16} />`

10. **Find:** `✅`
    **Replace:** `<Check size={16} />`

11. **Find:** `💾`
    **Replace:** `<Save size={16} />`

12. **Find:** `⏳`
    **Replace:** `<Loader className="animate-spin" size={16} />`

⚠️ **Lưu ý:** Nhớ thêm `flex items-center gap-2` class cho container khi dùng icon + text!

## 📊 Progress Tracking

**Total files:** 19
**Completed:** 0
**In Progress:** 0
**Pending:** 19

---

## 🎯 Benefits của việc dùng Lucide Icons

✅ **Consistent design** - Tất cả icons cùng style
✅ **Scalable** - SVG vector, không bị vỡ khi zoom
✅ **Customizable** - Dễ đổi size, màu, stroke
✅ **Accessible** - Hỗ trợ screen reader tốt hơn
✅ **Performance** - Tree-shaking, chỉ import icon dùng
✅ **Modern** - Professional, clean design
✅ **Type-safe** - TypeScript support

## 🚀 Next Steps

1. Bắt đầu với components nhỏ (AutocompleteInput, CategoryModal)
2. Test kỹ UI sau khi đổi
3. Tiếp tục với các pages admin
4. Cuối cùng update layouts và services
5. Commit từng batch để dễ rollback nếu cần

---

✅ **Khuyến nghị:** Làm từng file một, test ngay để đảm bảo không bị lỗi layout!