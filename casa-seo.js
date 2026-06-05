/** Inject shared SEO / social meta when pages omit them */

const CASA_SITE = {
  name: 'Casa.co.uk',
  url: 'https://casarentals.github.io',
  description: 'Fee-free UK holiday rentals — browse stays, connect with hosts, and book direct with £0 booking fees.',
  image: 'favicon.svg',
};

function casaEnsureMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function casaEnsureLink(rel, href) {
  if (document.querySelector(`link[rel="${rel}"]`)) return;
  const el = document.createElement('link');
  el.rel = rel;
  el.href = href;
  document.head.appendChild(el);
}

function casaSeoInit() {
  const body = document.body;
  const title = document.title || CASA_SITE.name;
  const description = body.dataset.casaDescription || CASA_SITE.description;
  const pagePath = location.pathname.split('/').pop() || 'index.html';

  if (!document.querySelector('meta[name="viewport"]')) {
    casaEnsureMeta('name', 'viewport', 'width=device-width, initial-scale=1.0');
  }
  casaEnsureLink('icon', 'favicon.svg');
  casaEnsureMeta('name', 'description', description);
  casaEnsureMeta('property', 'og:title', title);
  casaEnsureMeta('property', 'og:description', description);
  casaEnsureMeta('property', 'og:type', 'website');
  casaEnsureMeta('property', 'og:url', `${CASA_SITE.url}/${pagePath}`);
  casaEnsureMeta('property', 'og:image', `${CASA_SITE.url}/${CASA_SITE.image}`);
  casaEnsureMeta('name', 'twitter:card', 'summary');
  casaEnsureMeta('name', 'twitter:title', title);
  casaEnsureMeta('name', 'twitter:description', description);
}

document.addEventListener('DOMContentLoaded', casaSeoInit);
