import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <>
      <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="/admin">FileSharing</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <Link to="/admin/all-files" className="nav-link active">Storage</Link>
            </div>
            <div class="navbar-nav">
              <Link to="/admin/all-users" className="nav-link active">Users</Link>
            </div>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  )
};

export default AdminLayout;
