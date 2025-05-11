import './SelectInput.css';

const SelectInput = (props) => (
  <div className="select-wrapper">
    <label htmlFor={props.name} className="select-label">
      {props.label}
    </label>
    <select
      id={props.name}
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      className="select-field"
    >
      <option value="">Select</option>
      {props.options.map((opt, i) => (
        <option key={i} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </div>
);

export default SelectInput;
