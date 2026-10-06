export type Quote = { text: string; by: string; sacred?: boolean };

// Wording of the Sanskrit and Hindi lines is a plain English rendering, not a literal translation.
export const QUOTES: Quote[] = [
  // for the interview and placement grind
  { text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", by: "Seneca" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", by: "Marcus Aurelius, Meditations" },
  { text: "Fall seven times, stand up eight.", by: "Japanese proverb" },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", by: "Nelson Mandela" },
  { text: "Whether you think you can, or you think you can't, you're right.", by: "Henry Ford" },
  { text: "Arise, awake, and stop not till the goal is reached.", by: "Swami Vivekananda" },
  { text: "All power is within you. You can do anything and everything.", by: "Swami Vivekananda" },
  { text: "Take up one idea. Make that one idea your life; dream of it, think of it, live on that idea.", by: "Swami Vivekananda" },
  { text: "Dream, dream, dream. Dreams transform into thoughts, and thoughts result in action.", by: "A. P. J. Abdul Kalam" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", by: "Robert Collier" },
  { text: "You can't cross the sea merely by standing and staring at the water.", by: "Rabindranath Tagore" },
  { text: "You may encounter many defeats, but you must not be defeated.", by: "Maya Angelou" },
  { text: "It's not what happens to you, but how you react to it that matters.", by: "Epictetus" },
  { text: "Many of life's failures are people who did not realise how close they were to success when they gave up.", by: "Thomas Edison" },
  { text: "Luck is what happens when preparation meets opportunity.", by: "attributed to Seneca" },
  { text: "Think big, think fast, think ahead. Ideas are no one's monopoly.", by: "Dhirubhai Ambani" },
  { text: "None can destroy iron, but its own rust can. None can destroy a person, but their own mindset can.", by: "attributed to Ratan Tata" },

  // from the Hindu tradition
  { text: "You have a right to your actions, but never to the fruits of your actions.", by: "Bhagavad Gita 2.47", sacred: true },
  { text: "Lift yourself by your own effort; do not let yourself sink. You alone are your friend, and you alone can be your enemy.", by: "Bhagavad Gita 6.5", sacred: true },
  { text: "Heat and cold, pleasure and pain, come and go. They do not last, so bear them with patience.", by: "Bhagavad Gita 2.14", sacred: true },
  { text: "Give up this small weakness of the heart. Arise, and stand up for the work in front of you.", by: "Bhagavad Gita 2.3", sacred: true },
  { text: "Yoga is skill in action.", by: "Bhagavad Gita 2.50", sacred: true },
  { text: "The mind is restless and hard to hold, but it can be trained through practice and detachment.", by: "Bhagavad Gita 6.35", sacred: true },
  { text: "Treat pleasure and pain, gain and loss, victory and defeat alike, and then get ready to act.", by: "Bhagavad Gita 2.38", sacred: true },
  { text: "Grant me strength, wisdom and knowledge, and remove my troubles and my flaws.", by: "Hanuman Chalisa, closing verse", sacred: true },
  { text: "O Lord of the curved trunk and mighty form, whose radiance equals a million suns: remove every obstacle from my work, always.", by: "Ganesha mantra", sacred: true },
  { text: "To the Goddess who lives in every being as knowledge: I bow to you again and again.", by: "Devi Mahatmya (Saraswati)", sacred: true },
  { text: "May the divine light illuminate our minds.", by: "Gayatri Mantra, Rigveda 3.62.10", sacred: true },
];
