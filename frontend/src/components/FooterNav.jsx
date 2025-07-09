// components/FooterNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaPlus, FaSearch, FaCar, FaBookmark } from "react-icons/fa";

const FooterNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 text-xs ${
      isActive ? "text-[#f72585]" : "text-gray-400"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111114] border-t border-[#2e2e3e] h-16 flex justify-around items-center z-50">
      <NavLink to="/create" className={linkClass}>
        <FaPlus size={18} />
        <span>Create</span>
      </NavLink>
      <NavLink to="/book" className={linkClass}>
        <FaSearch size={18} />
        <span>Book</span>
      </NavLink>
      <NavLink to="/created" className={linkClass}>
        <FaCar size={18} />
        <span>Created</span>
      </NavLink>
      <NavLink to="/booked" className={linkClass}>
        <FaBookmark size={18} />
        <span>Booked</span>
      </NavLink>
    </div>
  );
};

export default FooterNav;
