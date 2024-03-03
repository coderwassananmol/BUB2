export default () => (
  <div>
    <style jsx>
      {`
        .footer {
          width: 100%;
          background-color: #f5f5f5;
          margin-top: auto;
          padding: 1em;
          left: 0;
          bottom: 0;
        }
      `}
    </style>
    <footer className="footer">
      <div className="text-center h5">
        Made with <span className="cdx-css-icon--heart-icon"></span> for
        <a
          title='Logo and trademark of the Wikimedia Foundation, designed by Wikipedia user "Neolux" / CC BY-SA (https://creativecommons.org/licenses/by-sa/4.0)'
          href="https://commons.wikimedia.org/wiki/File:Wikimedia_Foundation_Logo.png"
        >
          <span className="cdx-css-icon--wikimedia-only-icon"></span>
        </a>
        <div className="h5">
          License:
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0"
            style={{
              marginRight: "15px",
              marginLeft: "4px",
            }}
          >
            CC BY-SA 4.0
          </a>
          Author:
          <a
            href="https://en.wikipedia.org/wiki/User:Wassan.anmol"
            style={{ marginLeft: "4px" }}
          >
            Wassan.anmol
          </a>
        </div>
      </div>
    </footer>

    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js"
      integrity="sha256-JmvOoLtYsmqlsWxa7mDSLMwa6dZ9rrIdtrrVYRnDRH0="
      crossOrigin="anonymous"
    ></script>
    <script
      src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
      integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
      crossOrigin="anonymous"
    ></script>
  </div>
);
