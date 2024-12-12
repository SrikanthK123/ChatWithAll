/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

const SidebarItem = ({ label, personalMessage, imageUrl }) => {
  return (
    <li className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded-md cursor-pointer">
      <img
        src={imageUrl}
        alt={label}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="text-white font-semibold">{label}</span>
        <span className="text-xs text-gray-400">{personalMessage}</span>
      </div>
    </li>
  );
};

SidebarItem.propTypes = {
  label: PropTypes.string.isRequired,
  personalMessage: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

export default SidebarItem;
