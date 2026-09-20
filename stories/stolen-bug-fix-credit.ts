import type { ChatVideo } from "../src/schema/video";

export const video: ChatVideo = {
  id: "stolen-bug-fix-credit",

  settings: {
    language: "ar",
    direction: "rtl",
    fps: 30,
  },

  ambience: {
    src: "audio/office-ambience.mp3",
    volume: 0.06,
  },

  hook: {
    text: "لما تقعد ساعتين تصلح Bug… وزميلك ياخد الـ Credit عشان هو اللي ضغط Deploy",
    highlights: ["تصلح Bug", "ياخد الـ Credit"],
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
    // ACT 1 — ANOTHER BILLING PROBLEM
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "11:06 ص",

      overlays: [
        {
          type: "notification",
          source: "Monitoring",
          title: "Billing Service Warning",
          body: "Duplicate payment retries detected",
          delayFrames: 5,
          durationFrames: 55,
          sound: "warning",
        },
      ],

      messages: [
        {
          text: "يا جماعة عندنا مشكلة في الـ Billing تاني.",
          state: "warning",
          highlights: ["Billing"],
        },
        {
          text: "في Payments بتعمل Retry مرتين.",
          state: "shock",
          highlights: ["Retry مرتين"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "11:07 ص",

      messages: [
        {
          text: "شايفها.",
          state: "normal",
        },
        {
          text: "هفتح الـ logs.",
          state: "important",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "tension",
      camera: "static",
      timestamp: "11:07 ص",

      messages: [
        {
          text: "محتاجين Fix بسرعة.",
          state: "warning",
        },
        {
          text: "الـ Client واخد باله.",
          state: "bad-news",
        },
      ],
    },

    // ====================================================
    // ACT 2 — AHMED INVESTIGATES
    // ====================================================

    {
      type: "time-passage",
      label: "بعد 45 دقيقة",
      style: "clock",
      sound: "clock",
      durationFrames: 28,
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "reveal",
      camera: "slow-push",
      timestamp: "11:52 ص",

      messages: [
        {
          text: "لقيتها.",
          state: "good-news",
        },
        {
          text: "في Race Condition بين الـ Retry Worker والـ Webhook.",
          state: "reveal",
          highlights: ["Race Condition"],
        },
        {
          text: "الاتنين ساعات بيمسكوا نفس Payment.",
          state: "important",
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "normal",
      camera: "static",
      timestamp: "11:53 ص",

      messages: [
        {
          text: "Makes sense.",
          state: "normal",
        },
        {
          text: "إنت هتعمل Lock؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "11:53 ص",

      messages: [
        {
          text: "آه، مع idempotency check قبل الـ retry.",
          state: "important",
        },
        {
          text: "هرفع PR دلوقتي.",
          state: "normal",
        },
      ],
    },

    // ====================================================
    // THE FIX
    // ====================================================

    {
      type: "time-passage",
      label: "بعد 38 دقيقة",
      style: "clock",
      sound: "clock",
      durationFrames: 26,
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "relief",
      camera: "focus-attachment",
      timestamp: "12:31 م",

      messages: [
        {
          id: "ahmed-pr",
          text: "الـ Fix جاهز.",
          state: "good-news",

          attachment: {
            type: "link",
            title: "PR #482 — Prevent duplicate payment retries",
            description:
              "Add idempotency guard and lock retry processing",
            domain: "github.com",
          },
        },
        {
          text: "عمر راجعه وقالي تمام.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "relief",
      camera: "static",
      timestamp: "12:31 م",

      messages: [
        {
          text: "Approved ✅",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // YOUSSEF ONLY HAS TO DEPLOY
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "12:32 م",

      messages: [
        {
          text: "يوسف أنا داخل Appointment دلوقتي.",
          state: "normal",
        },
        {
          text: "ممكن تعمل Merge وDeploy؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "normal",
      camera: "static",
      timestamp: "12:32 م",

      messages: [
        {
          text: "أكيد.",
          state: "good-news",
        },
        {
          text: "سيبهولي 👌",
          state: "good-news",
        },
      ],
    },

    {
      type: "presence",
      person: "ahmed",
      status: "offline",
      delayFrames: 12,
    },

    // ====================================================
    // DEPLOY
    // ====================================================

    {
      type: "time-passage",
      label: "بعد 15 دقيقة",
      style: "clock",
      sound: "clock",
      durationFrames: 24,
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "relief",
      camera: "slow-push",
      timestamp: "12:47 م",

      overlays: [
        {
          type: "notification",
          source: "GitHub",
          title: "Deployment successful",
          body: "billing-service • production",
          delayFrames: 10,
          durationFrames: 50,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "Deploy خلص ✅",
          state: "good-news",
        },
        {
          text: "والـ errors نزلت.",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "relief",
      camera: "static",
      timestamp: "12:48 م",

      messages: [
        {
          text: "جامد يا يوسف 🔥",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // MISUNDERSTANDING STARTS
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "reveal",
      camera: "focus-message",
      timestamp: "12:48 م",

      messages: [
        {
          id: "youssef-credit",
          text: "Great ownership يا يوسف.",
          state: "good-news",
          highlights: ["Great ownership"],
        },
        {
          text: "أنقذت الـ Billing النهارده.",
          state: "good-news",
          highlights: ["أنقذت الـ Billing"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "12:48 م",

      messages: [
        {
          text: "تسلم ❤️",
          state: "good-news",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 22,
                interrupted: true,
              },
            ],
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "sara",
      beat: "relief",
      camera: "static",
      timestamp: "12:49 م",

      overlays: [
        {
          type: "notification",
          source: "People Portal",
          title: "Kudos sent",
          body: "Youssef • Ownership",
          delayFrames: 20,
          durationFrames: 55,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "👏👏",
          state: "good-news",
        },
        {
          text: "Well done يوسف!",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // AHMED COMES BACK
    // ====================================================

    {
      type: "time-passage",
      label: "بعد ساعة",
      style: "clock",
      sound: "clock",
      durationFrames: 26,
    },

    {
      type: "presence",
      person: "ahmed",
      status: "online",
      delayFrames: 10,
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "1:51 م",

      messages: [
        {
          text: "رجعت.",
          state: "normal",
        },
        {
          text: "الـ Fix عامل إيه؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "relief",
      camera: "static",
      timestamp: "1:51 م",

      messages: [
        {
          text: "تمام الحمد لله.",
          state: "good-news",
        },
        {
          text: "يوسف ظبط الدنيا 🔥",
          state: "good-news",
          highlights: ["يوسف ظبط الدنيا"],
        },
      ],
    },

    // ====================================================
    // AHMED REALIZES
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "slow-push",
      timestamp: "1:52 م",

      messages: [
        {
          text: "...",
          state: "hesitant",
        },
        {
          text: "يوسف ظبط إيه بالظبط؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "1:52 م",

      messages: [
        {
          text: "الـ Bug.",
          state: "normal",
        },
        {
          text: "عمل Fix وDeploy.",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "1:52 م",

      messages: [
        {
          text: "عمل Fix؟",
          state: "shock",
        },
      ],
    },

    // ====================================================
    // RECEIPTS
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "reveal",
      camera: "focus-attachment",
      timestamp: "1:53 م",

      messages: [
        {
          text: "ده الـ PR.",
          state: "normal",

          replyTo: {
            messageId: "ahmed-pr",
            speaker: "ahmed",
            previewText: "الـ Fix جاهز.",
          },

          attachment: {
            type: "link",
            title: "PR #482 — Prevent duplicate payment retries",
            description: "Author: Ahmed • Approved by Omar",
            domain: "github.com",
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "conflict",
      camera: "focus-message",
      timestamp: "1:53 م",

      messages: [
        {
          text: "أنا اللي لقيت الـ Root Cause.",
          state: "angry",
          highlights: ["أنا"],
        },
        {
          text: "أنا اللي كتبت الـ Fix.",
          state: "angry",
          highlights: ["أنا"],
        },
        {
          text: "يوسف ضغط Deploy.",
          state: "important",
          highlights: ["ضغط Deploy"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "1:54 م",

      messages: [
        {
          text: "هو عنده حق.",
          state: "hesitant",
        },
        {
          text: "أحمد هو اللي حل المشكلة.",
          state: "important",
          highlights: ["أحمد"],
        },
        {
          text: "أنا عملت Merge وDeploy بس.",
          state: "normal",
        },
      ],
    },

    // ====================================================
    // AHMED VS YOUSSEF
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "conflict",
      camera: "focus-message",
      timestamp: "1:54 م",

      messages: [
        {
          text: "طب لما قالك أنقذت الـ Billing...",
          state: "warning",
        },
        {
          text: "قولتله تسلم ليه؟",
          state: "angry",

          replyTo: {
            messageId: "youssef-credit",
            speaker: "mahmoud",
            previewText: "Great ownership يا يوسف.",
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "comedic",
      camera: "static",
      timestamp: "1:55 م",

      messages: [
        {
          text: "اتوترت 😭",
          state: "hesitant",
        },
        {
          text: "الـ Praise جه فجأة.",
          state: "sarcastic",
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "1:55 م",

      messages: [
        {
          text: "فجأة خدت الـ Credit معاه؟",
          state: "sarcastic",
        },
      ],
    },

    // ====================================================
    // MAHMOUD'S SOLUTION
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "slow-push",
      timestamp: "1:55 م",

      messages: [
        {
          text: "يا جماعة مش محتاجين نحولها لمشكلة.",
          state: "warning",
        },
        {
          text: "في الآخر ده Team Effort.",
          state: "important",
          highlights: ["Team Effort"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "1:56 م",

      messages: [
        {
          text: "غريبة.",
          state: "sarcastic",
        },
        {
          text: "من ساعة كان اسمه يوسف.",
          state: "sarcastic",
        },
        {
          text: "دلوقتي بقى Team Effort.",
          state: "sarcastic",
          highlights: ["Team Effort"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "comedic",
      camera: "static",
      timestamp: "1:56 م",

      messages: [
        {
          text: "تقنيًا...",
          state: "hesitant",
        },
        {
          text: "أحمد كتب 96% من الـ changes.",
          state: "important",
          highlights: ["96%"],
        },
        {
          text: "يوسف غيّر الـ version number.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "1:56 م",

      messages: [
        {
          text: "وكان Version Number محترم بصراحة.",
          state: "sarcastic",
        },
      ],
    },

    // ====================================================
    // HR TRIES TO HELP
    // ====================================================

    {
      type: "messages",
      speaker: "sara",
      beat: "normal",
      camera: "static",
      timestamp: "1:57 م",

      messages: [
        {
          text: "مهم جدًا الـ Recognition يكون واضح ❤️",
          state: "important",
          highlights: ["Recognition"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "relief",
      camera: "static",
      timestamp: "1:57 م",

      messages: [
        {
          text: "تمام.",
          state: "normal",
        },
        {
          text: "صححتها.",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "reveal",
      camera: "focus-message",
      timestamp: "1:57 م",

      messages: [
        {
          id: "fixed-recognition",
          text: "شكر كبير للفريق على حل مشكلة الـ Billing 👏",
          state: "good-news",

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "❤️",
                from: "sara",
                delayFrames: 12,
              },
            ],
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "1:58 م",

      messages: [
        {
          text: "...",
          state: "hesitant",
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "1:58 م",

      messages: [
        {
          text: "أنا بقالي 5 دقايق بحاول أدخل اسمي في الجملة.",
          state: "sarcastic",
          highlights: ["اسمي"],
        },
      ],
    },

    // ====================================================
    // FINAL ESCALATION
    // ====================================================

    {
      type: "time-passage",
      label: "بعد 10 دقايق",
      style: "minimal",
      sound: "none",
      durationFrames: 20,
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "slow-push",
      timestamp: "2:08 م",

      overlays: [
        {
          type: "notification",
          source: "Calendar",
          title: "Engineering All Hands",
          body: "Youssef — How we fixed Billing retries",
          delayFrames: 10,
          durationFrames: 60,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "يوسف...",
          state: "normal",
        },
        {
          text: "محتاجك تعرض الـ Incident في الـ All Hands بكرة.",
          state: "important",
          highlights: ["All Hands"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "2:08 م",

      messages: [
        {
          text: "أنا؟",
          state: "shock",
        },
        {
          text: "بس أنا معرفش الـ Root Cause بالتفصيل أصلًا.",
          state: "warning",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "2:09 م",

      messages: [
        {
          text: "مفيش مشكلة.",
          state: "good-news",
        },
        {
          text: "أحمد يجهزلك 3 Slides بالـ technical details.",
          state: "important",
          highlights: ["أحمد", "3 Slides"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "payoff",
      camera: "slow-push",
      timestamp: "2:09 م",

      messages: [
        {
          text: "محمود...",
          state: "warning",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 30,
                interrupted: true,
              },
            ],

            after: [
              {
                type: "reaction",
                emoji: "💀",
                from: "youssef",
                delayFrames: 16,
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
      delayFrames: 15,
    },
  ],
}
