export type Disclaimer = "health" | "money";

type ToolBase = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  disclaimer?: Disclaimer;
};

export type AppTool = ToolBase & { kind: "app" };

export type GuideLink = {
  href: string;
  label: string;
  note: string;
};

export type GuideTool = ToolBase & {
  kind: "guide";
  paragraphs: string[];
  links?: GuideLink[];
};

export type Tool = AppTool | GuideTool;

export type Category = {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
};

export const categories: Category[] = [
  {
    id: "utilities",
    name: "Utilities",
    description: "Numbers, files, and small everyday helpers that stay on this device.",
    tools: [
      {
        kind: "app",
        slug: "online-clipboard",
        name: "Online Clipboard",
        summary: "A pasteboard that lives in this browser, not on a server.",
        description:
          "Keep a note on this device. Copy and paste use the system clipboard only when you press a button.",
      },
      {
        kind: "app",
        slug: "qr-code",
        name: "QR Code",
        summary: "Turn a link or a short note into a code you can save.",
        description: "Make a QR code in the page and download a PNG. The text never leaves this browser.",
      },
      {
        kind: "app",
        slug: "barcode",
        name: "Barcode",
        summary: "Encode text as a Code 128 barcode and download it.",
        description: "Create a simple Code 128 barcode for letters, numbers, and everyday symbols.",
      },
      {
        kind: "app",
        slug: "calculator",
        name: "Calculator",
        summary: "Add, subtract, multiply, and divide on a large keypad.",
        description: "A straightforward calculator for quick arithmetic, with a clear error when a sum does not work.",
      },
      {
        kind: "app",
        slug: "file-conversion",
        name: "File Conversion",
        summary: "Convert a PNG, JPEG, WebP, or GIF on this device.",
        description:
          "Change common image formats in the browser. Other file types stay put and are marked as not available yet.",
      },
      {
        kind: "app",
        slug: "file-compression",
        name: "File Compression",
        summary: "Bundle files into a zip archive without uploading them.",
        description:
          "Zip a handful of files locally. Photos and video are often compressed already, so the archive may not be smaller.",
      },
      {
        kind: "app",
        slug: "unit-converter",
        name: "Unit Converter",
        summary: "Switch length, weight, temperature, and volume.",
        description: "Convert everyday units. Volume uses US cups, fluid ounces, and gallons.",
      },
      {
        kind: "app",
        slug: "white-noise",
        name: "White Noise",
        summary: "Play noise or a steady tone, and stop it when you want.",
        description: "Soft noise or a sine tone through Web Audio. Nothing plays until you start it, and stop is always in reach.",
      },
    ],
  },
  {
    id: "music",
    name: "Music",
    description: "Listening tools. These entries explain the job and wait for a safe browser version.",
    tools: [
      {
        kind: "guide",
        slug: "stem-splitter",
        name: "Stem Splitter",
        summary: "A guide to splitting a song into vocals and instruments.",
        description: "Stem splitting needs a trained model. This page describes the idea and does not upload audio.",
        paragraphs: [
          "A stem splitter takes a mixed song and tries to separate it into parts such as vocals, drums, bass, and everything else. Useful versions rely on a trained model and a fair amount of processing.",
          "Instagives does not run that model and does not upload your audio to a server. Stem Splitter is a directory entry coming later.",
        ],
      },
      {
        kind: "guide",
        slug: "video-to-mp3",
        name: "Video to MP3",
        summary: "A guide to saving a video’s audio as an MP3.",
        description: "Pulling an audio track out of a video is not available in the browser here.",
        paragraphs: [
          "Video to MP3 would take the soundtrack from a video file and save it as an MP3. Doing that well means decoding the video, which this site does not run in the browser and will not do by uploading your file.",
          "This is a directory entry coming later.",
        ],
      },
    ],
  },
  {
    id: "image",
    name: "Image",
    description: "Resize a picture here. Enlarging one with invented detail is listed, not faked.",
    tools: [
      {
        kind: "app",
        slug: "image-resize",
        name: "Image Resize",
        summary: "Change pixel size on the canvas and download the result.",
        description: "Pick a new width and height, keep the shape if you want, and save a PNG or JPEG. The file stays on this device.",
      },
      {
        kind: "guide",
        slug: "upscale",
        name: "Upscale",
        summary: "A guide to enlarging a picture without pretending a stretch is enough.",
        description: "Honest upscaling needs a model. This page does not blow an image up and call it sharper.",
        paragraphs: [
          "Upscaling means making a picture larger while trying to invent plausible detail, usually with a trained model. Drawing the same pixels onto a bigger canvas only stretches them. That is a resize, not an upscale, so this page does not offer it under this name.",
          "A browser tool that can upscale honestly is a directory entry coming later. Nothing is uploaded, because there is no processor here.",
        ],
      },
    ],
  },
  {
    id: "money-business",
    name: "Money & Business",
    description: "Payment estimates for loans, EMIs, and mortgages.",
    tools: [
      {
        kind: "app",
        slug: "loan-calculator",
        name: "Loan Calculator",
        summary: "Estimate a monthly payment from an amount, rate, and years.",
        description: "See a monthly payment, the interest it adds up to, and the first year of a sample schedule.",
        disclaimer: "money",
      },
      {
        kind: "app",
        slug: "emi-calculator",
        name: "EMI Calculator",
        summary: "Work out an equated monthly installment.",
        description: "Enter principal, annual rate, and a term in months. The EMI stays level for the whole term in this estimate.",
        disclaimer: "money",
      },
      {
        kind: "app",
        slug: "mortgage-calculator",
        name: "Mortgage Calculator",
        summary: "Estimate a home payment, with optional tax and insurance.",
        description: "Start from a price and a down payment. Add yearly tax and insurance if you want them in the monthly figure.",
        disclaimer: "money",
      },
    ],
  },
  {
    id: "health",
    name: "Health",
    description: "Body, calorie, and due-date estimates. They are not medical advice.",
    tools: [
      {
        kind: "app",
        slug: "bmi-calculator",
        name: "BMI Calculator",
        summary: "Estimate body mass index from height and weight.",
        description: "Uses the standard adult formula. The band it names is a screening label, not a diagnosis.",
        disclaimer: "health",
      },
      {
        kind: "app",
        slug: "calories-calculator",
        name: "Calories Calculator",
        summary: "Estimate daily calories from age, size, and activity.",
        description: "Uses the Mifflin–St Jeor equation for adults, then a common activity multiplier.",
        disclaimer: "health",
      },
      {
        kind: "app",
        slug: "pregnancy-calculator",
        name: "Pregnancy Calculator",
        summary: "Estimate a due date from the first day of a last period.",
        description: "Adds 280 days to that date. It does not confirm a pregnancy or replace prenatal care.",
        disclaimer: "health",
      },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    description: "A packing checklist and a rough read on jet lag.",
    tools: [
      {
        kind: "app",
        slug: "packing-list",
        name: "Packing List Generator",
        summary: "Build a checklist from the length, climate, and style of a trip.",
        description: "Answer a few questions and tick items off. Add your own lines if the list missed something.",
      },
      {
        kind: "app",
        slug: "jet-lag-calculator",
        name: "Jet Lag Calculator",
        summary: "See how many hours the clock shifts between two places.",
        description: "A travel estimate from standard time offsets. Daylight saving can move the real gap by an hour.",
      },
    ],
  },
  {
    id: "video-audio",
    name: "Video & Audio",
    description: "Players, editors, and other listening tools will live here.",
    tools: [],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Short guides that point at public project sites. No labs and no attack instructions.",
    tools: [
      {
        kind: "guide",
        slug: "kali-linux-online",
        name: "Kali Linux Online",
        summary: "What Kali Linux is, and where the official project lives.",
        description: "A directory entry for the Kali Linux project. Instagives does not host it.",
        paragraphs: [
          "Kali Linux is a free Debian-based operating system published for security testing and education. People who use it are expected to have permission for any system they examine.",
          "This page is a directory entry. Read about the project on its official site.",
        ],
        links: [
          {
            href: "https://www.kali.org",
            label: "Kali Linux official site",
            note: "The project’s own homepage.",
          },
        ],
      },
      {
        kind: "guide",
        slug: "ctf-challenges",
        name: "CTF Challenges",
        summary: "What capture-the-flag events are, with links to public learning sites.",
        description: "A directory entry only. This site does not host challenges, flags, or solutions.",
        paragraphs: [
          "Capture-the-flag events are puzzle competitions and practice sets. Schools and clubs use them as a legal way to learn security ideas.",
          "Instagives does not host challenges, write-ups, or flags. Two well-known public starting points are listed below. They are independent of this site.",
        ],
        links: [
          {
            href: "https://picoctf.org",
            label: "picoCTF",
            note: "A free education program from Carnegie Mellon University.",
          },
          {
            href: "https://ctftime.org",
            label: "CTFtime",
            note: "A community calendar of public events.",
          },
        ],
      },
    ],
  },
];

export const tools: Tool[] = categories.flatMap((category) => category.tools);

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}

export function getTool(slug: string) {
  for (const category of categories) {
    const tool = category.tools.find((item) => item.slug === slug);
    if (tool) return { tool, category };
  }
  return undefined;
}

export function countTools() {
  const apps = tools.filter((tool) => tool.kind === "app").length;
  const guides = tools.filter((tool) => tool.kind === "guide").length;
  return { apps, guides, total: tools.length };
}
