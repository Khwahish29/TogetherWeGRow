import type { CompanionRequest, CompanionResponse } from "../../shared/types";

interface Guide {
  intro: string;
  steps: string[];
  simpler: string[];
}

export const GUIDES: Record<string, Guide> = {
  "video-meeting": {
    intro: "Joining a video meeting is easier than it looks. We'll go one small step at a time.",
    steps: [
      "Find the meeting link. It usually arrives in an email or text message and starts with https://.",
      "Tap or click the link. Your browser or a meeting app (like Zoom or Google Meet) will open.",
      "If it asks for your name, type it in so others know who you are.",
      "When it asks to use your microphone and camera, choose Allow.",
      "Press the button that says Join or Join now.",
      "Look for the microphone and camera icons at the bottom. A line through an icon means it is off. Tap it to turn it on or off.",
      "When you are finished, press the red Leave or End button.",
    ],
    simpler: [
      "The link is like an address for the meeting. Look in your messages for it.",
      "Touching the link opens the meeting, like opening a door.",
      "Type your name so people can see who you are.",
      "Say yes so people can see and hear you.",
      "Press Join. You are now in the meeting.",
      "The little microphone picture controls your sound. Tap it to switch.",
      "Press the red button to leave. That's it!",
    ],
  },
  email: {
    intro: "Let's send an email together. You can repeat any step as often as you like.",
    steps: [
      "Open your email app or website (for example Gmail or Outlook).",
      "Press the button that says Compose, New, or shows a pencil.",
      "In the To box, type the email address of the person you are writing to.",
      "In the Subject box, write a few words about what the email is about.",
      "In the large box below, type your message.",
      "Read it once more, then press Send.",
    ],
    simpler: [
      "Open the place where your emails live.",
      "Find the button to write a new email.",
      "Type the address of the person, like writing on an envelope.",
      "The subject is a short title, like 'Hello' or 'Question about Tuesday'.",
      "Now write your message, just like a letter.",
      "Press Send. Your email is on its way.",
    ],
  },
  resume: {
    intro: "A résumé is a short page about your work. You already have the experience; we just need to write it down.",
    steps: [
      "Write your name, phone number, and email at the top.",
      "Write two or three sentences about who you are and what you are good at.",
      "List your past jobs, newest first, with the years you worked there.",
      "Under each job, write two or three things you did or were proud of.",
      "Add a short list of your skills.",
      "Save it as a PDF so it looks the same on every computer.",
    ],
    simpler: [
      "Start with how people can reach you.",
      "Say in a few words what kind of worker you are.",
      "Write down where you have worked.",
      "Say what you did there.",
      "List what you are good at.",
      "Save it so you can send it to others.",
    ],
  },
  "job-application": {
    intro: "Applying online mostly means filling in a form. Take your time; most forms let you save and come back.",
    steps: [
      "Open the job advert and read what they are looking for.",
      "Look for a button that says Apply or Apply now.",
      "You may need to create an account with your email and a password. Write the password down somewhere safe.",
      "Fill in each box. Boxes with a star (*) must be filled in.",
      "If it asks for a résumé or CV, press Upload and choose your saved file.",
      "Check everything, then press Submit. You should get a confirmation email.",
    ],
    simpler: [
      "Read about the job first.",
      "Find the Apply button.",
      "You may need to make an account. Keep your password safe.",
      "Fill in the boxes, especially those with a star.",
      "Attach your résumé file.",
      "Press Submit. You're done!",
    ],
  },
  scams: {
    intro: "Scam messages try to rush or frighten you. Knowing the signs keeps you safe.",
    steps: [
      "Be careful if a message says it is urgent or threatens you (for example, 'your account will close today').",
      "Check who sent it. Strange email addresses or numbers are a warning sign.",
      "Never share passwords, PIN numbers, or bank details by message or phone.",
      "Don't click links in unexpected messages. Go to the company's website yourself instead.",
      "If you are unsure, ask someone you trust or call the company using a number you already know.",
      "Delete the message or report it as spam.",
    ],
    simpler: [
      "If a message rushes you, slow down.",
      "Look at who sent it. Do you know them?",
      "Never give out passwords or bank numbers.",
      "Don't press links in surprise messages.",
      "Ask someone you trust if you are not sure.",
      "Delete it. You did the right thing.",
    ],
  },
  "ai-tools": {
    intro: "AI tools are programs you can talk to in plain words. You don't need special skills.",
    steps: [
      "Open an AI assistant website or app.",
      "Type a question the way you would ask a person, for example 'How do I write a thank-you note?'",
      "Read the answer. If it's unclear, ask it to 'explain more simply'.",
      "You can ask follow-up questions. It remembers the conversation.",
      "Check important facts elsewhere. AI can make mistakes.",
      "Never type passwords or private bank details into an AI tool.",
    ],
    simpler: [
      "Open the AI program.",
      "Ask it a question in your own words.",
      "If you don't understand, ask it to say it more simply.",
      "Keep asking. It's like a conversation.",
      "Double-check important things.",
      "Keep private information to yourself.",
    ],
  },
};

export function fallbackCompanion(req: CompanionRequest): CompanionResponse {
  const guide = GUIDES[req.topic] ?? GUIDES["video-meeting"];

  if (req.action === "guide") {
    return { intro: guide.intro, steps: guide.steps };
  }

  if (req.action === "simpler") {
    const index = req.step ? guide.steps.indexOf(req.step) : -1;
    return {
      reply: index >= 0 ? guide.simpler[index] : "Let's take this slowly. Try just the first part of the step, then press Next when you're ready.",
    };
  }

  // Point to the guide step that shares the most words with the question.
  const words = (req.question ?? "").toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const scored = guide.steps.map((step, i) => ({
    i,
    score: words.filter((w) => step.toLowerCase().includes(w)).length,
  }));
  const best = scored.sort((a, b) => b.score - a.score)[0];
  if (best && best.score > 0) {
    return {
      reply: `This may help. Step ${best.i + 1}: ${guide.steps[best.i]}\n\nIf you're still stuck, that's completely normal. A digital buddy can look at it with you.`,
    };
  }

  return {
    reply:
      "That's a good question. I can only give general guidance right now. Try the step-by-step guide above, or choose Learn with a Human to ask a friendly digital buddy.",
  };
}
