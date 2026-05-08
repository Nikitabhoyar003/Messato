import "./ConfirmModal.css";

const ConfirmModal = ({
  open,
  title,
  message,
  showInput,
  inputValue,
  setInputValue,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>{title}</h3>
        <p>{message}</p>

        {showInput && (
          <textarea
            placeholder="Reason for rejection..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="modal-textarea"
          />
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
