import hookable, {render, html, useState} from 'neverland/esm';

const App = hookable(() => {
  /* -------------    Setup   ------------- */

  const findParam = new URLSearchParams(window.location.search).get("find");
  const startingPoint = findParam ||
    "youtube-yBG10jlo9X0"; // Crash Course World Mythology #24: Ragnarok

  if (!findParam) {
    window.history.pushState({}, '', `?find=${startingPoint}`);
  }

  const [destination, setDestination] = useState(startingPoint);
  const [identifier, setIdentifier] = useState(destination);

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [metadataPairs, setMetadataPairs] = useState([]);
  const [relatedData, setRelatedData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  fetchData();
  /* -------------  Callbacks ------------- */

  async function fetchMetadata() {
    const resp = await fetch(`https://archive.org/metadata/${destination}`);
    const json = await resp.json();
    const {metadata: {title, description, ...metaRest}} = json
    setTitle(title);
    setDescription(description);
    setMetadataPairs(Object.entries(metaRest));
  };

  async function fetchRelated() {
    const resp = await fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${destination}`);
    const json = await resp.json();
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
      setIdentifier(destination);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg("It looks like that wasn't in the archive. Make sure your identifier is correct.");
    }
  }

  /* ------------- Components ------------- */

  const ErrorMessage = hookable(() => html`<div style=${{
    display: errorMsg === '' ? "none" : "block",
    position: "relative",
    top: -316,
    width: 512,
    height: 200
  }} class="error-message">${errorMsg}</div>
  `);

  const VideoDetails = hookable(() => html`
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
  `);

  const RelatedVideos = hookable(() => {
    const relatedVideos = relatedData
      .map((item) => {
        const {id, title, description} = item;
        return html`
          <li>
            <a title=${description} onclick=${(event) => {
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
  });

  const Lookup = hookable(() => html`
    <div class="lookup">
      <form onsubmit=${(event) => {
        event.preventDefault();
        const value = event.currentTarget.querySelector("input").value;
        if (value !== '') {
          setDestination(value);
          fetchMetadata();
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
  `);

  const VideoPlayer = hookable(() => html`
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
  `);

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
