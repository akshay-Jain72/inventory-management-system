
import { useEffect, useState } from "react";
import "./Users.css";

const API = "https://inventory-management-system-lzyk.onrender.com";

// FETCH USERS FUNCTION
async function getUsers(token) {
  if (!token) {
    throw new Error("Token not found. Please login again.");
  }

  const response = await fetch(`${API}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid users data");
  }

  return data;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const token = localStorage.getItem("token");

  // LOAD USERS
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await getUsers(token);

        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(err.message || "Failed to load users");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // REFRESH USERS
  async function handleRefresh() {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to refresh users");
    } finally {
      setLoading(false);
    }
  }

  // BLOCK / UNBLOCK
  async function handleUserStatus(userId, isBlocked) {
    try {
      setActionLoading(userId);
      setError("");

      const action = isBlocked ? "unblock" : "block";

      const response = await fetch(
        `${API}/users/${userId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setUsers((oldUsers) =>
        oldUsers.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: !isBlocked }
            : user
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update user");
    } finally {
      setActionLoading("");
    }
  }

  // SEARCH
  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase().trim();

    return (
      (user.name || "").toLowerCase().includes(value) ||
      (user.email || "").toLowerCase().includes(value) ||
      (user.role || "").toLowerCase().includes(value)
    );
  });

  // COUNTS
  const totalUsers = users.length;

  const blockedUsers = users.filter(
    (user) => user.isBlocked
  ).length;

  const activeUsers = totalUsers - blockedUsers;

  // LOADING
  if (loading) {
    return (
      <div className="users-loading">
        <div className="users-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-page">

      {/* HEADER */}
      <div className="users-header">
        <div>
          <span className="users-eyebrow">
            ADMINISTRATION
          </span>

          <h1>User Management</h1>

          <p>
            Manage accounts, access and user status.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-btn"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="users-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="users-stats">

        <div className="users-stat-card">
          <div className="users-stat-icon total-icon">
            ♙
          </div>

          <div>
            <span>Total Users</span>
            <h2>{totalUsers}</h2>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon active-icon">
            ✓
          </div>

          <div>
            <span>Active Users</span>
            <h2>{activeUsers}</h2>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon blocked-icon">
            ⊘
          </div>

          <div>
            <span>Blocked Users</span>
            <h2>{blockedUsers}</h2>
          </div>
        </div>

      </div>

      {/* USER SECTION */}
      <div className="users-content">

        <div className="users-toolbar">
          <div>
            <h2>All Users</h2>
            <p>Review and manage registered accounts.</p>
          </div>

          <div className="users-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map((user) => (
                <tr key={user._id}>

                  {/* USER */}
                  <td>
                    <div className="users-identity">
                      <div className="users-avatar">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>

                      <div className="users-details">
                        <strong>
                          {user.name || "Unknown"}
                        </strong>

                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td>
                    <span
                      className={`users-role ${
                        (user.role || "").toLowerCase()
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`users-status ${
                        user.isBlocked
                          ? "blocked"
                          : "active"
                      }`}
                    >
                      <span className="status-dot"></span>

                      {user.isBlocked
                        ? "Blocked"
                        : "Active"}
                    </span>
                  </td>

                  {/* DATE */}
                  <td>
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* ACTION */}
                  <td>
                    {user.role === "admin" ? (
                      <span className="admin-protected">
                        Protected
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          actionLoading === user._id
                        }
                        className={`users-action-btn ${
                          user.isBlocked
                            ? "unblock-btn"
                            : "block-btn"
                        }`}
                        onClick={() =>
                          handleUserStatus(
                            user._id,
                            user.isBlocked
                          )
                        }
                      >
                        {actionLoading === user._id
                          ? "Updating..."
                          : user.isBlocked
                          ? "Unblock"
                          : "Block"}
                      </button>
                    )}
                  </td>

                </tr>
              ))}

              {/* EMPTY */}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="users-empty"
                  >
                    {search
                      ? "No matching users found."
                      : "No users found."}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}
        <div className="users-footer">
          Showing {filteredUsers.length} of {totalUsers} users
        </div>

      </div>
    </div>
  );
}

export default Users;
