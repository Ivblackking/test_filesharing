import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/auth/login">Login</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default AuthLayout;
