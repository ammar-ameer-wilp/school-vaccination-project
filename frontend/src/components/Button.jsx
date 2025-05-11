import './Button.css';

const Button = (props) => {
  return (
    <button
      type={props.type || 'button'}
      onClick={props.onClick}
      className={`custom-btn ${props.className || ''}`}
    >
      {props.children}
    </button>
  );
};

export default Button;
