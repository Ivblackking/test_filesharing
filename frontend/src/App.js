import { BrowserRouter ,Routes, Route } from 'react-router-dom';
import AuthLayout from "./components/AuthLayout";
import Login from "./components/Auth/Login";
import AllFiles from './components/Admin/AllFiles';
import AllUsers from './components/Admin/AllUsers';
import MyFiles from './components/UserSpace/MyFiles';
import UserFiles from './components/Admin/UserFiles';
import AdminLayout from './components/AdminLayout';
import AdminHome from './components/Admin/AdminHome';
import UserLayout from './components/UserLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/admin/" element={<AdminLayout />}>
          <Route path="" element={<AdminHome />} />
          <Route path="all-files" element={<AllFiles />} />
          <Route path="all-users" element={<AllUsers />} />
          <Route path="user-files" element={<UserFiles />} />
        </Route>
        <Route path="/user-space/" element={<UserLayout />}>
          <Route path="my-files" element={<MyFiles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
