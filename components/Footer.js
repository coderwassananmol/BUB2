export default () => (
  <div
    style={{
    marginTop: '0px',
      paddingTop: "15px",
      paddingBottom: "15px",
      width: "100%",
      backgroundColor: "#d7d6d6",
      fontFamily: 'verdana,"Helvetica Neue",Helvetica,Arial,sans-serif'
    }}
  >
    <footer>
      <div className="text-center">
        <div style={{ fontSize: "16px" }}>
          Made with{" "}
          <span style={{ color: "#ad1010", fontSize: "24px" }}>&hearts;</span>{" "}
          for
          <a
            title='Logo and trademark of the Wikimedia Foundation, designed by Wikipedia user "Neolux" / CC BY-SA (https://creativecommons.org/licenses/by-sa/4.0)'
            href="https://commons.wikimedia.org/wiki/File:Wikimedia_Foundation_Logo.png"
            style={{ marginLeft: "5px" }}
          >
            <img
              width="35"
              alt="Wikimedia Foundation Logo"
              src="https://upload.wikimedia.org/wikipedia/commons/5/56/Wikimedia_Foundation_Logo.png"
            />
          </a>
        </div>
        <div className="h5">
          Licence:
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0"
            style={{
              marginRight: "15px",
              marginLeft: "4px"
            }}
          >
            CC BY-SA 4.0
          </a>
          Author:
          <a
            href="https://en.wikipedia.org/wiki/User:Neolux"
            style={{ marginLeft: "4px" }}
          >
            Neolux
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