import React from 'react';
import './Message.css';

const Message = ({ message, type }) => {
  return <div className={`message ${type}`}>{message}</div>;
};

export default Message;
