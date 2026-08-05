export const teams = [
  {
    number: 1,
    slug: "baby-olympics",
    icon: "trophy",
    title: "The Baby Olympics",
    teaser: "Crawl, baby-talk, and pose your way to victory.",
    challenge: {
      intro: "Your family must complete all three events.",
      blocks: [
        { title: "Event 1 - Baby Crawl", lines: ["Choose one adult.", "They must crawl approximately 5 metres like a baby.", "Walking means disqualification."] },
        { title: "Event 2 - Baby Talk", lines: ["Choose another adult.", "They must say 'Happy Birthday Anvika!' in their best baby voice."] },
        { title: "Event 3 - Baby Pose", lines: ["The entire family makes their best baby face.", "Take a selfie and show Anvika's parents."] },
      ],
      finish: "All three events complete? Report to Anvika's parents for approval.",
    },
  },
  {
    number: 2,
    slug: "precious-balloon",
    icon: "balloon",
    title: "Don't Let It Drop!",
    teaser: "Keep Anvika's precious balloon flying.",
    challenge: {
      intro: "Keep the balloon in the air for 20 seconds.",
      blocks: [
        { title: "The rules", lines: ["Adults cannot use their hands.", "Kids can use anything.", "If the balloon touches the ground, start again."] },
      ],
      finish: "Made it to 20 seconds? Report to Anvika's parents for approval.",
    },
  },
  {
    number: 3,
    slug: "animal-madness",
    icon: "paw",
    title: "Animal Madness",
    teaser: "Welcome to Anvika's very silly zoo.",
    challenge: {
      intro: "The youngest participating child collects one secret animal slip from Anvika's parents and keeps it hidden.",
      blocks: [
        { title: "Round one", lines: ["One adult acts like the chosen animal.", "No words and no saying the animal's name.", "Everyone else must guess."] },
        { title: "The grand finale", lines: ["Once it is guessed, every adult becomes that animal for 10 seconds."] },
      ],
      finish: "Once your dignity has disappeared, report to Anvika's parents.",
    },
  },
  {
    number: 4,
    slug: "copy-anvika",
    icon: "camera",
    title: "Recreate Baby Anvika",
    teaser: "Copy the birthday girl's most fabulous pose.",
    challenge: {
      intro: "Study Anvika's photograph below. Your mission is to recreate it.",
      photo: true,
      blocks: [
        { title: "Choose your cast", lines: ["Choose one adult to play Anvika.", "Everyone else may become props, toys, furniture, or supporting actors."] },
        { title: "Take the photograph", lines: ["The more ridiculous the recreation, the better.", "Show both photographs to Anvika's parents."] },
      ],
      finish: "Recreation captured? Report to Anvika's parents for judging.",
    },
  },
  {
    number: 5,
    slug: "terrible-karaoke",
    icon: "microphone",
    title: "Terrible Birthday Singers",
    teaser: "Give Happy Birthday a truly unforgettable remix.",
    challenge: {
      intro: "Collect one folded mystery singing-style slip from Anvika's parents. Keep it closed until your whole team is ready.",
      blocks: [
        { title: "Your performance", lines: ["Sing 'Happy Birthday to Anvika' in that style.", "The performance must last at least 20 seconds.", "Everyone must participate."] },
      ],
      finish: "Children may look embarrassed. Report to Anvika's parents for judging.",
    },
  },
  {
    number: 6,
    slug: "baby-charades",
    icon: "baby",
    title: "Baby Charades",
    teaser: "Act out three secret words - as a baby.",
    challenge: {
      intro: "Collect three secret baby-word slips from Anvika's parents. Only the chosen adult actor may look at them.",
      blocks: [
        { title: "The rules", lines: ["The rest of the family must guess each word.", "No talking.", "No pointing at a real baby.", "No objects.", "Everything must be performed as a baby."] },
      ],
      finish: "Your family must guess all three words before you report back.",
    },
  },
  {
    number: 7,
    slug: "dont-laugh",
    icon: "smiley",
    title: "Don't Laugh",
    teaser: "One comedian versus the world's most serious family.",
    challenge: {
      intro: "Choose one comedian. Everyone else becomes the serious family.",
      blocks: [
        { title: "You have 45 seconds", lines: ["The comedian may make ridiculous faces, dance, make baby noises, or walk strangely.", "The comedian may not touch anyone."] },
        { title: "How to win", lines: ["If anyone laughs, the comedian wins.", "If nobody laughs, the family wins.", "Either way, Anvika wins."] },
      ],
      finish: "Report your result to Anvika's parents.",
    },
  },
  {
    number: 8,
    slug: "baby-brain-test",
    icon: "brain",
    title: "The Memory Challenge",
    teaser: "Can your family outsmart Anvika's baby brain test?",
    challenge: {
      intro: "Anvika's parents will show you a tray with six objects. You have 20 seconds to memorise them.",
      blocks: [
        { title: "Then turn around", lines: ["Anvika's parents remove one item.", "Turn back and identify what is missing in 10 seconds.", "If you are wrong, you get one more attempt - but only 10 seconds to memorise."] },
      ],
      finish: "Found the missing object? Report to Anvika's parents.",
    },
  },
  {
    number: 9,
    slug: "freeze-dance",
    icon: "dance",
    title: "Freeze Dance",
    teaser: "Dance until you hear the birthday girl's name.",
    challenge: {
      intro: "Everyone dances while Anvika's parents play music.",
      blocks: [
        { title: "When they shout 'ANVIKA!'", lines: ["Everyone must freeze.", "Anyone still moving is eliminated.", "Continue until one family member remains."] },
        { title: "Important rule", lines: ["Babies cannot be eliminated. Babies are above the law."] },
      ],
      finish: "Crown your winner, then report to Anvika's parents.",
    },
  },
  {
    number: 10,
    slug: "anvika-says",
    icon: "crown",
    title: "The Slow-Motion Birthday Party",
    teaser: "Throw the slowest, silliest celebration ever.",
    challenge: {
      intro: "Your family must perform a 30-second birthday party entirely in slow motion.",
      blocks: [
        { title: "Your scene", lines: ["One person carries an imaginary birthday cake.", "Everyone else celebrates, dances, and reacts in exaggerated slow motion."] },
        { title: "The rules", lines: ["No normal-speed movements.", "Everyone must take part.", "Finish together in a frozen baby-face pose."] },
      ],
      finish: "Performance complete? Report to Anvika's parents for approval.",
    },
  },
];

export const teamSlugs = teams.map(({ slug }) => slug);
