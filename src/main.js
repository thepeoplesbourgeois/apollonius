import hookable, {render, html, useState, useEffect} from 'neverland/esm';

const App = hookable(() => {
  const findParam = new URLSearchParams(window.location.search).get("find");
  const startingPoint = findParam ||
    "youtube-yBG10jlo9X0"; // Crash Course World Mythology #24: Ragnarok

  /* ------------- Components ------------- */

  const { VideoDetails, setTitle, setDescription, setMetadataPairs } = (
    // IIFE
    function (){
      const [title, setTitle] = useState("");
      const [description, setDescription] = useState("");
      const [metadataPairs, setMetadataPairs] = useState([]);

      return {
        VideoDetails: hookable(() => html`
          <div class="details">
            <div>
              <h1>${title}</h1>
              <p>${description}</p>
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${metadataPairs.map(([key, value]) => html`
                    <tr>
                      <td>${key}</td>
                      <td>${JSON.stringify(value)}</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
          `
        ),
        setTitle,
        setDescription,
        setMetadataPairs
      }
    }
  ());

  const {Lookup, identifier, destination, setIdentifier, setDestination} = (
    // IIFE
    function (){
      const [destination, setDestination] = useState('');
      const [identifier, setIdentifier] = useState(destination);
      return {
        Lookup: hookable(() => html`
          <div class="lookup">
            <form onsubmit=${(event) => {
              debugger;
              event.preventDefault();
              const value = event.currentTarget.querySelector("input").value;
              if (value !== '') {
                setDestination(value);
                fetchData();
              }
            }}>
              I want to see
              <span>
                archive.org/details/
                <input type="text" placeholder=${identifier} />
              </span>
              <button type="submit">please.</button>
            </form>
          </div>
        `),
        identifier,
        destination,
        setDestination,
        setIdentifier
      }
    }());

  // TODO: put VideoPlayer into its own file
  const {VideoPlayer, setErrorMsg, setRelatedData} = (
    // IIFE
    function () {
      const [relatedData, setRelatedData] = useState([]);
      const [errorMsg, setErrorMsg] = useState('');

      const RelatedVideos = hookable(() => {
        const relatedVideos = relatedData
          .map((item) => {
            const {id, title, description} = item;
            return html`
              <li>
                <a title=${description} onclick=${(event) => {
                  debugger;
                  event.preventDefault();
                  setDestination(id);
                  fetchData();
                }}>
                  <img src=${`https://archive.org/services/img/${id}`} height=50 width=75 />
                  <span>${title}</span>
                </a>
              </li>
            `
          });
        return html`
          <ul style=${{
            display: 'inline-block',
            height: 480,
            width: 250,
            backgroundColor: 'rgb(20, 20, 20)',
            color: '#FFF',
            textDecoration: 'none'
          }}>
            ${relatedVideos}
          </ul>
        `
      })

      const ErrorMessage = hookable(() => html`<div style=${{
        display: errorMsg === '' ? "none" : "block",
        position: "relative",
        top: -316,
        width: 512,
        height: 200
      }} class="error-message">${errorMsg}</div>
      `);

      return {
        VideoPlayer: hookable(() => html`
          <div style=${{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <div>
              <iframe
                src=${`https://archive.org/embed/${identifier}`}
                width="640"
                height="480"
                frameborder="0"
                webkitallowfullscreen="true"
                mozallowfullscreen="true"
                playlist="1"
                allowfullscreen></iframe>
            </div>
            <div>${ErrorMessage()}</div>
            <div>${RelatedVideos()}</div>
          </div>
        `),
        setErrorMsg,
        setRelatedData
      }
    }()
  );

  /* -------------  Callbacks ------------- */

  async function fetchMetadata() {
    debugger;
    const resp = await fetch(`https://archive.org/metadata/${destination}`);
    const json = await resp.json();
    const {metadata: {title, description, ...metaRest}} = json
    debugger;
    setTitle(title);
    setDescription(description);
    setMetadataPairs(Object.entries(metaRest));
  };

  async function fetchRelated() {
    debugger;
    const resp = await fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${destination}`);
    const json = await resp.json();
    debugger;
    const {hits: {hits: items}} = json;
    const relData = items.map(
      ({_id: id, _source: {title: [title], description: [description]}}) => ({id, title, description})
    );
    setRelatedData(relData);
  };

  async function fetchData() {
    try {
      const meta = fetchMetadata();
      const rel = fetchRelated();
      await meta;
      await rel;
      debugger;
      setIdentifier(destination);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg("It looks like that wasn't in the archive. Make sure your identifier is correct.");
    }
  }

  /* ------------- kludge setup ------------- */
  useEffect(() => {
    debugger;
    if (identifier === '') {
      if (!findParam) {
        window.history.pushState({}, '', `?find=${startingPoint}`);
      }
      setDestination(startingPoint);
      debugger;
      fetchData();
    }
  });

  return html`
    <div style=${{
        display: 'flex',
        flexDirection: 'column'
      }}>
      ${Lookup()}
      ${VideoPlayer()}
      ${VideoDetails()}
    </div>
  `;

});

render(document.body, App);
