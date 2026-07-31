# ci-cd-toolkit

Reusable GitHub Actions composite actions for CI/CD: lint → test → build → vulnerability scan → push to registry → deploy. Applied here to three different app stacks (Node, Python, static HTML) to prove the toolkit is stack-agnostic, not a one-off pipeline.

## Why this exists

Most portfolio CI/CD projects are a single `.yml` file wired to a single app. This repo packages the pipeline logic as **standalone, reusable composite actions** (`.github/actions/`) that any repo — not just this one — can pull in with a single `uses:` line. The three `examples/` apps exist only to prove the actions work across different languages and app types.

## Architecture

```mermaid
flowchart LR
    A[git push] --> B[Lint & Test<br/>composite action]
    B --> C[Docker Build]
    C --> D[Trivy Scan<br/>fail on HIGH/CRITICAL]
    D -->|pass| E[Push to GHCR]
    D -->|fail| X[Pipeline stops]
    E --> F[Deploy hook<br/>optional]
```

## Repo layout

```
.github/
  actions/
    lint-and-test/              # generic lint+test wrapper, any language
    docker-build-scan-push/     # build -> Trivy scan -> push, reusable across repos
  workflows/
    node-api.yml                # calls both actions for the Node example
    python-api.yml              # calls both actions for the Python example
    static-site.yml              # calls build-scan-push only (no app logic to test)
examples/
  node-api/       # Express + Jest + ESLint
  python-api/      # Flask + pytest + flake8
  static-site/     # plain HTML behind nginx
```

## Using the actions in another repo

Because these are composite actions, any other repo can reference them directly without copy-pasting YAML:

```yaml
- uses: MakniAmin/ci-cd-toolkit/.github/actions/docker-build-scan-push@main
  with:
    image-name: your-org/your-app
    context: .
    registry-username: ${{ github.actor }}
    registry-password: ${{ secrets.GITHUB_TOKEN }}
```

That's the whole pitch: write the security-scanned build/push pipeline once, reuse it everywhere.

## Setup

1. Push this repo to GitHub as `ci-cd-toolkit`.
2. GHCR push works out of the box using the automatic `GITHUB_TOKEN` — no extra secrets needed for build/scan/push.
3. Confirm package visibility: Settings → Packages, or make the GHCR package public so the pushed images are viewable without auth (nice for a portfolio link).
4. **Deploy step is optional and off by default.** To enable it:
   - Set the repo variable `DEPLOY_ENABLED=true` (Settings → Secrets and variables → Actions → Variables).
   - Add a secret per app (`NODE_API_DEPLOY_HOOK`, `PYTHON_API_DEPLOY_HOOK`, `STATIC_SITE_DEPLOY_HOOK`) pointing to any provider's HTTP deploy webhook — Render, Railway, Fly.io, or a webhook on your own VPS that does `docker pull && restart`. Whichever you use, check its current free-tier terms yourself since those change often.
5. Push a change under `examples/node-api/` (or python-api, or static-site) and watch the matching workflow run end to end.

## Proving the security gate actually works

For the portfolio write-up, deliberately pin an old base image (e.g. `node:18.0-alpine` instead of `node:20-alpine`) in one Dockerfile, push, and screenshot the Trivy step failing the build. Then fix the base image and screenshot it going green. That before/after is a better interview story than a pipeline that only ever shows green.

## What each piece demonstrates

- **`lint-and-test` composite action** — CI fundamentals, language-agnostic design
- **`docker-build-scan-push` composite action** — containerization, Trivy/DevSecOps, GHCR
- **Three example apps** — proves reusability, not a one-off script
- **Deploy hook gate via repo variable** — conditional jobs, environment-based control
- **Mermaid architecture diagram in README** — communicates the pipeline at a glance to a recruiter skimming GitHub

## License

MIT
