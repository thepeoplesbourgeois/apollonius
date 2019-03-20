import pixiedust, {render, html, useState} from 'neverland';

const Counter = pixiedust(() => {
  const [count, setCount] = useState(0);
  return html`
  <button onclick=${() => setCount(count + 1)}>
    Count: ${count}
  </button>`;
});

const Lookup = pixiedust(() => {
  const [location, setLocation] = useState("");
  const [metadata, setMetadata] = useState({});
  const fetchMetadata = async () => {
    const retrieved = await fetch(`https://archive.org/metadata/${location}`);

  }
  return html`
    <form onsubmit=${fetchMetadata}>
      <input />
    </form>
  `;
})

render(document.body, Counter);
