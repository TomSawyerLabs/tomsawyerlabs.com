// Everything the site says about our projects. The home page lists them by
// category; every project with `page: true` also gets its own page at /<slug>.
//
// Rules for this file (from Cameron and Chris):
// - Bubble Blade is not public: no name, mechanism or details, ever.
// - Name a client only when its patent lists Chris or Cameron.

export type CategoryId =
  | "shop"
  | "testing"
  | "lab"
  | "fab"
  | "selfhost"
  | "devtools"
  | "desktop"
  | "business"
  | "ai"
  | "libs";

export type Category = {
  id: CategoryId;
  name: string;
  /** One sentence under the category heading. */
  blurb: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "shop",
    name: "Shop & community",
    blurb:
      "Running a shared space: the practice field, who's allowed on the tools, and what needs doing.",
  },
  {
    id: "testing",
    name: "Embedded testing",
    blurb:
      "Hardware-in-the-loop: real microcontrollers, flashed and exercised by CI on every push.",
  },
  {
    id: "lab",
    name: "Lab & EDA tools",
    blurb: "Getting data out of the instruments and file formats on the bench.",
  },
  {
    id: "fab",
    name: "Fabrication",
    blurb: "Printing, cutting and building things.",
  },
  {
    id: "selfhost",
    name: "Self-hosting",
    blurb: "Small, sharp services for running your own infrastructure.",
  },
  {
    id: "devtools",
    name: "Developer tools",
    blurb: "Keeping builds, test runs and CI bills under control.",
  },
  {
    id: "desktop",
    name: "Windows & desktop",
    blurb: "Tools that make a workstation nicer to live in.",
  },
  {
    id: "business",
    name: "Small business",
    blurb: "Books and hours for small teams, without the subscription.",
  },
  {
    id: "ai",
    name: "AI tooling",
    blurb: "Working alongside coding agents.",
  },
  {
    id: "libs",
    name: "Libraries",
    blurb: "Pieces other projects are built from.",
  },
];

export type Link = { label: string; href: string };

export type Project = {
  slug: string;
  name: string;
  category: CategoryId;
  /** "owner/name" on GitHub. */
  repo?: string;
  /** One line, shown on cards. */
  tagline: string;
  /** Two or three sentences, shown at the top of the project's page. */
  summary: string;
  features: string[];
  stack: string[];
  license?: string;
  links: Link[];
  /** Gets its own page at /<slug>. Small pieces are listed only. */
  page: boolean;
  /** The README says it's early: shown as a label. */
  early?: boolean;
  /** Shown larger on the home page. */
  featured?: boolean;
  /** Short facts shown beside the summary, such as where and who. */
  facts?: { label: string; value: string }[];
};

