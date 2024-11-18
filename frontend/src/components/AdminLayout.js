import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  const handleLogout = () => {
    localStorage.setItem("access_token", "");
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/admin">FileSharing</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <Link to="/admin/all-files" className="nav-link active">Storage</Link>
            </div>
            <div className="navbar-nav">
              <Link to="/admin/all-users" className="nav-link active">Users</Link>
            </div>
          </div>
          <div className="navbar-nav">
              <Link to="/auth/login" className="nav-link active"
                onClick={handleLogout}
              >Logout</Link>
            </div>
        </div>
      </nav>

      <Outlet />
    </>
  )
};

export default AdminLayout;
