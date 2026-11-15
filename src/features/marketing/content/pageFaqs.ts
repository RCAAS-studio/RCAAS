// Shared by rendered FAQ sections and structured data. Keep answers identical.

export const GAME_WORLDS_FAQS = [
  {
    question: 'Which game engines do you work with?',
    answer: 'We build for Unreal and Unity, and for other real-time experiences.',
  },
  {
    question: 'Can you capture heritage sites for a game?',
    answer:
      "Yes, with proper permission from the people who care for the site. We follow each site's rules and capture without touching or disturbing the structure.",
  },
];

export const COMPARISON_FAQS: { question: string; answer: string }[] = [
  {
    question: 'Is a 3D tour just a better 360° tour?',
    answer:
      'Not exactly. They are different formats. A 360° tour is a set of panoramas; a 3D tour is a full model of the space. 3D gives more freedom and a truer sense of space, while 360° is quicker and lighter. Each fits different needs.',
  },
  {
    question: 'Will a 3D tour work on phones?',
    answer:
      'Yes. Photorealistic 3D tours run in modern mobile browsers with nothing to install. They are heavier than photos, so they work best when loaded only when the viewer chooses to open them.',
  },
  {
    question: 'Can I make a video from a 3D tour?',
    answer:
      "Yes. Once a place is captured in 3D, cinematic fly-through films and still images can be produced from the model, including camera moves a normal camera can't make.",
  },
  {
    question: 'Which is cheapest?',
    answer:
      'Usually a 360° photo tour, then 3D, with video varying the most depending on production. The better question is which one will help your audience decide.',
  },
];

export const GAUSSIAN_FAQS = [
  {
    question: 'Is Gaussian splatting the same as a 360° photo?',
    answer:
      'No. A 360° photo is a panorama seen from one point. A Gaussian splat scene is a full 3D scene you can move through and view from any angle.',
  },
  {
    question: 'Is it the same as NeRF?',
    answer:
      'They are related. Both create photorealistic 3D scenes from images. NeRF uses a neural network to represent the scene, while Gaussian splatting uses explicit Gaussians, which makes real-time viewing much more practical.',
  },
  {
    question: 'Can I measure from a Gaussian splat scene?',
    answer:
      'Not reliably on its own. For measurements, the scene should be combined with laser scanning or survey control, which is how we work.',
  },
  {
    question: 'Does it need special software to view?',
    answer: 'No. Scenes can be viewed in a modern web browser on a phone, tablet or computer. VR needs a headset.',
  },
];
