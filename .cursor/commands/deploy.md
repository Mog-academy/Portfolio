# deploy

Deploy this portfolio site to both Vercel and m-elgaili.com.

1. If there are uncommitted production changes, stage and commit them (src, public, api, package.json, package-lock.json, vercel.json only).
2. `git push origin main`
3. `npm run deploy`

Both steps are required. Push alone does not update m-elgaili.com.
