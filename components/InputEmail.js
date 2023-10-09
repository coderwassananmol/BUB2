export default function InputEmail({ inputDisabled, handleChange }) {
  return (
    <div style={{ marginTop: "2em" }}>
      <h4>3. Enter Email Address</h4>
      <div className="cdx-text-input input-group">
        <span className="input-group-addon helper" id="bid">
          Valid Email Address
        </span>
        <input
          className="cdx-text-input__input"
          id="email"
          name="email"
          type="email"
          disabled={inputDisabled}
          placeholder="user@gmail.com"
          onChange={(event) => handleChange(event)}
          aria-describedby="bid"
        />
      </div>
    </div>
  );
}
