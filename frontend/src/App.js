import { BrowserRouter, Routes, Route, Link } from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Trang chủ</Link> |{" "}
        <Link to="/login">Đăng nhập</Link> |{" "}
        <Link to="/register">Đăng ký</Link> |{" "}
        <Link to="/profile">Cá nhân</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
