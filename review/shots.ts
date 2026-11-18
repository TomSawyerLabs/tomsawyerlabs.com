// The photo shot list for the site, walked through on a phone at /__shots
// (review/shots-page.html, served by review/plugin.ts on the dev server).
// Edit this list to change what the page asks for. Photos taken against it
// are recorded in review/shots.json (gitignored); `bun run shots` lists them.

export type Shot = {
  /** Stable id: photos are filed against it. Never reuse one. */
  id: string;
  /** Project slug (app/content/projects.ts), or "home" for the home page. */
  project: string;
  /** What to shoot. */
  title: string;
  /** Where it's taken, so the walk-through groups nearby shots. */
  where: string;
  /** The project's lead photo. */
  lead?: boolean;
  /** Can go without. */
  optional?: boolean;
  /** Someone in particular has these (from past events). */
  who?: string;
};

/** The order the walk-through visits places in. */
export const PLACES = [
  "Shop floor",
  "Electronics bench",
  "Practice field",
  "Print farm",
  "From the archive",
] as const;

export const SHOTS: Shot[] = [
  // Home page
  {
    id: "home-field",
    project: "home",
    title: "The practice field, wide, from a corner, with robots on it",
    where: "Practice field",
    lead: true,
  },
  {
    id: "home-shop",
    project: "home",
    title: "People working in the shop together",
    where: "Shop floor",
  },
  {
    id: "home-team",
    project: "home",
    title: "A team at the field: drive team and robot",
    where: "Practice field",
    optional: true,
  },

  // Shop and community
  {
    id: "field-overhead",
    project: "practice-field",
    title: "The whole field, from overhead or a high corner",
    where: "Practice field",
    lead: true,
  },
  {
    id: "field-match",
    project: "practice-field",
    title: "A match running, robots mid-play",
    where: "Practice field",
  },
  {
    id: "pfms-station",
    project: "pfms",
    title: "The field-side station: laptop, stack lights, driver stations",
    where: "Practice field",
    lead: true,
  },
  {
    id: "pfms-plugin",
    project: "pfms",
    title: "A team plugging in their robot",
    where: "Practice field",
  },
  {
    id: "bins-shelf",
    project: "bins",
    title: "A shelf of bins with QR stickers",
    where: "Shop floor",
    lead: true,
  },
  {
    id: "bins-scan",
    project: "bins",
    title: "A hand scanning a bin with a phone",
    where: "Shop floor",
  },
  {
    id: "punchlist-job",
    project: "punchlist",
    title: "A job from the list being done: someone fixing something",
    where: "Shop floor",
    lead: true,
  },

  // Embedded testing
  {
    id: "mcu-hil-board",
    project: "mcu-hil",
    title: "A Raspberry Pi board wired to a target microcontroller",
    where: "Electronics bench",
    lead: true,
  },
  {
    id: "mcu-hil-rigs",
    project: "mcu-hil",
    title: "Several rigs together on the bench",
    where: "Electronics bench",
  },
  {
    id: "hil-runner-rack",
    project: "hil-runner",
    title: "The runners on their rack or shelf, network cables visible",
    where: "Electronics bench",
    lead: true,
  },
  {
    id: "benchbob-bench",
    project: "benchbob",
    title: "A bench with instruments plugged into the server",
    where: "Electronics bench",
    lead: true,
  },

  // Lab and EDA tools
  {
    id: "loupecam-scope",
    project: "loupecam",
    title: "The microscope with its AmScope or ToupTek camera",
    where: "Electronics bench",
    lead: true,
  },
  {
    id: "loupecam-board",
    project: "loupecam",
    title: "A board under the scope (a real image from the app works too)",
    where: "Electronics bench",
  },
  {
    id: "hotpi-oven",
    project: "hotpi",
    title: "The T-962 reflow oven with the Pi controller attached",
    where: "Electronics bench",
    lead: true,
  },
  {
    id: "hotpi-board",
    project: "hotpi",
    title: "A freshly reflowed board on the tray",
    where: "Electronics bench",
  },

  // Fabrication
  {
    id: "farmslicer-farm",
    project: "farmslicer",
    title: "The print farm, several printers running",
    where: "Print farm",
    lead: true,
  },
  {
    id: "farmslicer-plate",
    project: "farmslicer",
    title: "A plate of finished parts",
    where: "Print farm",
  },

  // Windows and desktop
  {
    id: "open-fan-hardware",
    project: "open-fan",
    title: "The fans and hardware OpenFan controls",
    where: "Electronics bench",
    optional: true,
  },

  // On the playa (past events)
  {
    id: "hyparhuts-up",
    project: "hyparhuts",
    title: "A hut set up on the playa, with people for scale",
    where: "From the archive",
    lead: true,
  },
  {
    id: "hyparhuts-setup",
    project: "hyparhuts",
    title: "A hut folded flat, then mid-setup",
    where: "From the archive",
  },
  {
    id: "hyparhuts-inside",
    project: "hyparhuts",
    title: "Inside a hut",
    where: "From the archive",
  },
  {
    id: "cupcake-trikes",
    project: "cupcake-trikes",
    title: "A cupcake trike on the playa, ideally being ridden",
    where: "From the archive",
    who: "Chris",
  },
  {
    id: "bumper-cars",
    project: "playa-bumper-cars",
    title: "Bumper cars mid-bump",
    where: "From the archive",
    who: "Chris",
  },
  {
    id: "hyparshade",
    project: "hyparshade",
    title: "HyparShade set up",
    where: "From the archive",
    optional: true,
  },

  // Cards
  {
    id: "print-template",
    project: "print-template",
    title: "An envelope printed true-to-size",
    where: "Shop floor",
    optional: true,
  },
  {
    id: "avrload",
    project: "avrload",
    title: "A board being flashed with avrload",
    where: "Electronics bench",
    optional: true,
  },
  {
    id: "saleae",
    project: "saleae-quadrature",
    title: "A logic analyzer clipped onto a motor or encoder",
    where: "Electronics bench",
    optional: true,
  },
];
