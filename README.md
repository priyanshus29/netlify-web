# Priyanshu Singh — Portfolio

A lightweight, static single-page portfolio for SAP BTP / CAPM development and SAP UI5 / Fiori consulting. The design uses an editorial dark-and-lime system, conceptual enterprise-flow visuals, case-study dialogs with a native-details fallback, project filters, a recruiter contact strip, explorable architecture layers, a scroll progress indicator and restrained pointer-responsive motion built with GSAP, ScrollTrigger, Motion, and native CSS. The portfolio itself is static; its optional AI chat uses either Netlify AI Gateway through the included Netlify Function or the included Cloudflare Worker. No secret API key is placed in the browser.

## Run locally

Requires Node.js 20 or newer and npm. Install the pinned dependencies once: `npm ci`.

```sh
npm ci            # install GSAP, Motion and the esbuild bundler
npm run dev       # builds and serves at http://localhost:3000
npm run build     # generates index.html from the content source
npm run check     # syntax and content checks (run build first)
npm test          # content and link-state checks (run build first)
```

The development server builds on startup. Re-run `npm run build` after editing content or adding assets; refresh the browser. `index.html` is generated; edit the source files instead.

## Edit content and projects

Edit `data/content.json`. The profile, five projects, roles, skills, certifications, training, education and languages are organized in separate fields. To edit project copy, change its fields and tags; to remove one, remove its object. Set each project’s `filter` to `implementation` or `support` for the interactive filters. Edit the `architecture` array to update the clickable application layers. The case study layouts use a visualization keyed by project `slug` in `scripts/build.mjs`. When adding a project, add a unique slug and a corresponding entry in the `visual()` mapping (or adapt that function with a fallback). Rebuild after changes. Project visuals are conceptual, not actual client screens. No project URLs or unverified outcomes are supplied.

Styles live in `public/style.css`, general interaction code in `public/site.js`, motion choreography in `src/motion.js`, and the static HTML template in `scripts/build.mjs`. The build uses esbuild to bundle GSAP, ScrollTrigger and Motion into `public/motion-bundle.js`; no CDN or runtime network dependency is needed. No frontend framework, remote fonts, or analytics are required. Netlify AI Gateway or Cloudflare Workers AI is required for live AI chat.

## Portrait and résumé

The user-provided portrait is installed as `public/images/portrait.png`. LinkedIn and Instagram denied access during implementation; no photo was taken from them. To replace the portrait, add an authentic image you have permission to publish as `public/images/portrait.jpg`, `.png`, or `.webp`, then rebuild. The build checks those extensions in that order, so remove any older file with a higher-priority extension. The portrait is displayed in a compact square frame with `object-fit: contain` so the full image stays visible. If no portrait file exists, the site uses a clearly labeled typographic placeholder. A résumé was supplied as text, not as an original PDF. `public/resume.pdf` is a newly formatted PDF derived from the supplied résumé data, not the original file. Replace it with your actual PDF if you prefer. The download is enabled when this file exists.

To replace the generated PDF, overwrite `public/resume.pdf` with your own PDF and rebuild. The build detects the file and shows a download link; if no file exists, it uses “Résumé on request” instead. Without it, the interface links to contact instead of a missing file. Never upload confidential or unapproved material. The optional script `scripts/generate_resume.py` uses the content module to generate the formatted copy and requires Python and `reportlab`; it is not part of the website build. Review the generated copy against your original résumé.

The professional details and project descriptions were updated from the user-provided résumé text. Review the text and obtain appropriate client disclosure approval before publishing. Dates, certifications and descriptions are editable in `data/content.json`. No photo, outcomes, project URLs, credential links or extra client data have been invented.

## Banner and project evidence

The personal banner supplied by Priyanshu is `public/images/personal-banner.webp`; its path and descriptive alt text are editable under `profile.banner` in `data/content.json`. It is displayed as supplied artwork, not as independent verification of the technologies shown within it. Replace the image and update its dimensions in the template if your new image has a different aspect ratio.

Project case studies open in accessible native dialogs when JavaScript is available; native expandable details remain usable without JavaScript. The diagrams are conceptual. No real client screenshots were supplied. To add an authentic screenshot that you are authorized to publish, use `public/images/projects/<project-slug>.webp` (or `.png`, `.jpg`, `.jpeg`) and rebuild. Set `screenshotAlt` in the project content for a meaningful description. See `public/images/projects/README.md` for details, including confidentiality guidance. Never publish client data or proprietary screens without permission.

