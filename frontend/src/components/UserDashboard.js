import React from "react";
import { Outlet } from "react-router-dom";

function UserDashboard() {
  return (
    <div className="min-vh-100 bg-white p-4">
      <Outlet />
    </div>
  );
}

export default UserDashboard;
