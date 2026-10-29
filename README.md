# kafesimu.

A static Three.js coffee simulator with local pinned Three.js 0.180.0. No backend, accounts, persistence or public API calls.

## Run

Open the standalone HTML in a WebGL-capable browser, or run `npm start` for http://127.0.0.1:4173. Node 22.15+ is required for the regression suite (`npm test`). `node scripts/standalone.mjs /absolute/output.html` embeds every module and the garden image in one downloadable file.

## Project files

- `dist/`: ready-to-host website, including local Three.js, artwork and geometry.
- `assets/cafe-tumbler.blend`: editable Blender glass and espresso cup.
- `scripts/model-glass.py`: rebuild the glassware with Blender.
- `scripts/standalone.mjs`: generate a single-file offline version.
- `tests/`: simulation, interaction, geometry and camera regression tests.
- `server.js`: dependency-free local preview server.

No installation or build is needed to preview the site. From this folder:

```sh
npm start
npm test
npm run build:standalone
```

The final command writes `kafesimu.html` in this folder. Open that file directly, or serve `dist/` through a static web server. The modular `dist/index.html` needs HTTP; use `npm start` instead of double-clicking it.

## Push to GitHub

Create an empty repository called `kafesimu` on your GitHub account. Extract the source ZIP, open a terminal inside the extracted `kafesimu` folder, then run:

```sh
git init -b main
git add .
git commit -m "Initial kafesimu release"
git remote add origin https://github.com/YOUR_USERNAME/kafesimu.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Sign in through Git's normal authentication prompt when asked. The ZIP contains no Git history, account credentials or Sites project configuration.

## Hosting

Publish the contents of `dist/` to any static host; there is no build command or backend. Keep its subfolders intact. All module and asset paths are relative, so repository subpaths work. The included `.github/workflows/pages.yml` tests and deploys `dist/` on each push to `main`. Enable GitHub Pages with **GitHub Actions** as the publishing source in the repository Settings → Pages.

## Make a drink

1. Place the portafilter under the grinder and hold the lever to grind 18 g. The filled basket returns to its preparation position automatically.
2. Follow the translucent tamper demonstration: drag the wooden-handled tamper onto the grounds and release to press, then insert the basket into the group head.
3. Put the small cup under the spouts, then tap the brew lever for a 36 ml shot.
4. Carry the loaded ice scoop to the glass. The finite bucket supplies ten cubes in total: four, four, then two. It stays empty until New drink or reset.
5. Bring milk or espresso near the glass rim and release to pour automatically. Pick up the vessel to pause; move sideways to place it freely.
6. Optionally scoop sugar from the bowl in front of the machine and tip it over the glass. Repeat for more sweetness; the final spoonful uses only the remaining capacity. A full glass always accepts the spoon for stirring. Stir by dragging left and right while holding the spoon. Each direction mixes equally; releasing pauses. Pull down to lift the spoon out and return it to the sugar bowl.
7. Place the glass on the coaster. The drink, ice, sugar and mixing stay intact. **New drink** explicitly clears the glass and restocks ingredients; reset restarts the entire session. Preparing more espresso shots remains available.

Missed drops stay on the counter. Completed tools return home. The sugar bowl is fixed clear of the machine. The guidance panel displays one short action above a separate status footer. Keyboard equivalents are available with Tab; Enter performs placements and automatic pours, Space grinds, Down performs partial pours or adds sugar, and Left/Right stir. Escape cancels the active gesture. Audio starts muted. Reduced motion removes camera travel. Backgrounding pauses operations.

## Simulation

`ice-physics.js` uses fixed 1/120-second steps, gravity, buoyancy, damping, iterative contacts and resting sleep. Ice only wakes when stirred, moved or disturbed by changing liquid/ice quantities. There is no time-driven bobbing. This is a lightweight rigid-particle approximation, not a full rigid-body or fluid solver.

`simulation.js` tracks conserved ingredient quantities, attachments, finite ice inventory, repeatable extraction, mixing and explicit serving/new-drink actions. `interaction.js` handles pointer gestures; `guidance.js` and `camera.js` derive guidance and framing from actual state. `scene.js` renders the equipment and drink. Milk and espresso remain layered until stirred. Liquid animation is driven by spoon angle, never elapsed time; pouring and sugar additions do not spin the drink. Glass bottom bounds determine supported placement, and picking or docking cancels stale return animations. Capacity includes ice displacement; any displaced liquid is tracked in an overflow reservoir.

## Assets and validation

The editable glass is `assets/cafe-tumbler.blend`; `scripts/model-glass.py` exports the clear, unlabelled POKAL tumbler and glossy rounded espresso cup geometry for Three.js using Blender 5.2.3 LTS. The garden is an original generated background plate. Equipment and drink interactions are live Three.js geometry.

Automated checks cover conservation, finite stock, brewing, cancellation, reset, sugar clearance, coaster preservation, explicit new drinks, resting ice stability, buoyancy, stirring and 30/60 fps consistency. Real Three.js geometry/raycast tests complete the recipe at desktop and phone sizes. Browser pointer checks validate the visible UI; these do not measure native touch hardware or mobile GPU performance.

- Generated image: dist/assets/cafe-garden.png, built-in image-generation tool. Prompt: “Completely defocused sunlit garden seen from a quiet café terrace, olive and fresh green foliage, soft creamy golden circular bokeh, warm late-afternoon sunlight from upper left; wide photographic background plate, no foreground objects, table, glasses, coffee, people, buildings, text or logos.”

## Third-party notices

Three.js 0.180.0 and its bundled addons are distributed under the MIT license; the complete notice is in `dist/vendor/THREE-LICENSE.txt`. Preserve it when redistributing the project.
