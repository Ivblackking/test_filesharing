import { BrowserRouter ,Routes, Route } from 'react-router-dom';

import AuthLayout from "./components/AuthLayout";
import Login from "./components/Auth/Login";
import SignUp from './components/Auth/SignUp';

import AdminLayout from './components/AdminLayout';
import AdminHome from './components/Admin/AdminHome';
import AllFiles from './components/Admin/AllFiles';
import AllUsers from './components/Admin/AllUsers';
import UserFiles  from './components/Admin/UserFiles';

import UserLayout from './components/UserLayout';
import MyFiles from './components/UserSpace/MyFiles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
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
