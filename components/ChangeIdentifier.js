const ChangeIdentifier = ({
  description,
  inputPlaceholder,
  onIdentifierChange,
}) => {
  return (
    <div
      className="cdx-message cdx-message--block cdx-message--warning"
      aria-live="polite"
      style={{ marginTop: "20px", display: "inline-block" }}
    >
      <span className="cdx-message__icon"></span>
      <div className="cdx-message__content">
        {description}
        <div className="cdx-text-input input-group">
          <span className="input-group-addon helper" id="bid">
            https://archive.org/details/
          </span>
          <input
            className="cdx-text-input__input"
            type="text"
            id="IAIdentifier"
            name="IAIdentifier"
            onChange={onIdentifierChange}
            required
            placeholder={inputPlaceholder}
          />
        </div>
      </div>
    </div>
  );
};

export default ChangeIdentifier;
