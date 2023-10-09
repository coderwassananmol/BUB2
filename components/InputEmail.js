export default function InputEmail({ inputDisabled, handleChange }) {
  return (
    <div>
      <h4>3. Enter Email Address</h4>
      <div className="cdx-text-input input-group">
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