// Drafted from each repo's README and GitHub metadata (2026-11-15). Keep
// the claims to what the repo itself says.
export const PROJECTS: Project[] = [
  {
    slug: "practice-field",
    name: "The practice field",
    category: "shop",
    tagline:
      "A full FRC practice field in East Palo Alto, shared by Bay Area FIRST teams",
    summary:
      "A full-size FIRST Robotics Competition practice field in East Palo Alto, California. About 20 Bay Area FRC teams book time on it and drive real matches. It runs on pFMS, so teams bring their robot exactly as it is set up at home.",
    features: [
      "Full FRC field, booked by teams in time slots",
      "Real matches with official timing, E-Stop and A-Stop",
      "No radio reprogramming: robots join as configured at home",
      "Scoring and a scoreboard driven by pFMS",
      "Used by about 20 Bay Area FRC teams",
    ],
    stack: ["pFMS", "VH-113 field radio"],
    links: [
      {
        label: "pFMS on GitHub",
        href: "https://github.com/TomSawyerLabs/practice-field-management-system",
      },
    ],
    page: true,
    featured: true,
    facts: [
      {
        label: "Where",
        value: "East Palo Alto, CA",
      },
      {
        label: "Serves",
        value: "≈20 Bay Area FRC teams",
      },
    ],
  },
  {
    slug: "pfms",
    name: "pFMS",
    category: "shop",
    repo: "TomSawyerLabs/practice-field-management-system",
    tagline:
      "A field management system for FRC practice fields. Bring your robot as it is.",
    summary:
      "pFMS runs an FRC practice field from a web browser. A team enters the SSID and WPA key its robot already uses, once, and the field radio serves that network, so there is no radio reprogramming and no kiosk. Laptops stay on the site Wi-Fi with internet, and Driver Station, code deploys and mDNS names all work as they do at home.",
    features: [
      "Self-service matches with official timing, hold-to-start, E-Stop and A-Stop",
      "Stops pressed while offline wait, then go out on reconnect; e-stops survive a restart",
      "Scoring API for goal sensors and referee tablets, plus a TV scoreboard",
      "Swappable game layers per season, and speed challenges and relay races",
      "Practice and match video for each team, and a daily field timelapse",
      "Laptop to robot routing across team VLANs, with multiple robots per team",
    ],
    stack: [
      "TypeScript",
      "Bun",
      "Linux (iptables, dnsmasq)",
      "Vivid-Hosting VH-113 / VH-109 field AP",
    ],
    license: "ISC",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/TomSawyerLabs/practice-field-management-system",
      },
      {
        label: "Releases",
        href: "https://github.com/TomSawyerLabs/practice-field-management-system/releases",
      },
    ],
    page: true,
  },
  {
    slug: "clearance",
    name: "Clearance",
    category: "shop",
    repo: "TomSawyerLabs/clearance",
    tagline: "Liability releases and training sign-offs, signed with passkeys",
    summary:
      "Clearance records who is cleared to do what. People sign documents such as a liability release with a passkey, and the people who run a group see who has signed and who has not. It was built for a robotics maker space where students need a parent's signature, but nothing in it is specific to that.",
    features: [
      "Passkey-only accounts, created from invitation links",
      "Each sign-off is a passkey signature over the exact record, verifiable without the app",
      "Parent and guardian accounts that can sign for a child, until the child comes of age",
      "Mentor-signed certifications for training",
      "Versioned Markdown documents with inline questions and organization variables",
      "Runs as one binary with SQLite, in Docker with Postgres, or on Cloudflare Workers with D1",
    ],
    stack: ["TypeScript", "Bun", "React", "SQLite / Postgres / Cloudflare D1"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/TomSawyerLabs/clearance",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "punchlist",
    name: "Punchlist",
    category: "shop",
    repo: "cinderblock/punchlist",
    tagline: "A shared to-do list of physical jobs for a real space",
    summary:
      "Punchlist is a shared list of physical jobs for a workshop, lab or clubhouse. It belongs to the space, not to anyone's phone: anyone on site can see what needs doing and tick it off. People who sign in can do it from anywhere, keep private items and get reminders, and AI agents can read and write tasks under their own names.",
    features: [
      "Phone-first, installable, and check-offs made with no signal sync later",
      "Passkey sign-in, plus an optional no-account tier for people on site",
      "Floor-plan map with zones, so a task has a place to walk to",
      "Repeating tasks by schedule or by interval after completion",
      "Web Push reminders and calendar feeds",
      "REST API and MCP server for agents and monitoring integrations",
    ],
    stack: ["TypeScript", "Bun", "React Router", "Mantine", "SQLite", "MCP"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/punchlist",
      },
    ],
    page: true,
  },
  {
    slug: "bins",
    name: "bins",
    category: "shop",
    repo: "cinderblock/bins",
    tagline:
      "Scan a QR sticker on a storage bin, see what's inside, snap a photo, move on",
    summary:
      "bins is an offline-first web app for tracking what is in a group's storage boxes. Every box gets a QR sticker; scanning it opens that box's page with its latest contents photo, notes and location. It is built for clubs, hackerspaces and event crews, and works in basements and storage units with no signal.",
    features: [
      "Scanning a sticker is the login; no accounts to manage",
      "Full offline replica on each device, synced when back online",
      "Fuzzy search for which box holds a thing, offline",
      "Shelves, bays and floor plans to find boxes by location",
      "Sticker printing in-app, including to AirPrint label printers",
      "Optional AI help to describe photos and suggest where a thing should go",
    ],
    stack: ["TypeScript", "PWA", "IndexedDB"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/bins",
      },
    ],
    page: true,
  },
  {
    slug: "mcu-hil",
    name: "mcu-hil",
    category: "testing",
    repo: "TomSawyerLabs/mcu-hil",
    tagline:
      "Raspberry Pi boards that power, program and test real microcontrollers",
    summary:
      "mcu-hil is a family of hardware-in-the-loop boards. A Raspberry Pi powers, programs, clocks, resets and talks to the microcontroller on the board, so software tests run against real silicon in a repeatable way. AVRs come first, starting with the ATmega16U2.",
    features: [
      "Compute Module 4/5 carrier in the same 55 x 40 mm outline, so they stack",
      "Pi HAT variant for standard 40-pin Raspberry Pis",
      "Shared schematic sheets and one GPIO map across variants",
      "Every part has an LCSC number, for fully assembled boards from JLCPCB",
      "Schematics generated from a Python design script",
    ],
    stack: ["KiCad 10", "Python", "Raspberry Pi CM4/CM5", "AVR"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/TomSawyerLabs/mcu-hil",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "hil-runner",
    name: "hil-runner",
    category: "testing",
    repo: "TomSawyerLabs/hil-runner",
    tagline:
      "Diskless, one-job GitHub Actions runners for hardware-in-the-loop tests",
    summary:
      "hil-runner turns a Raspberry Pi with a test board into a GitHub Actions runner that takes one job and then reboots clean. The Pi netboots from BootBob and runs entirely from RAM, so nothing a job does survives. It runs the dfu-programmer project's tests against a real ATmega8U2.",
    features: [
      "Every job gets a freshly netbooted machine with no disk",
      "OS image is public and holds no secrets",
      "Small broker hands out one-job runner configs through a GitHub App",
      "Each job power-cycles the target AVR into its bootloader first",
      "Hardware write-protect on boot and ID EEPROMs, kernel holds the ID lines",
    ],
    stack: [
      "Debian arm64",
      "Raspberry Pi 4",
      "TypeScript",
      "Bun",
      "GitHub Actions",
      "BootBob",
    ],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/TomSawyerLabs/hil-runner",
      },
    ],
    page: true,
  },
  {
    slug: "bootbob",
    name: "BootBob",
    category: "testing",
    repo: "cinderblock/BootBob",
    tagline: "A network boot server with a web UI. No DHCP server needed.",
    summary:
      "BootBob netboots PCs and Raspberry Pis and shows every machine in a web UI as it arrives. Machines wait at a menu and can be pointed at an image from the browser, with nobody at the keyboard. It listens to DHCP but never answers it, so it fits next to an existing router.",
    features: [
      "One boot file name for BIOS, UEFI x86-64 and UEFI arm64",
      "Raspberry Pi 4 and 5 netboot natively, including root over NBD",
      "Serves several networks and VLANs, admitting machines per interface",
      "Fallback menu with netboot.xyz built in",
      "Catalogue of upstream images, fetched and verified on first use",
    ],
    stack: ["Rust", "iPXE", "TFTP", "NBD"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/BootBob",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "benchbob",
    name: "BenchBob",
    category: "testing",
    repo: "cinderblock/BenchBob",
    tagline:
      "A bench server for the hardware plugged into it, from a browser, script or agent",
    summary:
      "BenchBob runs on a Raspberry Pi or any Linux box and puts the devices plugged into it on the LAN. Drives, serial ports, CAN, I2C, GPIO, debug probes and more each get a panel in a web dashboard, a REST endpoint and MCP tools. It has no login, so it is meant for a trusted bench network.",
    features: [
      "Drives: auto-mount, NFS/NBD/SMB sharing, erase, and Raspberry Pi OS flashing",
      "Serial terminal with network bridges and esptool/avrdude flashing",
      "CAN, I2C, 1-Wire, GPIO, LED strips, IR, BLE, cameras, SDR, GPS and UPS panels",
      "Debug probes (ST-Link, J-Link, CMSIS-DAP) with an OpenOCD GDB server each",
      "USB per-port power and USB/IP sharing",
      "Everything is a REST endpoint; peripheral actions are MCP tools",
    ],
    stack: ["Rust", "Linux", "Raspberry Pi", "MCP"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/BenchBob",
      },
      {
        label: "Releases",
        href: "https://github.com/cinderblock/BenchBob/releases",
      },
      {
        label: "Site",
        href: "https://cinderblock.github.io/BenchBob/",
      },
    ],
    page: true,
  },
  {
    slug: "avrload",
    name: "avrload",
    category: "testing",
    repo: "cinderblock/avrload",
    tagline:
      "Prepare AVR flash images and program them over RS-485 from JavaScript",
    summary:
      "avrload loads an Intel HEX file into a flash buffer sized for a given AVR, appends a CRC, and programs it over serial using the DanceBoot RS-485 bootloader protocol. The two halves work together or on their own.",
    features: [
      "Flash buffer prep from .hex with a CRC16-Modbus trailer",
      "Page-by-page programmer over any serial-like stream",
      "Skips writing blank pages",
      "Built-in definitions for common AVRs, or pass your own",
    ],
    stack: ["TypeScript", "Node.js"],
    license: "ISC",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/avrload",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/avrload",
      },
    ],
    page: false,
  },
  {
    slug: "avr",
    name: "AVR++",
    category: "testing",
    repo: "cinderblock/AVR",
    tagline:
      "A C++ library for AVR hardware: pins, USART, SPI, ADC, WS2812 and DShot",
    summary:
      "AVR++ is a C++ library for 8-bit AVR peripherals that aims to compile down to single instructions where it can. It covers I/O pins, serial, SPI, ADC, the watchdog, and bit-banged protocols such as WS2812 LEDs and DShot for brushless ESCs.",
    features: [
      "Compile-time IOpin types with one-instruction set, clear and toggle",
      "Output, weak-output and open-drain pin helpers",
      "Bit-banged WS2812 and DShot, including bidirectional DShot telemetry",
      "Interrupt-safe atomic wrappers",
    ],
    stack: ["C++", "AVR"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/AVR",
      },
    ],
    page: false,
    early: true,
  },
  {
    slug: "umaker",
    name: "µMaker",
    category: "testing",
    repo: "cinderblock/uMaker",
    tagline: "Composable Makefiles for embedded C and C++ projects",
    summary:
      "µMaker is a set of Makefile modules for embedded projects. A project's Makefile includes only the modules it needs, such as the core build, FreeRTOS or an Arduino core.",
    features: [
      "Core build to .elf and .hex",
      "FreeRTOS module that copies the right port files",
      "Arduino AVR core support",
      "Assembly output for inspecting compiled code",
    ],
    stack: ["Make", "GCC"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/uMaker",
      },
    ],
    page: false,
  },
  {
    slug: "usb-dfu",
    name: "usb-dfu",
    category: "testing",
    repo: "cinderblock/usb-dfu",
    tagline: "A fork of LUFA's USB DFU bootloader",
    summary:
      "A fork of the LUFA project's USB DFU bootloader for AVR microcontrollers.",
    features: [],
    stack: ["C", "LUFA", "AVR"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/usb-dfu",
      },
    ],
    page: false,
  },
  {
    slug: "saleae-pwm",
    name: "PWM Duty Cycle analyzer",
    category: "testing",
    repo: "cinderblock/saleae-pwm-duty-cycle-analyzer",
    tagline:
      "Live PWM duty cycle and frequency in Saleae Logic 2, readable when zoomed out",
    summary:
      "A Saleae Logic 2 analyzer that measures a PWM signal live as you capture. It reports duty cycle, frequency, period and pulse widths, and starts a new result only when the averaged value changes, so a long capture stays readable zoomed out.",
    features: [
      "Duty, frequency, period, pulse and gap widths",
      "Results that span each stretch of steady value",
      "Reports stuck-high and stuck-low when pulses stop",
      "Merges one-sample switching spikes back into the real period",
      "Data table columns and CSV export",
    ],
    stack: ["C++", "Saleae Analyzer SDK"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/saleae-pwm-duty-cycle-analyzer",
      },
    ],
    page: false,
  },
  {
    slug: "saleae-quadrature",
    name: "Quadrature Encoder analyzer",
    category: "testing",
    repo: "cinderblock/saleae-quadrature-analyzer",
    tagline:
      "Live quadrature encoder decoding in Saleae Logic 2, with index and skipped-state checks",
    summary:
      "A Saleae Logic 2 analyzer that decodes an incremental quadrature encoder live as you capture. It takes A, B and an optional Z index, and reports count, position, direction and speed.",
    features: [
      "X4, X2 and X1 decoding, exact when the shaft dithers on an edge",
      "Index pulses in mark or reset mode",
      "Flags skipped states instead of guessing direction",
      "Moves-and-holds mode to read fast motion zoomed out",
    ],
    stack: ["C++", "Saleae Analyzer SDK"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/saleae-quadrature-analyzer",
      },
    ],
    page: false,
  },
  {
    slug: "saleae-stepper",
    name: "Stepper Motor Coils analyzer",
    category: "testing",
    repo: "cinderblock/saleae-stepper-analyzer",
    tagline:
      "Live stepper motor position in Saleae Logic 2 from the four coil drive signals",
    summary:
      "A Saleae Logic 2 analyzer that watches the four drive signals of a bipolar stepper and shows the position the motor is being driven to. One algorithm covers wave, full and half stepping and PWM microstepping.",
    features: [
      "Position in steps, degrees or revolutions, plus electrical angle",
      "Detects the PWM frequency automatically",
      "Resumes position after de-energized gaps",
      "Moves-and-holds mode for readable long captures",
    ],
    stack: ["C++", "Saleae Analyzer SDK"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/saleae-stepper-analyzer",
      },
    ],
    page: false,
  },
  {
    slug: "ew-decoder",
    name: "Electronics Workbench Decoder",
    category: "lab",
    repo: "cinderblock/electronics-workbench-decoder",
    tagline:
      "Read and write NI Multisim and Ultiboard files without NI's software",
    summary:
      "A decoder and encoder for the proprietary Electronics Workbench formats used by NI Multisim and Ultiboard. It gets designs and part databases out into JSON and XML, and back where the format allows. It is the reading layer under multisim2kicad.",
    features: [
      "ewd CLI: decode .ms1x, .ewprj, .ewnet and part databases by magic bytes",
      "ewe CLI: re-encode compressed XML so Multisim opens it again",
      "Byte-identical round trips across a 592-design test corpus",
      "Fast, dependency-free parser for EW's XML dialect",
    ],
    stack: ["TypeScript", "Node.js"],
    license: "ISC",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/electronics-workbench-decoder",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/electronics-workbench-decoder",
      },
    ],
    page: true,
  },
  {
    slug: "multisim2kicad",
    name: "multisim2kicad",
    category: "lab",
    repo: "cinderblock/multisim2kicad",
    tagline: "Convert NI Multisim schematics and Ultiboard PCBs to KiCad",
    summary:
      "multisim2kicad converts Multisim schematics, Ultiboard boards and component databases into KiCad projects. A schematic and board with the same name become one linked KiCad project, and the converted schematic still simulates in KiCad.",
    features: [
      "Schematics with sheet hierarchy, real part graphics, buses and net names",
      "PCBs with copper stack, pads, vias, zones, footprints and silkscreen",
      "Design rules carried into KiCad net classes",
      "Project symbol and footprint libraries generated alongside",
      "SPICE models carried over for KiCad's ngspice simulator",
    ],
    stack: ["TypeScript", "Node.js / Bun", "KiCad"],
    license: "ISC",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/multisim2kicad",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/multisim2kicad",
      },
    ],
    page: true,
  },
  {
    slug: "loupecam",
    name: "LoupeCam",
    category: "lab",
    repo: "cinderblock/loupecam",
    tagline:
      "An open driver and app for AmScope and ToupTek USB3 microscope cameras",
    summary:
      "LoupeCam talks to AmScope and ToupTek USB3 microscope cameras directly over USB, with no vendor SDK and no driver install. It runs as a desktop app, a command line tool, or a headless server that turns the camera into a network device.",
    features: [
      "Raw frame streaming and full control of camera settings",
      "Image pipeline: demosaic, white balance, color correction, auto exposure",
      "Headless server with MJPEG stream, WebSocket API and web UI",
      "Desktop app for Windows, macOS and Linux",
      "Runs on ARM Linux boards such as the Raspberry Pi",
    ],
    stack: ["Rust", "Tauri", "USB"],
    license: "MIT OR Apache-2.0",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/loupecam",
      },
      {
        label: "Releases",
        href: "https://github.com/cinderblock/loupecam/releases",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "hotpi",
    name: "HotPi",
    category: "lab",
    repo: "cinderblock/HotPi",
    tagline:
      "A Raspberry Pi controller and profile editor for the T-962 reflow oven",
    summary:
      "HotPi connects a Raspberry Pi Zero to a T-962 reflow oven over serial. It charts the thermocouples live, lets you edit reflow profiles by dragging setpoints, and can flash the oven's firmware.",
    features: [
      "Live charts of four thermocouples and the cold junction",
      "Drag-to-edit reflow profile editor",
      "Saved mode, or closed-loop control from the Pi",
      "Serial firmware flashing over the LPC ISP protocol",
    ],
    stack: ["TypeScript", "Bun", "React", "uPlot", "Raspberry Pi Zero"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/HotPi",
      },
    ],
    page: true,
  },
  {
    slug: "cad-preview",
    name: "cad-preview",
    category: "lab",
    repo: "cinderblock/cad-preview",
    tagline:
      "Pull the embedded thumbnail out of CAD and 3D files, in pure JavaScript",
    summary:
      "cad-preview finds the preview image that many CAD and 3D formats store inside the file and returns it as PNG, JPEG, BMP or GIF bytes. It needs no CAD software, native libraries or cloud service, and runs in the browser, Node and Bun.",
    features: [
      "SolidWorks, Inventor, Solid Edge, Revit, 3ds Max",
      "AutoCAD DWG and DXF, Rhino, SketchUp, Blender",
      "3MF, FreeCAD and Fusion 360 packages, including per-plate slicer renders",
      "Returns all previews in a file, best first",
    ],
    stack: ["TypeScript", "Browser / Node / Bun"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/cad-preview",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/cad-preview",
      },
    ],
    page: false,
  },
  {
    slug: "farmslicer",
    name: "FarmSlicer",
    category: "fab",
    repo: "cinderblock/FarmSlicer",
    tagline:
      "A self-hosted slicer and print-farm manager built on OrcaSlicer's engine",
    summary:
      "FarmSlicer is a web-based slicer and job manager for a small 3D print farm. Upload a model, pick a printer and profiles, and get G-code, sliced on the server or in your browser with OrcaSlicer's engine compiled to WebAssembly. It then sends, queues and follows prints across several printer brands.",
    features: [
      "Plate editing, multi-color painting, supports and cuts in the browser",
      "Drives Bambu Lab, Klipper, OctoPrint, PrusaLink and Elegoo Centauri Carbon printers",
      "Checks every plate's G-code against a model of the printer before it is sent",
      "Print queue, projects and live camera views",
      "Passkey accounts, groups with quotas, and an OctoPrint-compatible upload API",
      "MCP server so AI agents can work the queue",
    ],
    stack: [
      "Rust (axum)",
      "OrcaSlicer libslic3r",
      "WebAssembly",
      "React",
      "Three.js",
      "SQLite",
    ],
    license: "AGPL-3.0-or-later",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/FarmSlicer",
      },
      {
        label: "Site",
        href: "https://farmslicer.com",
      },
    ],
    page: true,
  },
  {
    slug: "print-template",
    name: "Print Template",
    category: "fab",
    repo: "cinderblock/print-template",
    tagline: "Print true-to-size onto envelopes from the browser",
    summary:
      "A small web page that prints addresses onto #10 envelopes at exact physical size. Addresses stay in the browser and are never uploaded.",
    features: [
      "#10 envelope template, printed at true size",
      "Remembers your return address and recent recipients locally",
      "Template system for adding new media",
    ],
    stack: ["TypeScript", "React Router", "Vite", "Bun"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/print-template",
      },
      {
        label: "Live",
        href: "https://cinderblock.github.io/print-template/",
      },
    ],
    page: false,
    early: true,
  },
  {
    slug: "hyparhuts",
    name: "HyparHuts",
    category: "fab",
    repo: "cinderblock/hyparhuts.org",
    tagline:
      "Temporary panel shelters descended from the hexayurt, with the tape taken out",
    summary:
      "HyparHuts are temporary panel shelters descended from the hexayurt, designed to go together without tape. This repo is the project's website; the design files and original write-up live in a separate repo.",
    features: [
      "Website telling the HyparHut story in seven chapters",
      "Includes a 2014 build timelapse",
      "Design files in cinderblock/HyparHut",
    ],
    stack: ["TypeScript", "React Router", "Cloudflare Workers (planned)"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/hyparhuts.org",
      },
      {
        label: "Design files",
        href: "https://github.com/cinderblock/HyparHut",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "uptime-tracker",
    name: "uptime-tracker",
    category: "selfhost",
    repo: "cinderblock/uptime-tracker",
    tagline:
      "Uptime checks, a status dashboard and push alerts on Cloudflare's free plan",
    summary:
      "uptime-tracker is self-hosted uptime monitoring that runs as one Cloudflare Worker with D1 and KV. It works on the free plan, and changes where it keeps history depending on which plan you are on.",
    features: [
      "HTTP checks with expected status, redirect and www-to-apex checks",
      "Dashboard with 7 and 30 day uptime and latency charts",
      "Timeline that lines up state changes across services",
      "Web Push alerts with per-service thresholds",
      "Optional GitHub Actions status, Cloudflare cost watch and DDNS log",
    ],
    stack: ["TypeScript", "Cloudflare Workers", "D1", "KV"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/uptime-tracker",
      },
    ],
    page: true,
  },
  {
    slug: "telemetry-collector",
    name: "telemetry-collector",
    category: "selfhost",
    repo: "cinderblock/telemetry-collector",
    tagline:
      "Collect errors, feedback and screenshots from your apps on Cloudflare's free tier",
    summary:
      "telemetry-collector is a cheap, self-hosted place to gather crash reports, user feedback, screenshots and usage counts from your own apps. It runs on Cloudflare Workers, D1, R2 and Analytics Engine, and sheds detail rather than running up a bill.",
    features: [
      "Public ingest URL per app, with keys derived offline at build time",
      "Duplicate crashes coalesce into one issue with a count",
      "Screenshots and attachments stored in R2",
      "Signed reports from servers and CI are marked as attested",
      "Scoped read tokens for coding agents; passkey-protected admin",
    ],
    stack: ["TypeScript", "Cloudflare Workers", "D1", "R2", "Analytics Engine"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/telemetry-collector",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/telemetry-collector",
      },
    ],
    page: true,
  },
  {
    slug: "smtp-bridge",
    name: "smtp-bridge",
    category: "selfhost",
    repo: "cinderblock/smtp-bridge",
    tagline: "Accept authenticated SMTP and POST each message to a webhook",
    summary:
      "smtp-bridge is a small SMTP server that turns each incoming message into an HTTP webhook call. It is a way out of SMTP for devices and apps that can only send email. It never relays mail onward.",
    features: [
      "Mandatory AUTH, with credentials per route",
      "Multiple listeners: plaintext, STARTTLS or implicit TLS",
      "Automatic certificates by ACME DNS-01 through Cloudflare",
      "Sync delivery with real backpressure, or a durable retry queue",
      "HMAC-signed payloads and optional SQLite message log",
    ],
    stack: ["Go", "SQLite"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/smtp-bridge",
      },
    ],
    page: true,
  },
  {
    slug: "dns01-issuer",
    name: "dns01-issuer",
    category: "selfhost",
    repo: "cinderblock/dns01-issuer",
    tagline:
      "Publicly trusted certificates for a fleet of devices, with no DNS token on any of them",
    summary:
      "dns01-issuer takes a certificate signing request and returns a certificate, using ACME DNS-01. Each device keeps its own key and the issuer alone holds the DNS credential. One config file binds names to key fingerprints, so approving a device is a commit.",
    features: [
      "Issues only when a CSR's names and key match a config entry exactly",
      "Waits for the challenge record on every authoritative server",
      "Renews inside the CA's ARI window, with backoff on failure",
      "Status page lists refused requests with a ready-to-paste entry",
      "Works with Let's Encrypt or any RFC 8555 CA",
    ],
    stack: ["TypeScript", "ACME", "SQLite"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/dns01-issuer",
      },
    ],
    page: true,
  },
  {
    slug: "caddy-dns01",
    name: "caddy-dns01",
    category: "selfhost",
    repo: "cinderblock/caddy-dns01",
    tagline:
      "Caddy with Cloudflare DNS-01, packaged as a Home Assistant add-on",
    summary:
      "A small Caddy 2 build with the Cloudflare DNS provider and caddy-l4, packaged as a Home Assistant add-on that puts HTTPS in front of Home Assistant. Certificates come by DNS-01, so port 80 never needs to be open.",
    features: [
      "Installs from Home Assistant's add-on store as a custom repository",
      "Also usable as a standalone Docker image",
      "Multi-arch image for amd64 and arm64",
    ],
    stack: ["Caddy", "Docker", "Home Assistant"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/caddy-dns01",
      },
    ],
    page: false,
  },
  {
    slug: "caddy-onlink",
    name: "caddy-onlink",
    category: "selfhost",
    repo: "cinderblock/caddy-onlink",
    tagline:
      "A Caddy matcher for clients on this host's own networks, IPv6 included",
    summary:
      "caddy-onlink adds a Caddy request matcher that asks whether a client is on one of the host's own networks. Unlike a private-range check, it works for IPv6 devices that arrive from a delegated global prefix.",
    features: [
      "Reads the host's interface table at runtime",
      "Optional widening to sibling IPv6 subnets",
      "Uses the socket peer only, never forwarded headers",
    ],
    stack: ["Go", "Caddy"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/caddy-onlink",
      },
    ],
    page: false,
  },
  {
    slug: "caddy-librespeed",
    name: "caddy-librespeed",
    category: "selfhost",
    repo: "cinderblock/caddy-librespeed",
    tagline: "A LibreSpeed-compatible speed test inside Caddy. No PHP.",
    summary:
      "caddy-librespeed serves a LibreSpeed-compatible speed test, with a built-in browser UI, from inside Caddy. One directive is the whole site, and existing LibreSpeed clients work unchanged.",
    features: [
      "Speaks LibreSpeed's backend protocol, with or without .php paths",
      "Built-in UI measuring ping, jitter, download and upload",
      "Server list so users can pick the nearest test server",
      "No PHP, no separate server, no files on disk",
    ],
    stack: ["Go", "Caddy"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/caddy-librespeed",
      },
    ],
    page: false,
  },
  {
    slug: "wifi-tester",
    name: "wifi-tester",
    category: "selfhost",
    repo: "cinderblock/wifi-tester",
    tagline: "A LAN page for answering 'why is the Wi-Fi bad?'",
    summary:
      "wifi-tester is a small site on the local network with a browser speed test and a one-line diagnostic for Windows, macOS and Linux. Reports are enriched with what the UniFi controller saw for that machine, so a person or an agent can see why the connection was poor.",
    features: [
      "Speed test to the LAN server and to the internet, including latency under load",
      "Read-only diagnostic script that explains problems in plain language",
      "Reports enriched with AP, band, signal and roam events from UniFi",
      "Agents can watch for new reports and triage them",
    ],
    stack: ["TypeScript", "PowerShell / sh", "UniFi"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/wifi-tester",
      },
    ],
    page: false,
  },
  {
    slug: "system-resource-manager",
    name: "System Resource Manager",
    category: "devtools",
    repo: "cinderblock/system-resource-manager",
    tagline:
      "A machine-wide budget for heavy work, so two test suites don't start at once",
    summary:
      "System Resource Manager is a broker daemon, CLI and tray app that hands out slots for heavy jobs on a shared computer. Work waits its turn instead of overloading the machine, which keeps test results honest. It also shows what is using the machine, and other machines and devices on the network.",
    features: [
      "srmctl run wraps any command and waits for free slots",
      "A lease is a connection, so crashed jobs free their slots at once",
      "Fair queue that lets small jobs fill gaps without starving big ones",
      "Windows Job Objects for low priority and exact CPU accounting",
      "Spots heavy build tools running outside the budget",
    ],
    stack: ["Rust", "Tauri 2", "SvelteKit"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/system-resource-manager",
      },
    ],
    page: true,
  },
  {
    slug: "actions-spend-pacer",
    name: "Actions Spend Pacer",
    category: "devtools",
    repo: "cinderblock/actions-spend-pacer",
    tagline:
      "Keep GitHub Actions spend on a daily allowance by pausing private-repo workflows",
    summary:
      "Actions Spend Pacer compares month-to-date GitHub Actions spend with an allowance that grows each day. When spend is over, it disables workflows in private repos; when spend is back under, it re-enables only the ones it paused. It runs free from a public repo.",
    features: [
      "Daily-growing allowance, default $1 times the day of the month",
      "Re-enables only workflows it disabled itself",
      "Redacts private repo names in public logs by default",
      "Dry-run mode that lists what would be paused",
    ],
    stack: ["TypeScript", "GitHub Actions"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/actions-spend-pacer",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "ghostcom",
    name: "GhostCOM",
    category: "desktop",
    repo: "cinderblock/ghostcom",
    tagline: "Create virtual COM ports on Windows from Node.js and Bun",
    summary:
      "GhostCOM creates serial ports that Windows and its apps see as real COM ports, while your Node.js or Bun code drives the other end as a stream. It is useful for testing serial tools and firmware loaders without hardware.",
    features: [
      "Ports appear in Device Manager and open in any app",
      "Native duplex stream over a kernel driver, independent of baud rate",
      "Events for every baud, DTR/RTS and flow-control change",
      "Null-modem signal crossover",
    ],
    stack: ["C (KMDF driver)", "Rust (napi-rs)", "Node.js / Bun"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/ghostcom",
      },
    ],
    page: true,
  },
  {
    slug: "plugsight",
    name: "PlugSight",
    category: "desktop",
    repo: "cinderblock/plugsight",
    tagline:
      "A live Device Manager for Windows. Watch devices arrive and leave.",
    summary:
      "PlugSight replaces the Windows Device Manager with a view that updates in place. New devices slide in, removed ones stay as faded ghosts for a while, and problem devices get large, clear badges.",
    features: [
      "Incremental updates, never a full tree refresh",
      "Ghost entries for recently removed devices, with last-known properties",
      "Large inline badges for errors, warnings and missing drivers",
      "Connections view that follows USB hubs down to the physical plug",
      "Detail panel with hardware IDs, driver and instance path",
    ],
    stack: ["Rust", "Tauri v2", "SolidJS", "WinRT"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/plugsight",
      },
      {
        label: "Releases",
        href: "https://github.com/cinderblock/plugsight/releases",
      },
    ],
    page: true,
  },
  {
    slug: "open-task",
    name: "open-task",
    category: "desktop",
    repo: "cinderblock/open-task",
    tagline: "An open-source, fast, lightweight task manager. Windows first.",
    summary:
      "open-task is an open-source task manager that matches Windows Task Manager's feature set, aiming for Process Explorer's depth. It is a native Direct2D app that stays out of the way of the machine it measures.",
    features: [
      "Processes as a list, tree, map or CPU history",
      "Performance pages for CPU, memory, each disk, network, GPU and battery",
      "Users, services, startup apps, connections and installed apps",
      "Keyboard navigation and remembered layout per monitor setup",
      "Linux runs headless today; macOS is planned",
    ],
    stack: ["Rust", "Direct2D", "Windows"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/open-task",
      },
      {
        label: "Releases",
        href: "https://github.com/cinderblock/open-task/releases",
      },
    ],
    page: true,
  },
  {
    slug: "open-fan",
    name: "OpenFan",
    category: "desktop",
    repo: "cinderblock/open-fan",
    tagline:
      "Fan control as a node graph, with connections typed by physical quantity",
    summary:
      "OpenFan describes fan control as a graph where each connection carries a physical type. A temperature cannot be wired straight into a fan duty; you add a curve that says what it means. Faults propagate instead of being hidden, and the failsafe hands control back to the board's firmware.",
    features: [
      "Typed connections checked by the same rule in editor and engine",
      "Dead sensors poison outputs rather than reading as safe values",
      "Every channel is commanded or put in failsafe on every tick",
      "Uses the signed PawnIO driver, not WinRing0",
    ],
    stack: ["Rust", "Tauri", "PawnIO"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/open-fan",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "librebooks",
    name: "LibreBooks",
    category: "business",
    repo: "cinderblock/LibreBooks",
    tagline:
      "Open-source double-entry accounting, built as a drop-in for QuickBooks Desktop",
    summary:
      "LibreBooks is open-source accounting meant to keep the same books QuickBooks Desktop keeps, with the same forms, registers, lists and keyboard shortcuts, and no subscription. It runs as a desktop app, a headless server, or a thin client.",
    features: [
      "QuickBooks Desktop's account, transaction and list types, one for one",
      "Read-only import from QuickBooks Desktop, with balance comparison",
      "Phone-friendly web UI and passkey sign-in",
      "Keyboard-first entry with QuickBooks' shortcuts",
      "Bank feeds, reports and backups",
    ],
    stack: ["Rust", "Web UI"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/LibreBooks",
      },
    ],
    page: true,
    early: true,
  },
  {
    slug: "librehours",
    name: "LibreHours",
    category: "business",
    repo: "cinderblock/LibreHours",
    tagline: "Self-hosted, phone-first time tracking for small teams",
    summary:
      "LibreHours is a time tracker for small teams that works offline and sends submitted time to QuickBooks Desktop. It pairs with LibreBooks but stands on its own. Each person picks timers or running notes, and hours can go through optional approval.",
    features: [
      "Passkey-only sign-in with invite links",
      "Timers, or running notes that become hours at day's end",
      "Works offline and installs as an app",
      "Optional approval, rates and reports",
      "Sends time to QuickBooks Desktop",
    ],
    stack: ["TypeScript", "PWA"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/LibreHours",
      },
    ],
    page: true,
  },
  {
    slug: "plan-presenter",
    name: "plan-presenter",
    category: "ai",
    repo: "TomSawyerLabs/plan-presenter",
    tagline:
      "Agents present plans in a clickable UI; people leave inline feedback that goes back",
    summary:
      "An AI agent writes a plan, analysis or design as MDX pages with charts and diagrams. A person opens it, clicks any paragraph or chart to comment, and sends the feedback back; the agent gets it as Markdown pointing at exact source lines, edits, and the page reloads.",
    features: [
      "Click-anywhere feedback on text, charts and Mermaid diagrams",
      "Feedback returns to the agent with exact source line references",
      "Live reload as the agent edits",
      "Private review links per reviewer",
      "Installable agent skill with a small CLI",
    ],
    stack: ["TypeScript", "Bun", "React", "MDX", "Electrobun"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/TomSawyerLabs/plan-presenter",
      },
      {
        label: "Releases",
        href: "https://github.com/TomSawyerLabs/plan-presenter/releases",
      },
    ],
    page: true,
  },
  {
    slug: "skills-editor",
    name: "Skills Editor",
    category: "ai",
    repo: "cinderblock/skills-editor",
    tagline: "A desktop editor for AI agent skills, hooks and instructions",
    summary:
      "Skills Editor finds the skills, hooks, instructions and memory files an AI coding agent uses, and lets you edit, enable, install and share them in one window. Claude Code's formats are supported first.",
    features: [
      "Finds user, project and plugin skills across the machine",
      "Frontmatter-aware editor for SKILL.md and supporting files",
      "Enable and disable skills without hand-editing settings",
      "Install skills from a catalog of public repos",
      "AI-assisted edits that run in the background",
      "Git-based sharing between machines",
    ],
    stack: ["Rust", "Tauri v2", "React", "TypeScript"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/skills-editor",
      },
      {
        label: "Releases",
        href: "https://github.com/cinderblock/skills-editor/releases",
      },
    ],
    page: true,
  },
  {
    slug: "claude-usage",
    name: "Claude Usage",
    category: "ai",
    repo: "cinderblock/claude-usage",
    tagline:
      "A Windows tray app that tracks Claude subscription usage and warns before limits",
    summary:
      "Claude Usage sits in the system tray and shows how much of each Claude usage window is spent. It charts usage against an even pace and warns only when your current burn rate will run out before the window resets.",
    features: [
      "Tray badge with live 5-hour usage",
      "Charts for every limit window, with projection to reset",
      "Alerts based on burn rate, not a fixed percentage",
      "History of past windows",
      "Scheduled messages through the Claude Code CLI",
    ],
    stack: ["Rust", "Tauri v2", "SvelteKit"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/claude-usage",
      },
      {
        label: "Releases",
        href: "https://github.com/cinderblock/claude-usage/releases",
      },
    ],
    page: true,
  },
  {
    slug: "react-smoothie",
    name: "react-smoothie",
    category: "libs",
    repo: "cinderblock/react-smoothie",
    tagline:
      "React wrapper for Smoothie Charts, for live streaming time-series charts",
    summary:
      "react-smoothie wraps Smoothie Charts in a React component for live, streaming time-series charts. Data can come in through props or a ref.",
    features: [
      "Props-based or ref-based series",
      "Responsive sizing",
      "Ships ESM and CommonJS",
    ],
    stack: ["TypeScript", "React"],
    license: "ISC",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/react-smoothie",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/react-smoothie",
      },
      {
        label: "Demo",
        href: "https://cinderblock.github.io/react-smoothie/",
      },
    ],
    page: false,
  },
  {
    slug: "deluge-rpc",
    name: "deluge-rpc-socket",
    category: "libs",
    repo: "cinderblock/node-deluge-rpc",
    tagline: "Node.js client for the Deluge torrent daemon's binary RPC API",
    summary:
      "A Node.js and Bun client for Deluge's binary RPC socket. It works with Deluge 1.x and 2.x and detects which protocol the daemon speaks.",
    features: [
      "Deluge 1.x and 2.x, auto-detected",
      "Daemon events as an event emitter",
      "camelCase in and out, converted from Deluge's snake_case",
    ],
    stack: ["TypeScript", "Node.js / Bun"],
    license: "MIT",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/cinderblock/node-deluge-rpc",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/deluge-rpc-socket",
      },
    ],
    page: false,
  },
];

export const PAGED = PROJECTS.filter((p) => p.page);

export function projectsIn(category: CategoryId): Project[] {
  return PROJECTS.filter((p) => p.category === category);
}
