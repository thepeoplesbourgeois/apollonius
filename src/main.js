import hookable, {render, html, useState, useEffect} from 'neverland/esm';

const App = hookable(() => {
  /* -------------    State   ------------- */
  const [identifier, setIdentifier] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metadataPairs, setMetadataPairs] = useState([]);
  const [relatedData, setRelatedData] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");

  /* ------------- Components ------------- */

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
                <td>${value}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const Lookup = hookable(() => html`
    <div class="lookup">
      <form onsubmit=${(event) => {
        event.preventDefault();
        const value = event.currentTarget.querySelector("input").value;
        if (value !== '') {
          fetchData(value);
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

  // TODO: put VideoPlayer into its own file
  const VideoPlayer = hookable(() => {
    const RelatedVideos = hookable(() => {
      const tiles = relatedData.map(({id, title, description}) => html`
        <li>
          <a title=${description} onclick=${(event) => {
            event.preventDefault();
            fetchData(id);
          }}>
            <img src=${`https://archive.org/services/img/${id}`} height=50 width=75 />
            <span>${title}</span>
          </a>
        </li>
      `)

      return html`
        <ul style=${{
          display: 'inline-block',
          height: 480,
          width: 250,
          backgroundColor: 'rgb(20, 20, 20)',
          color: '#FFF',
          textDecoration: 'none'
        }}>
          ${tiles}
        </ul>
      `
    })

    const ErrorMessage = hookable(() => html`<div style=${{
      display: errorMsg === '' ? "none" : "block",
      position: "relative",
      top: -316,
      width: 512,
      height: 200
    }} class="error-message">
      <div>${errorMsg}</div>
      <a onclick=${() => setErrorMsg("")}>close</a>
    </div>
    `);

    return html`
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
    `
  })

  /* -------------  Callbacks ------------- */

  async function fetchMetadata(destination) {
    const resp = await fetch(`https://archive.org/metadata/${destination}`);
    const json = await resp.json();
    const {metadata: {title, description, ...metaRest}} = json;
    setTitle(title);
    setDescription(description);
    setMetadataPairs(Object.entries(metaRest));
  };

  async function fetchRelated(destination) {
    const resp = await fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${destination}`);
    const json = await resp.json();
    const {hits: {hits: items}} = json;
    const relData = items.map(
      ({_id: id, _source: {title: [title], description: [description]}}) => ({id, title, description})
    );
    setRelatedData(relData);
  };

  async function fetchData(destination) {
    try {
      const meta = fetchMetadata(destination);
      const rel = fetchRelated(destination);
      await meta;
      await rel;
      setIdentifier(destination);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg("It looks like that wasn't in the archive. Make sure your identifier is correct.");
    }
  }

  useEffect(() => {
    const findParam = new URLSearchParams(window.location.search).get("find");
    const startingPoint = findParam ||
      "youtube-yBG10jlo9X0"; // Crash Course World Mythology #24: Ragnarok

    setIdentifier(startingPoint)
    fetchData(startingPoint)
  }, [])


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
