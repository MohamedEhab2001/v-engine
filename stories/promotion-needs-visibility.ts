import type { ChatVideo } from "../src/schema/video";

export const video: ChatVideo = {
  id: "promotion-needs-visibility",

  settings: {
    language: "ar",
    direction: "rtl",
    fps: 30,
  },

  workspaceName: "NOVA",

  channels: {
    engineering: {
      name: "engineering",
      topic: "Engineering team discussions",
      icon: "⚙️",
    },

    "career-ahmed": {
      name: "career-ahmed",
      topic: "Career growth & performance",
      icon: "📈",
    },
  },

  ambience: {
    src: "audio/office-ambience.mp3",
    volume: 0.06,
  },

  hook: {
    text: "لما تطلب Promotion بعد ما أنقذت الـ Billing… ويقولولك محتاج Visibility أكتر",
    highlights: ["Promotion", "Visibility أكتر"],
  },

  people: {
    ahmed: {
      name: "أحمد",
      role: "Senior Software Engineer",
      avatar: "avatars/ahmed.png",
      gender: "m",
    },

    mahmoud: {
      name: "محمود",
      role: "Engineering Manager",
      avatar: "avatars/manager.png",
      gender: "m",
    },

    sara: {
      name: "سارة",
      role: "HR Business Partner",
      avatar: "avatars/sara.png",
      gender: "f",
    },

    omar: {
      name: "عمر",
      role: "Tech Lead",
      avatar: "avatars/omar.png",
      gender: "m",
    },

    youssef: {
      name: "يوسف",
      role: "Software Engineer",
      avatar: "avatars/youssef.png",
      gender: "m",
    },
  },

  screens: [
    // ====================================================
    // ACT 1 — AFTER THE ALL HANDS
    // ====================================================

    {
      type: "messages",
      channel: "engineering",
      speaker: "mahmoud",
      beat: "relief",
      camera: "channel-focus",
      timestamp: "11:07 ص",

      overlays: [
        {
          type: "notification",
          source: "People Portal",
          title: "Kudos sent to Youssef",
          body: "Great presentation & ownership 👏",
          delayFrames: 12,
          durationFrames: 55,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "Presentation ممتازة يا يوسف 👏🔥",
          state: "good-news",
          highlights: ["يوسف"],
        },

        {
          text: "شرحت الـ Billing Incident بشكل واضح جدًا.",
          state: "good-news",
        },

        {
          text: "Great visibility.",
          state: "important",
          highlights: ["visibility"],
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "sara",
      beat: "relief",
      camera: "static",
      timestamp: "11:08 ص",

      messages: [
        {
          text: "👏👏👏",
          state: "good-news",
        },

        {
          text: "مبروك يا يوسف ❤️",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "youssef",
      beat: "normal",
      camera: "static",
      timestamp: "11:08 ص",

      messages: [
        {
          text: "تسلموا يا جماعة ❤️",
          state: "good-news",
        },

        {
          text: "بس الـ technical details كلها أحمد اللي جهزها.",
          state: "important",
          highlights: ["أحمد"],
        },

        {
          text: "أنا حرفيًا كنت بقرا الـ slides 😅",
          state: "hesitant",
        },
      ],
    },

    // ====================================================
    // AHMED WATCHES THE PRAISE
    // ====================================================

    {
      type: "messages",
      channel: "engineering",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "slow-push",
      timestamp: "11:09 ص",

      messages: [
        {
          text: "عاش يا يوسف ❤️",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "omar",
      beat: "comedic",
      camera: "static",
      timestamp: "11:09 ص",

      messages: [
        {
          text: "والـ Bug نفسه أحمد اللي حله أصلًا 😂",
          state: "sarcastic",
          highlights: ["أحمد"],
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "11:10 ص",

      messages: [
        {
          text: "أكيد.",
          state: "normal",
        },

        {
          text: "كل واحد كان ليه دور مهم.",
          state: "important",
        },

        {
          text: "Team Effort ❤️",
          state: "good-news",
          highlights: ["Team Effort"],
        },
      ],
    },

    // ====================================================
    // AHMED OPENS THE PROMOTION TOPIC
    // ====================================================

    {
      type: "messages",
      channel: "engineering",
      speaker: "ahmed",
      beat: "tension",
      camera: "focus-message",
      timestamp: "11:12 ص",

      messages: [
        {
          text: "محمود، بالمناسبة...",
          state: "hesitant",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 25,
                interrupted: true,
              },
            ],
          },
        },

        {
          text: "ممكن نتكلم في موضوع الـ Promotion؟",
          state: "question",
          highlights: ["Promotion"],
        },
      ],
    },

    // ====================================================
    // NEW PRIVATE CHANNEL
    // ====================================================

    {
      type: "channel-create",
      channel: "career-ahmed",
      by: "mahmoud",
      reason: "علشان كلام الـ Career Progression",
      timestamp: "11:14 ص",
      durationFrames: 55,
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "normal",
      camera: "channel-focus",
      timestamp: "11:14 ص",

      messages: [
        {
          text: "تمام.",
          state: "normal",
        },

        {
          text: "كنت ناوي أتكلم معاك أصلًا.",
          state: "good-news",
        },

        {
          text: "تقنيًا إنت من أقوى الناس عندنا.",
          state: "good-news",
          highlights: ["أقوى الناس"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "relief",
      camera: "static",
      timestamp: "11:15 ص",

      messages: [
        {
          text: "تمام ❤️",
          state: "good-news",
        },

        {
          text: "فأنا شايف إني جاهز للـ next level.",
          state: "important",
          highlights: ["next level"],
        },
      ],
    },

    // ====================================================
    // THE "BUT"
    // ====================================================

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "tension",
      camera: "slow-push",
      timestamp: "11:15 ص",

      messages: [
        {
          text: "بص...",
          state: "hesitant",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 32,
                interrupted: true,
              },
            ],
          },
        },

        {
          text: "من ناحية Technical مفيش كلام.",
          state: "good-news",
        },

        {
          id: "visibility-problem",
          text: "بس محتاج Visibility أكتر.",
          state: "bad-news",
          highlights: ["Visibility أكتر"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "11:16 ص",

      messages: [
        {
          text: "Visibility؟",
          state: "shock",
        },

        {
          text: "أنا اللي حليت الـ Billing Incident.",
          state: "important",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "11:16 ص",

      messages: [
        {
          text: "عارف.",
          state: "normal",
        },

        {
          text: "وده Technical Execution ممتاز.",
          state: "good-news",
          highlights: ["Technical Execution"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "conflict",
      camera: "focus-message",
      timestamp: "11:17 ص",

      messages: [
        {
          text: "وأنا اللي عملت الـ Root Cause Analysis.",
          state: "important",
        },

        {
          text: "وأنا اللي كتبت الـ Fix.",
          state: "important",
        },

        {
          text: "وأنا اللي جهزت الـ Slides اللي يوسف عرضها من شوية.",
          state: "angry",
          highlights: ["أنا"],
        },
      ],
    },

    // ====================================================
    // THE CORPORATE LOGIC
    // ====================================================

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "reveal",
      camera: "focus-message",
      timestamp: "11:17 ص",

      messages: [
        {
          text: "بالظبط.",
          state: "normal",
        },

        {
          text: "بس مين اللي كان واقف قدام الشركة؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "11:18 ص",

      messages: [
        {
          text: "...",
          state: "hesitant",
        },

        {
          text: "يوسف.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "payoff",
      camera: "slow-push",
      timestamp: "11:18 ص",

      messages: [
        {
          text: "أهو.",
          state: "good-news",
        },

        {
          text: "ده الـ Visibility اللي بتكلم عليه.",
          state: "important",
          highlights: ["Visibility"],
        },
      ],
    },

    // ====================================================
    // SARA JOINS
    // ====================================================

    {
      type: "group-event",
      event: "added",
      person: "sara",
      by: "mahmoud",
      timestamp: "11:19 ص",
      durationFrames: 42,
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "normal",
      camera: "static",
      timestamp: "11:19 ص",

      messages: [
        {
          text: "هاي أحمد ❤️",
          state: "good-news",
        },

        {
          text: "محمود شاركني الـ context.",
          state: "normal",
        },

        {
          text: "الـ next level محتاج Leadership Presence.",
          state: "important",
          highlights: ["Leadership Presence"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "tension",
      camera: "focus-message",
      timestamp: "11:20 ص",

      messages: [
        {
          text: "يعني أعمل إيه تحديدًا؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "normal",
      camera: "static",
      timestamp: "11:20 ص",

      messages: [
        {
          text: "تظهر أكتر.",
          state: "important",
        },

        {
          text: "تشارك في Discussions.",
          state: "normal",
        },

        {
          text: "تقدم Presentations.",
          state: "normal",
        },

        {
          text: "تبني Personal Brand جوه الشركة.",
          state: "important",
          highlights: ["Personal Brand"],
        },
      ],
    },

    // ====================================================
    // AHMED CONNECTS THE DOTS
    // ====================================================

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "comedic",
      camera: "slow-push",
      timestamp: "11:21 ص",

      messages: [
        {
          text: "طب ثانية.",
          state: "warning",
        },

        {
          text: "أنا أصلحت المشكلة.",
          state: "normal",
        },

        {
          text: "يوسف عرض الحل.",
          state: "normal",
        },

        {
          text: "فهو عنده Visibility...",
          state: "hesitant",
        },

        {
          text: "وأنا محتاج Visibility؟",
          state: "shock",
          highlights: ["أنا محتاج Visibility؟"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "static",
      timestamp: "11:21 ص",

      messages: [
        {
          text: "بالظبط.",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "11:21 ص",

      messages: [
        {
          text: "طب حلو إننا متفقين على المشكلة.",
          state: "sarcastic",
        },
      ],
    },

    // ====================================================
    // WHAT DOES  NEXT LEVEL REQUIRE?
    // ====================================================

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "11:22 ص",

      messages: [
        {
          text: "طيب الـ Promotion محتاجة إيه كمان؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "11:22 ص",

      messages: [
        {
          text: "Mentoring.",
          state: "important",
        },

        {
          text: "تساعد الناس حواليك تكبر.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "reveal",
      camera: "focus-message",
      timestamp: "11:22 ص",

      messages: [
        {
          text: "أنا اللي قعدت مع يوسف وجهزته للـ Presentation.",
          state: "important",
          highlights: ["جهزته"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "relief",
      camera: "static",
      timestamp: "11:23 ص",

      messages: [
        {
          text: "وده ممتاز جدًا ❤️",
          state: "good-news",
        },

        {
          text: "ده دليل قوي على Mentoring.",
          state: "important",
          highlights: ["Mentoring"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "11:23 ص",

      messages: [
        {
          text: "جميل.",
          state: "normal",
        },

        {
          text: "يبقى أنا كده جاهز؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "11:23 ص",

      messages: [
        {
          text: "لسه محتاج Visibility.",
          state: "bad-news",
          highlights: ["Visibility"],
        },
      ],
    },

    // ====================================================
    // FIVE MINUTES LATER
    // ====================================================

    {
      type: "time-passage",
      label: "بعد 5 دقايق",
      style: "minimal",
      sound: "none",
      durationFrames: 22,
    },

    // ====================================================
    // BACK TO ENGINEERING
    // ====================================================

    {
      type: "messages",
      channel: "engineering",
      speaker: "mahmoud",
      beat: "normal",
      camera: "channel-focus",
      timestamp: "11:29 ص",

      overlays: [
        {
          type: "notification",
          source: "Calendar",
          title: "Architecture Spotlight",
          body: "Presenter: Youssef • Thursday 2:00 PM",
          delayFrames: 15,
          durationFrames: 60,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "يوسف 🔥",
          state: "good-news",
        },

        {
          text: "عايزك تقدم الـ Architecture Spotlight الخميس الجاي.",
          state: "important",
          highlights: ["Architecture Spotlight"],
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "youssef",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "11:29 ص",

      messages: [
        {
          text: "أنا؟ 😅",
          state: "hesitant",
        },

        {
          text: "بس أنا مش فاهم الجزء ده قوي.",
          state: "warning",
        },
      ],
    },

    // ====================================================
    // FINAL ESCALATION
    // ====================================================

    {
      type: "messages",
      channel: "engineering",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "slow-push",
      timestamp: "11:30 ص",

      messages: [
        {
          text: "ولا يهمك.",
          state: "good-news",
        },

        {
          text: "أحمد يجهزك ❤️",
          state: "good-news",
          highlights: ["أحمد"],
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "11:30 ص",

      messages: [
        {
          text: "...",
          state: "hesitant",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 34,
                interrupted: true,
              },
            ],
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "ahmed",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "11:30 ص",

      messages: [
        {
          text: "أنا بس بتأكد...",
          state: "hesitant",
        },

        {
          text: "أنا هجهزه علشان هو يبقى Visible...",
          state: "sarcastic",
        },

        {
          text: "عشان أنا محتاج أبقى Visible؟",
          state: "sarcastic",
          highlights: ["هو يبقى Visible", "أنا محتاج أبقى Visible"],
        },
      ],
    },

    {
      type: "messages",
      channel: "engineering",
      speaker: "mahmoud",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "11:31 ص",

      messages: [
        {
          text: "بص عليها إنها Leadership Opportunity ❤️",
          state: "good-news",
          highlights: ["Leadership Opportunity"],

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "💀",
                from: "omar",
                delayFrames: 16,
              },

              {
                type: "reaction",
                emoji: "😭",
                from: "youssef",
                delayFrames: 24,
              },
            ],
          },
        },
      ],
    },

    {
      type: "presence",
      person: "ahmed",
      status: "dnd",
      delayFrames: 18,
    },
  ],
};
