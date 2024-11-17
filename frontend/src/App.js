import { BrowserRouter ,Routes, Route } from 'react-router-dom';
import AuthLayout from "./components/AuthLayout";
import Login from "./components/Login";
import AllFiles from './components/AllFiles';
import AllUsers from './components/AllUsers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/admin/">
          <Route path="all-files" element={<AllFiles />} />
          <Route path="all-users" element={<AllUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
