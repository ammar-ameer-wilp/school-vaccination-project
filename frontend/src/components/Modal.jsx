import './Modal.css';

const Modal = (props) => {
  if (!props.isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{props.title}</h3>
          <button className="modal-close" onClick={props.onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{props.children}</div>
      </div>
    </div>
  );
};

export default Modal;
