import hookable, {render, html, useState, useEffect} from 'neverland/esm';

const App = hookable(function() {
  const PLAYABLE_FORMATS = new Set(["h.264", "MPEG4", "Ogg Video", "WebM"]);

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
        ${
          // TODO: Make look good
          false ? html`
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
          ` : null
        }
    </div>
  `);

  const Lookup = hookable(function(){
    return html`
      <div class="lookup">
        <form onsubmit=${function(event) {
          event.preventDefault();
          const value = this.identifier.value;
          if (value !== '') {
            fetchData(value);
          }
        }}>
          I want to see
          <code>
            archive.org/details/
            <input name="identifier" type="text" placeholder=${identifier} />
          </code>
          <button type="submit">please.</button>
        </form>
      </div>
    `
  });

  const VideoPlayer = hookable(() => {
    const RelatedVideos = hookable(() => {
      const tiles = relatedData.map(({id, title, description}) => html`
        <li
          class="related-video"
          title=${description}
          onclick=${(event) => {
            event.preventDefault();
            fetchData(id);
          }}
        >
          <img src=${`https://archive.org/services/img/${id}`} height=50 width=75 />
          <span>${title}</span>
        </li>
      `)

      return html`
        <ul class="related-videos">
          <h4>Related Videos</h4>
          ${tiles}
        </ul>
      `
    })

    const ErrorMessage = hookable(() => html`<div style=${{
      display: errorMsg === '' ? "none" : "block",
      position: "absolute",
      width: 640,
      height: 200,
      marginTop: 135,
      backgroundColor: '#BBB'
    }} class="error-message">
      <div>${errorMsg}</div>
      <a onclick=${() => setErrorMsg("")}>close</a>
    </div>
    `);

    return html`
      <div class="video-player">
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
        ${ErrorMessage()}
        ${RelatedVideos()}
      </div>
    `
  })

  /* -------------  Callbacks ------------- */
  // function parseVideoLinks(items, identifier) {
  //   items.filter(item => PLAYABLE_FORMATS.has(item.format))
  //     .map(({name}) => new RegExp(`${identifier}\.\w+$`). )
  // }

  async function fetchMetadata(destination) {
    try {
      const resp = await fetch(`https://archive.org/metadata/${destination}`);
      const json = await resp.json();
      const {
        metadata: {
          mediatype,
          title,
          description,
          identifier,
          ...metaRest
        },
        reviews,
        files
      } = json;
      if (mediatype !== "movies") { throw "Not a video" }
      // parseVideoLinks(files, identifier);
      setTitle(title);
      setDescription(description);
      // setMetadataPairs(Object.entries(metaRest));
      setMetadataPairs([]);
    } catch (error) {
      setErrorMsg(`Oops. Apollonius couldn't find that video. Do you have the right identifier?`)
    }
  };

  async function fetchRelated(destination) {
    try {
      const resp = await fetch(`https://archive.org/mds/v1/get_related/all/${destination}`);
      const json = await resp.json();
      const {hits: {hits: items}} = json;
      const relVids = items
        .filter(({_source: {mediatype: [mediatype]}}) => mediatype === "movies")
        .map(({_id: id, _source: {title: [title], description: [description]}}) =>
          ({id, title, description})
        );
      setRelatedData(relVids);
    } catch (error) {
      console.log(error);
      setRelatedData([])
    }
  };

  async function fetchData(destination) {
    await Promise.all([fetchMetadata, fetchRelated].map(call => call(destination)));
    setIdentifier(destination);
    window.history.pushState({}, "", `?find=${destination}`);
    setErrorMsg('');
  }

  useEffect(() => {
    const findParam = new URLSearchParams(window.location.search).get("find");
    const startingPoint = findParam || "InformationM";
    if (!findParam) {
      window.history.replaceState({}, "", `?find=${startingPoint}`)
    }

    setIdentifier(startingPoint)
    fetchData(startingPoint)
  }, [])


  return html`
    <div class="app">
      ${Lookup()}
      ${VideoPlayer()}
      ${VideoDetails()}
    </div>
  `;

});

render(document.body, App);