The icons are lightweight inline SVGs. Motion animates the hero, case-study dialog and hover feedback; GSAP ScrollTrigger handles project reveals, the system flow, banner and timeline progress. Animations are disabled for reduced-motion preferences. Formspree is not installed because a contact service would require your own configuration. Existing email and LinkedIn links remain functional.

## Contact and deployment

Email uses `mailto:` and the copy button uses the Clipboard API, with visible feedback if copying is blocked. Clipboard access generally requires HTTPS or localhost. LinkedIn opens in a new tab with `noopener noreferrer`. There is no form or form service. If desired, integrate a real provider by replacing the contact action with its documented form endpoint and adding appropriate privacy and spam protection; do not commit secrets to this static site.

For a static deployment, run `npm run build` and publish the generated `deploy-site/` directory, which contains `index.html` and `public/`. The root `netlify.toml` sets the Netlify build command to `npm run build` and the publish directory to `deploy-site`. Commit that file to your connected repository and redeploy. If an existing `netlify.toml` specifies `dist`, change its `[build]` publish setting to `deploy-site`; file settings override Netlify UI settings. Netlify will deploy the included Netlify Function as well when deploying from the complete source repository; Netlify AI Gateway must be enabled as described below; no personal API key is required. A static-only drag-and-drop deploy cannot deploy the Function. Paths are relative so a subdirectory deployment works. No canonical domain is set because none was provided. `public/og.svg` is a local social preview; some social platforms require an absolute image URL and may not support SVG, so once a real domain is known, export it as a PNG and set an absolute `og:image` URL in `scripts/build.mjs` before rebuilding.

## AI portfolio assistant on Netlify

The chat sends questions to the same-origin `/api/chat` Netlify Function. It uses Netlify AI Gateway and a small `gpt-4o-mini` model; the Gateway automatically provides its runtime credentials. **Do not add your own OpenAI, Cloudflare or Netlify AI Gateway keys to the repository or browser.** The model uses the public résumé-based information in `data/content.json` and is instructed not to invent facts, but AI can still make mistakes. The phone number is deliberately excluded from its prompt. Questions and a short in-memory conversation history are sent via Netlify's AI Gateway to the model provider, so visitors should not share sensitive information. Review Netlify's and the model provider's privacy terms.

### Set up the Netlify option

1. Commit the **complete source project**, including `netlify/functions/chat.mjs`, `worker/index.mjs`, `data/content.json`, `netlify.toml`, `scripts/`, `src/`, `public/`, `package.json` and `package-lock.json`, to the repository connected to your Netlify site. A static-only Netlify Drop deploy does not deploy the function.
2. Verify that your team uses a **credit-based Free plan** and that Netlify AI Features / AI Gateway are enabled in the team's AI settings. Netlify enables this by default on eligible credit-based plans. No Cloudflare account, API token, or manually-created gateway credentials are required.
3. Trigger a new deployment. Visit `/api/chat` on your own website. `{"ready":true}` indicates the function can see the gateway configuration, but doesn't prove model availability or quota. Ask a question to test it end to end.
4. If unavailable, confirm that you deployed the new source (not an old version), AI Features are enabled for your team, and your plan is eligible and has remaining credits. The local `npm run dev` preview does not provide the gateway and displays a setup message.

Netlify's credit-based Free plan currently has 300 shared credits per month, with a hard limit and no automatic recharge. AI responses and normal site usage consume the same balance. **When the balance is exhausted, Netlify pauses all projects on the team until the next billing cycle or a plan upgrade**, not merely the chatbot. Monitor usage; free limits may change. An open public chatbot can be abused and exhaust credits; consider Netlify rate limits or bot protection. See https://docs.netlify.com/build/ai-gateway/overview/ and https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/.

### Alternative: Cloudflare Worker

The separate Cloudflare Worker remains available via `wrangler.jsonc`. To use it, sign in to your own Cloudflare account, keep the Workers Free plan, run `npm run build`, `npx wrangler login`, and `npx wrangler deploy`. Cloudflare Workers AI has a separate daily free allocation; model availability and limits may change. This alternative deploys the entire site to Cloudflare and does not require a Cloudflare API token in browser code.

### Tests

`npm test` runs mocked Worker and Netlify Function tests for validation, grounded prompt construction, token rotation and failure handling. It does not call a real AI model. The local preview shows an unavailable message until deployed to an eligible platform. A live AI response can only be verified after deployment to the user's account.
