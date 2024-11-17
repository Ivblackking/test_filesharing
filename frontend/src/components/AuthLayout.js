import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">FileSharing</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <Link to="/auth/login" className="nav-link active">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  )
};

export default AuthLayout;
