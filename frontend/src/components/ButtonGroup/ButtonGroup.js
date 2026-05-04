import React from 'react';
import './ButtonGroup.css';

const ButtonGroup = ({ options, handleClick }) => {
  return (
    <div className="buttons">
      {options.map((option, index) => (
        <button key={index} onClick={() => handleClick(option.label, option.next)}>
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;