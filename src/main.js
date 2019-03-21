import hookable, {render, html, useState} from 'neverland/esm';

const App = hookable(() => {
  /* -------------    Setup   ------------- */

  const startingPoint = new URLSearchParams(window.location.search).get("find") ||
    "youtube-yBG10jlo9X0"; // Crash Course World Mythology #24: Ragnarok

  const [destination, setDestination] = useState(startingPoint);
  const [identifier, setIdentifier] = useState(destination);

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [metadataPairs, setMetadataPairs] = useState([])

  const [relatedData, setRelatedData] = useState(async () => {
    const resp = await fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${identifier}`);
    const json = await resp.json();
    return await json;
  });
  const [errorMsg, setErrorMsg] = useState('');

  window.history.pushState({}, '', `?find=${identifier}`)

  /* -------------  Callbacks ------------- */

  async function fetchMetadata() {
    let metadataReq = fetch(`https://archive.org/metadata/${destination}`);
    metadataReq = await metadataReq;
    const metadataJson = await metadataReq.json();

    let relatedReq = fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${destination}`);
    relatedReq = await relatedReq;
    const relatedJson = await relatedReq.json();

    const {metadata: {title, description, ...metaRest}} = metadataJson;
    setTitle(title);
    setDescription(description);
    setMetadataPairs(Object.entries(metaRest));

    Promise
      .all(urls.map(url => fetch(url)))
      .then(async (responses) => {
        const promises = Promise.all(responses.map(r => r.json()));
        const [videoData, relatedData] = await promises;
        setErrorMsg('');
        setVideoData(await videoData);
        setRelatedData(awaitrelatedData);
        setIdentifier(destination);
        window.history.pushState({}, '', `?find=${identifier}`);
      })
      .catch(error => setErrorMsg("It looks like that wasn't in the archive. Make sure your identifier is correct."));
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

  // const RelatedVideos = hookable(async () => {
  //   const {hits: {hits: items}} = await relatedData;
  //   // debugger;
  //   const relatedVideos = items
  //     .map((item) => {
  //       const {_id: id, _source: {title: [title], description: [description]}} = item
  //       debugger;
  //       return html`
  //         <li>
  //           <a title=${description} onclick=${(event) => {
  //             event.preventDefault();
  //             setIdentifier(id);
  //             fetchMetadata();
  //           }}>
  //             <img src=${`https://archive.org/services/img/${id}`} height=80 width=120 />
  //             <span>${title}</span>
  //           </a>
  //         </li>
  //       `
  //     });
  //   // debugger;
  //   return html`
  //     <ul style=${{
  //       display: 'inline-block',
  //       height: 640,
  //       width: 220,
  //       backgroundColor: 'rgb(20, 20, 20)',
  //       color: '#FFF',
  //       textDecoration: 'none'
  //     }}>
  //       ${relatedVideos}
  //     </ul>
  //   `
  // });

  const Lookup = hookable(() => html`
    <div class="lookup">
      <form onsubmit=${(event) => {event.preventDefault(); fetchMetadata()}}>
        I want to see
        <span>
          archive.org/details/
          <input type="text" placeholder=${identifier} onchange=${({currentTarget: {value}}) => setDestination(value)} />
        </span>
      </form>
    </div>
  `);

  const VideoPlayer = hookable(() => html`
    <div style=${{
      display: 'flex',
      flexDirection: 'row',
    }}>
      <iframe
        src=${`https://archive.org/embed/${identifier}`}
        width="640"
        height="480"
        frameborder="0"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        playlist="1"
        allowfullscreen></iframe>
      ${ErrorMessage()}
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
