import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">FileSharing</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link to="/auth/login" className="nav-link active">Login</Link>
            </div>
            <div className="navbar-nav">
              <Link to="/auth/signup" className="nav-link active">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  )
};

export default AuthLayout;
