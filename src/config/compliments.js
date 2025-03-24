export const COMPLIMENTS = [
  "Amazing!",
  "Superb!",
  "Fantastic!",
  "Brilliant!",
  "Awesome!",
  "Outstanding!",
  "Excellent!",
  "Incredible!",
  "Wonderful!",
  "Magnificent!"
];

export const getRandomCompliment = () => {
  const randomIndex = Math.floor(Math.random() * COMPLIMENTS.length);
  return COMPLIMENTS[randomIndex];
}; 