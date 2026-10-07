// Instagram handle (without @); leave empty to hide the link.
const INSTAGRAM = "yash_inprogress";
const GITHUB = "yaswanthkumarp21";
const OWNER = "Yash";

export function SiteFooter() {
  return (
    <footer className="pn-foot">
      <div className="pn-wrap pn-foot-in">
        <p>
          <b>Ops<em>Pulse</em></b> · built for the Operations and Supply Chain placement season
        </p>
        <p className="pn-foot-brand">
          © {new Date().getFullYear()} {OWNER}. Designed and made by {OWNER}. All rights reserved.
        </p>
        <p className="pn-foot-links">
          <a href={`https://github.com/${GITHUB}`} target="_blank" rel="noreferrer">GitHub</a>
          {INSTAGRAM ? <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer">Instagram</a> : null}
        </p>
      </div>
    </footer>
  );
}
