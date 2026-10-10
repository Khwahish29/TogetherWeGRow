import type { CareerRec } from "../../shared/types";

export interface TradeEntry {
  /** Lowercase words that signal this trade in free text. */
  keywords: string[];
  industry: string;
  /** Skills to add when the trade is detected (only ones implied by the keywords). */
  skills: Record<string, string>;
  roles: Omit<CareerRec, "transferableSkills">[];
}

// Keyword → skill label pairs. A skill is added only if its keyword appears in the text.
export const TRADES: Record<string, TradeEntry> = {
  carpentry: {
    keywords: ["carpent", "woodwork", "joiner", "cabinet", "furniture"],
    industry: "Carpentry & woodworking",
    skills: {
      carpent: "Carpentry",
      furniture: "Furniture making",
      repair: "Repairs",
      construct: "Construction",
      cabinet: "Cabinet making",
      apprentic: "Apprentice training",
      material: "Material selection",
      wood: "Woodworking",
    },
    roles: [
      {
        title: "Carpentry Mentor",
        type: "paid-mentoring",
        why: "You can teach woodworking and guide apprentices using decades of hands-on experience, mostly by showing and explaining rather than lifting.",
        qualificationsNeeded: "Usually none beyond your experience.",
        physicalDemand: "low",
        howToFind: "Offer sessions in the TogetherWeGrow marketplace, or ask local makerspaces and apprenticeship programmes.",
      },
      {
        title: "Workshop Adviser",
        type: "advisory",
        why: "Teams value someone who can plan projects, choose materials, and spot problems early.",
        qualificationsNeeded: "Usually none; a portfolio of past projects helps.",
        physicalDemand: "low",
        howToFind: "Contact joinery workshops, furniture makers, and community workshops in your area.",
      },
      {
        title: "Quality Inspector",
        type: "inspection",
        why: "Your eye for good workmanship can be used to check finished work instead of producing it.",
        qualificationsNeeded: "May need an inspection certification depending on your region and employer.",
        physicalDemand: "medium",
        howToFind: "Look at construction firms, building inspection offices, and manufacturers.",
      },
      {
        title: "Vocational Trainer",
        type: "training",
        why: "You can train learners in traditional techniques and workshop safety.",
        qualificationsNeeded: "May need a teaching or trainer credential for formal colleges.",
        physicalDemand: "low",
        howToFind: "Vocational schools, community colleges, and trade unions often hire experienced trades people.",
      },
    ],
  },
  plumbing: {
    keywords: ["plumb", "pipe", "pipes", "heating", "boiler"],
    industry: "Plumbing & heating",
    skills: { plumb: "Plumbing", pipe: "Pipe fitting", heating: "Heating systems", boiler: "Boiler servicing", repair: "Repairs", apprentic: "Apprentice training" },
    roles: [
      { title: "Plumbing Mentor", type: "paid-mentoring", why: "Guide apprentices and new plumbers through real problems you have already solved many times.", qualificationsNeeded: "Usually none beyond your experience.", physicalDemand: "low", howToFind: "Offer sessions in the marketplace or contact apprenticeship schemes." },
      { title: "Technical Phone/Video Adviser", type: "advisory", why: "Diagnose problems remotely for younger plumbers or homeowners.", qualificationsNeeded: "Usually none; some firms ask for a trade licence.", physicalDemand: "low", howToFind: "Plumbing firms, home-services companies, and trade supply stores." },
      { title: "Trade School Instructor", type: "training", why: "Teach the practical skills and safety habits that textbooks miss.", qualificationsNeeded: "May need a teaching credential.", physicalDemand: "low", howToFind: "Vocational schools and community colleges." },
    ],
  },
  electrical: {
    keywords: ["electric", "wiring", "electrician"],
    industry: "Electrical work",
    skills: { electric: "Electrical installation", wiring: "Wiring", safety: "Safety practices", apprentic: "Apprentice training" },
    roles: [
      { title: "Electrical Apprentice Mentor", type: "paid-mentoring", why: "Pass on safe working habits and problem-solving to new electricians.", qualificationsNeeded: "Usually your existing trade licence.", physicalDemand: "low", howToFind: "Apprenticeship programmes and the marketplace." },
      { title: "Safety Educator", type: "training", why: "Your experience with what goes wrong makes you a credible safety teacher.", qualificationsNeeded: "May need a safety-training certificate.", physicalDemand: "low", howToFind: "Training providers, unions, and large employers." },
      { title: "Electrical Inspector", type: "inspection", why: "Check others' installations instead of doing heavy installs yourself.", qualificationsNeeded: "Usually requires an inspector certification.", physicalDemand: "medium", howToFind: "Local building authorities and inspection firms." },
    ],
  },
  office: {
    keywords: ["account", "bookkeep", "finance", "office", "manager", "admin", "payroll", "hr", "human resources", "sales", "marketing"],
    industry: "Business & office",
    skills: { account: "Accounting", bookkeep: "Bookkeeping", finance: "Finance", manag: "Team management", admin: "Administration", payroll: "Payroll", sales: "Sales", marketing: "Marketing", "human resources": "Human resources" },
    roles: [
      { title: "Small Business Consultant", type: "consulting", why: "Small businesses need practical advice from people who have run real offices.", qualificationsNeeded: "Usually none; some areas (e.g. tax) need certification.", physicalDemand: "low", howToFind: "Local business associations, chambers of commerce, and the marketplace." },
      { title: "Career Mentor", type: "paid-mentoring", why: "Help younger people navigate workplaces, interviews, and early careers.", qualificationsNeeded: "Usually none.", physicalDemand: "low", howToFind: "Universities, youth employment programmes, and the marketplace." },
      { title: "Workplace Trainer", type: "training", why: "Teach processes and professional skills you have practised for years.", qualificationsNeeded: "May need a trainer certificate for formal programmes.", physicalDemand: "low", howToFind: "Training companies and HR departments." },
    ],
  },
  care: {
    keywords: ["nurs", "care", "caregiv", "hospital", "health"],
    industry: "Health & care",
    skills: { nurs: "Nursing", care: "Patient care", caregiv: "Caregiving", hospital: "Hospital procedures", health: "Health education" },
    roles: [
      { title: "Clinical Mentor", type: "paid-mentoring", why: "Support new nurses and carers through their first years.", qualificationsNeeded: "Often requires current or recent registration.", physicalDemand: "low", howToFind: "Hospitals, care homes, and nursing schools." },
      { title: "Health Educator", type: "training", why: "Teach communities and families about care and prevention.", qualificationsNeeded: "May need a health-education certificate.", physicalDemand: "low", howToFind: "Community centres, NGOs, and clinics." },
    ],
  },
  teaching: {
    keywords: ["teacher", "teaching", "school", "tutor", "lectur"],
    industry: "Education",
    skills: { teach: "Teaching", tutor: "Tutoring", lectur: "Lecturing", curricul: "Curriculum design" },
    roles: [
      { title: "Tutor", type: "paid-mentoring", why: "One-to-one teaching uses your skills with a lighter schedule.", qualificationsNeeded: "Usually none for private tutoring.", physicalDemand: "low", howToFind: "Tutoring platforms, schools, and the marketplace." },
      { title: "Curriculum Adviser", type: "advisory", why: "Help schools and training providers design practical courses.", qualificationsNeeded: "Teaching experience usually expected.", physicalDemand: "low", howToFind: "Schools, training companies, and education NGOs." },
    ],
  },
  cooking: {
    keywords: ["cook", "chef", "kitchen", "bak", "restaurant"],
    industry: "Food & hospitality",
    skills: { cook: "Cooking", chef: "Professional cooking", kitchen: "Kitchen management", bak: "Baking", menu: "Menu planning", restaurant: "Restaurant operations" },
    roles: [
      { title: "Culinary Mentor", type: "paid-mentoring", why: "Teach techniques and kitchen discipline to young cooks.", qualificationsNeeded: "Usually none beyond experience.", physicalDemand: "medium", howToFind: "Cooking schools, restaurants, and the marketplace." },
      { title: "Kitchen Consultant", type: "consulting", why: "Advise restaurants on menus, workflow, and cost control.", qualificationsNeeded: "Usually none; food-safety certificate helps.", physicalDemand: "low", howToFind: "Independent restaurants and hospitality groups." },
    ],
  },
  mechanic: {
    keywords: ["mechanic", "engine", "car ", "cars", "auto", "vehicle", "machin"],
    industry: "Mechanical & automotive",
    skills: { mechanic: "Mechanical repair", engine: "Engine diagnostics", auto: "Automotive repair", vehicle: "Vehicle maintenance", machin: "Machinery" },
    roles: [
      { title: "Diagnostics Mentor", type: "paid-mentoring", why: "Teach young mechanics how to find faults by sound, feel, and logic.", qualificationsNeeded: "Usually none beyond experience.", physicalDemand: "low", howToFind: "Garages, training centres, and the marketplace." },
      { title: "Service Quality Adviser", type: "advisory", why: "Review work and advise garages on quality and customer trust.", qualificationsNeeded: "Usually none.", physicalDemand: "low", howToFind: "Independent garages and dealerships." },
    ],
  },
};

export const GENERIC_ROLES: Omit<CareerRec, "transferableSkills">[] = [
  { title: "Experience Mentor", type: "paid-mentoring", why: "Your working life gives younger people knowledge they cannot get from a textbook.", qualificationsNeeded: "Usually none.", physicalDemand: "low", howToFind: "Create a mentoring offer in the TogetherWeGrow marketplace." },
  { title: "Advisory Consultant", type: "advisory", why: "Businesses in your field value an experienced second opinion.", qualificationsNeeded: "Depends on the field.", physicalDemand: "low", howToFind: "Local business networks and former colleagues." },
];

export const PREFERENCE_PATTERNS: [RegExp, string][] = [
  [/(can'?t|can ?not|no longer|unable to|hard|difficult|struggle).{0,30}(lift|heavy|carry|stand)/i, "Less physically demanding work"],
  [/(part[- ]time|few hours|fewer hours|flexible)/i, "Part-time or flexible hours"],
  [/(online|from home|remote|video)/i, "Open to online work"],
  [/(teach|mentor|train|apprentic|pass on)/i, "Enjoys teaching others"],
];
