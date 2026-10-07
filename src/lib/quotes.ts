export type Quote = { text: string; by: string; sacred?: boolean };

// Wording of the Sanskrit and Hindi lines is a plain English rendering, not a literal translation.
const BASE: Quote[] = [
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

const MORE: Quote[] = [
  // more for the interview and placement grind
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", by: "Will Durant, summing up Aristotle" },
  { text: "We suffer more often in imagination than in reality.", by: "Seneca" },
  { text: "No one is free who is not master of himself.", by: "Epictetus" },
  { text: "Waste no more time arguing about what a good person should be. Be one.", by: "Marcus Aurelius, Meditations" },
  { text: "If it is not right, do not do it. If it is not true, do not say it.", by: "Marcus Aurelius, Meditations" },
  { text: "You must do the thing you think you cannot do.", by: "Eleanor Roosevelt" },
  { text: "A journey of a thousand miles begins with a single step.", by: "Lao Tzu" },
  { text: "It does not matter how slowly you go as long as you do not stop.", by: "attributed to Confucius" },
  { text: "It is not the mountain we conquer, but ourselves.", by: "Sir Edmund Hillary" },
  { text: "I have not failed. I've just found ten thousand ways that won't work.", by: "attributed to Thomas Edison" },
  { text: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. That is why I succeed.", by: "Michael Jordan" },
  { text: "The wound is the place where the light enters you.", by: "Rumi" },
  { text: "Faith is the bird that feels the light when the dawn is still dark.", by: "Rabindranath Tagore" },
  { text: "You cannot believe in God until you believe in yourself.", by: "Swami Vivekananda" },
  { text: "The greatest sin is to think yourself weak.", by: "Swami Vivekananda" },
  { text: "Excellence is a continuous process and not an accident.", by: "attributed to A. P. J. Abdul Kalam" },
  { text: "Before you start any work, ask yourself three questions: why am I doing it, what might the results be, and will I succeed?", by: "attributed to Chanakya" },
  { text: "The best way to predict the future is to create it.", by: "attributed to Peter Drucker" },
  { text: "An interview is a conversation, not an exam. Walk in curious, not afraid.", by: "OpsPulse" },
  { text: "Rejection is not a verdict on you. It is a mismatch, and the next room may be the right one.", by: "OpsPulse" },

  // more from the Hindu tradition
  { text: "To those who think of Me with undivided devotion, I bring what they lack and protect what they have.", by: "Bhagavad Gita 9.22", sacred: true },
  { text: "Do your assigned work, for action is better than inaction.", by: "Bhagavad Gita 3.8", sacred: true },
  { text: "On this path no effort is wasted and no step is lost; even a little of this practice saves one from great fear.", by: "Bhagavad Gita 2.40", sacred: true },
  { text: "One whose mind is not shaken by sorrow and not hungry for pleasure, free of fear and anger, is called a sage of steady wisdom.", by: "Bhagavad Gita 2.56", sacred: true },
  { text: "A person is shaped by faith: whatever one's faith is, that is what one becomes.", by: "Bhagavad Gita 17.3", sacred: true },
  { text: "Arise and win glory. Be only the instrument.", by: "Bhagavad Gita 11.33", sacred: true },
  { text: "For one who has conquered the mind, the mind is a friend; for one who has not, it is an enemy.", by: "Bhagavad Gita 6.6", sacred: true },
  { text: "Troubles end and all pain is erased for one who remembers the brave Hanuman.", by: "Hanuman Chalisa, verse 36", sacred: true },
  { text: "Om Gam Ganapataye Namah: salutations to Ganapati, remover of obstacles.", by: "Ganesha bija mantra", sacred: true },
  { text: "Salutations to Saraswati, giver of boons. I begin my studies; may I always succeed.", by: "Saraswati mantra for study", sacred: true },
  { text: "O auspicious one, who fulfils every purpose and gives refuge to all: I bow to you.", by: "Devi Mahatmya (Durga)", sacred: true },
  { text: "Om Namah Shivaya: I bow to the Self within, calm and unshaken.", by: "Shiva panchakshara mantra", sacred: true },
  { text: "What Ram has willed will come to pass, so why worry and stretch the mind?", by: "Ramcharitmanas, Tulsidas", sacred: true },
  { text: "In hard times, knowledge, humility, discernment, courage, good deeds and truth are your companions, and your trust is in Ram.", by: "Ramcharitmanas, Sundara Kanda", sacred: true },
  { text: "From darkness lead me to light.", by: "Brihadaranyaka Upanishad 1.3.28", sacred: true },
  { text: "Speak the truth. Follow dharma.", by: "Taittiriya Upanishad", sacred: true },
  { text: "Truth alone triumphs.", by: "Mundaka Upanishad 3.1.6", sacred: true },
  { text: "Let noble thoughts come to us from every side.", by: "Rigveda 1.89.1", sacred: true },
  { text: "Work succeeds through effort, not wishes. Deer do not walk into the mouth of a sleeping lion.", by: "Hitopadesha, attributed to Bhartrihari", sacred: true },
  { text: "Knowledge gives humility, humility gives worthiness, worthiness brings wealth, and wealth supports dharma and happiness.", by: "Hitopadesha", sacred: true },
];

export const QUOTES: Quote[] = [...BASE, ...MORE];
