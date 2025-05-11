import './InputLabel.css';

export const InputLabel = (props) => {
  return (
    <div className="input-wrapper">
      <label htmlFor={props.name} className="input-label">
        {props.label}
      </label>
      <input
        id={props.name}
        name={props.name}
        type={props.type || 'text'}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className="input-field"
      />
    </div>
  );
};
