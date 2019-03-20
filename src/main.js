import pixiedust, {render, html, useState} from 'neverland';

const App = pixiedust(() => {
  /* -------------    Setup   ------------- */

  const startingPoint = new URLSearchParams(window.location.search).get("find") ||
    "youtube-yBG10jlo9X0"; // Crash Course World Mythology #24: Ragnarok

  const [destination, setDestination] = useState(startingPoint);
  const [identifier, setIdentifier] = useState(destination);
  const metadataUrl = `https://archive.org/metadata/${identifier}`

  const relatedUrl = `https://be-api.us.archive.org/mds/v1/get_related/all/${identifier}`
  const [videoData, setVideoData] = useState(() =>
    fetch(metadataUrl).then(resp => resp.json()).then(json => {
      console.log(json)
      setVideoData(json)
    })
  );
  const [relatedData, setRelatedData] = useState(() =>
    fetch(relatedUrl).then(resp => resp.json()).then(json => {
      console.log(json)
      setRelatedData(json)
    })
  );
  const [errorMsg, setErrorMsg] = useState(null);

  window.history.pushState(null, null, `?find=${identifier}`)

  /* -------------  Callbacks ------------- */

  function fetchMetadata() {
    const requests = [
      fetch(metadataUrl),
      fetch(relatedUrl)
    ];
    Promise.all(requests)
      .then(async (responses) => {
        const [videoJson, relatedJson] = await Promise.all(responses.map(r => r.json()));
        setErrorMsg(null);
        setVideoData(videoJson);
        setRelatedData(relatedJson);
        setIdentifier(destination);
        window.history.pushState(null, null, `?find=${identifier}`);
      })
      .catch(error => setErrorMsg("It looks like that wasn't in the archive. Make sure your identifier is correct."));
  }

  /* ------------- Components ------------- */

  const ErrorMessage = pixiedust(() => html`<div style=${{
    display: errorMsg ? "block" : "none",
    position: "relative",
    top: -316,
    width: 512,
    height: 200
  }} class="error-message">${errorMsg}</div>
  `);

  const VideoDetails = pixiedust(() => html`
    <div>

    </div>
  `);

  const Lookup = pixiedust(() => html`
    <div>
      <form onsubmit=${(event) => {event.preventDefault(); fetchMetadata()}}>
        I want to see
        <span>
          archive.org/details/
          <input type="text" placeholder=${identifier} onchange=${({currentTarget: {value}}) => setDestination(value)} />
        </span>
      </form>
    </div>
  `);

  const RelatedVideos = pixiedust(() => html`
    <div>

    </div>
  `)

  const VideoPlayer = pixiedust(() => html`
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
      ${RelatedVideos()}
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
