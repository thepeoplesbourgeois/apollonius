import pixiedust, {render, html, useState} from 'neverland';

// const [metadata, setMetadata] = useState(async () => {
//   const resp = await fetch(`https://archive.org/metadata/${identifier}`);
//   const json = await resp.json();
//   console.log(json);
//   return json;
// });
// async function fetchMetadata(event) {
//   event.preventDefault();
//   const requests = await Promise.all([
//     ,
//
//   ]);
//   const [video, related] = await Promise.all(requests);
//   setMetadata({video, related})
// };

const Lookup = pixiedust(() => {
  const [destination, setDestination] = useState("youtube-yBG10jlo9X0");
  const [identifier, setIdentifier] = useState(destination);

  async function fetchMetadata() {
    setIdentifier(destination);
    const vr = fetch(`https://archive.org/metadata/${identifier}`);
    const rr = fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${identifier}`);
    const videoReq = await vr;
    const relatedReq = await rr;
    const data = await Promise.all([videoReq.json(), relatedReq.json()]);
    console.log(data);
    // TODO: Implement the related video selector and the metadata views
  }

  return html`
    <div>
      <div>
        <form onsubmit=${(event) => {event.preventDefault(); fetchMetadata()}}>
          I want to see archive.org/details/<input type="text" placeholder=${identifier} onchange=${({currentTarget: {value}}) => setDestination(value)} />
        </form>
      </div>
      <iframe
        src=${`https://archive.org/embed/${identifier}`}
        width="640"
        height="480"
        frameborder="0"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        allowfullscreen></iframe>

    </div>
  `;
});

render(document.body, Lookup);
