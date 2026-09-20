import type { ChatVideo } from "../src/schema/video";

export const video: ChatVideo = {
  id: "documentation-disaster",

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
    text: "لما مديرك يقول: مش محتاجين Documentation… وبعد شهر محدش فاهم السيستم",
    highlights: ["مش محتاجين Documentation", "محدش فاهم السيستم"],
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

    sara: {
      name: "سارة",
      role: "HR Business Partner",
      avatar: "avatars/sara.png",
      gender: "f",
    },
  },

  screens: [
    // ====================================================
    // ACT 1 — SERVICE FINISHED
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "relief",
      camera: "slow-push",
      timestamp: "3:12 م",
      messages: [
        {
          text: "الـ Billing Service خلصت واترفعت Production ✅",
          state: "good-news",
          highlights: ["Billing Service", "Production"],
        },
        {
          text: "محتاج بس يومين أكتب الـ Documentation والـ Runbook.",
          state: "important",
          highlights: ["Documentation", "Runbook"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "3:13 م",
      messages: [
        {
          text: "يومين؟",
          state: "question",
        },
        {
          text: "على Documentation؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "3:13 م",
      messages: [
        {
          text: "السيستم فيه Webhooks وQueues وRetries وحاجات كتير مترابطة.",
          state: "important",
        },
        {
          text: "لو حصل Incident لازم أي حد يعرف يتصرف.",
          state: "warning",
          highlights: ["أي حد"],
        },
      ],
    },

    // ====================================================
    // THE FAMOUS DECISION
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "3:14 م",
      messages: [
        {
          id: "no-docs-needed",
          text: "بصراحة مش محتاجين Documentation دلوقتي.",
          state: "important",
          highlights: ["مش محتاجين Documentation"],
        },
        {
          id: "code-is-docs",
          text: "الكود نفسه هو الـ Documentation.",
          state: "good-news",
          highlights: ["الكود نفسه"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "3:14 م",
      messages: [
        {
          text: "...",
          state: "hesitant",
        },
        {
          text: "الكود نفسه؟",
          state: "question",

          replyTo: {
            messageId: "code-is-docs",
            speaker: "mahmoud",
            previewText: "الكود نفسه هو الـ Documentation.",
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "3:15 م",
      messages: [
        {
          text: "آه.",
          state: "normal",
        },
        {
          text: "إنت كاتب Clean Code.",
          state: "good-news",
        },
        {
          text: "وأي حد محتاج حاجة يسألك.",
          state: "normal",
        },
      ],
    },

    // ====================================================
    // OMAR WARNS HIM
    // ====================================================

    {
      type: "messages",
      speaker: "omar",
      beat: "tension",
      camera: "slow-push",
      timestamp: "3:15 م",
      messages: [
        {
          text: "بس كده أحمد نفسه بقى جزء من الـ Infrastructure.",
          state: "warning",
          highlights: ["جزء من الـ Infrastructure"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "static",
      timestamp: "3:16 م",
      messages: [
        {
          text: "ما هو أحمد مش هيروح في حتة 😂",
          state: "sarcastic",

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "😐",
                from: "ahmed",
                delayFrames: 15,
              },
            ],
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "normal",
      camera: "static",
      timestamp: "3:16 م",
      messages: [
        {
          text: "طب لو احتجت أفهم الـ Billing Flow؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "3:16 م",
      messages: [
        {
          text: "اسأل أحمد.",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // ONE MONTH LATER
    // ====================================================

    {
      type: "time-passage",
      label: "بعد شهر",
      style: "calendar",
      sound: "swoosh",
      dates: [
        "12 أكتوبر",
        "19 أكتوبر",
        "26 أكتوبر",
        "12 نوفمبر",
      ],
      durationFrames: 36,
    },

    {
      type: "presence",
      person: "ahmed",
      status: "offline",
      delayFrames: 12,
    },

    // ====================================================
    // PRODUCTION INCIDENT
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "10:07 ص",

      overlays: [
        {
          type: "notification",
          source: "Monitoring",
          title: "Billing Service Alert",
          body: "Failed payments: 23% and rising",
          delayFrames: 5,
          durationFrames: 60,
          sound: "warning",
        },
      ],

      messages: [
        {
          text: "يا جماعة الـ Payments واقعة.",
          state: "shock",
          highlights: ["Payments واقعة"],
        },
        {
          text: "أحمد فين؟",
          state: "warning",
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "tension",
      camera: "static",
      timestamp: "10:08 ص",
      messages: [
        {
          text: "أجازة النهارده.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "shock",
      camera: "focus-message",
      timestamp: "10:08 ص",
      messages: [
        {
          text: "طب افتحوا الـ Runbook.",
          state: "important",
          highlights: ["Runbook"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "reveal",
      camera: "focus-attachment",
      timestamp: "10:09 ص",
      messages: [
        {
          text: "ده كل اللي لقيته.",
          state: "hesitant",

          attachment: {
            type: "document",
            title: "README.md",
            meta: "Last updated: 1 month ago • 184 bytes",
            icon: "file",
          },
        },
        {
          text: "مكتوب فيه:",
          state: "normal",
        },
        {
          text: "\"TODO: add documentation later\"",
          state: "reveal",
          highlights: ["TODO"],
        },
      ],
    },

    // ====================================================
    // "JUST READ THE CODE"
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "tension",
      camera: "static",
      timestamp: "10:09 ص",
      messages: [
        {
          text: "طيب بصوا في الكود.",
          state: "important",
        },
        {
          text: "أحمد كان كاتبه Clean.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "10:10 ص",
      messages: [
        {
          text: "محمود.",
          state: "warning",
        },
        {
          text: "فيه 47 ملف.",
          state: "important",
          highlights: ["47 ملف"],
        },
        {
          text: "و3 Queues.",
          state: "important",
        },
        {
          text: "وWebhook جاي من Provider محدش فينا لمسه قبل كده.",
          state: "warning",
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "comedic",
      camera: "static",
      timestamp: "10:10 ص",
      messages: [
        {
          text: "أنا لقيت Function اسمها:",
          state: "normal",
        },
        {
          text: "handleFinalFinalPaymentRetryV2",
          state: "shock",
          highlights: ["FinalFinal", "V2"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "10:10 ص",
      messages: [
        {
          text: "Clean جدًا.",
          state: "sarcastic",
        },
      ],
    },

    // ====================================================
    // THEY TRY TO FIX IT
    // ====================================================

    {
      type: "call",
      caller: "mahmoud",
      mode: "accepted",
      durationFrames: 30,
      callDurationLabel: "00:27:18",
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "tension",
      camera: "static",
      timestamp: "10:39 ص",
      messages: [
        {
          text: "جربت أعمل Restart للـ Worker.",
          state: "hesitant",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "static",
      timestamp: "10:39 ص",
      messages: [
        {
          text: "والدنيا؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "10:39 ص",

      overlays: [
        {
          type: "notification",
          source: "Monitoring",
          title: "Billing Service Alert",
          body: "Failed payments: 91%",
          delayFrames: 10,
          durationFrames: 55,
          sound: "warning",
        },
      ],

      messages: [
        {
          text: "بقت أوحش.",
          state: "bad-news",
        },
      ],
    },

    // ====================================================
    // CALL AHMED
    // ====================================================

    {
      type: "call",
      caller: "mahmoud",
      mode: "incoming",
      durationFrames: 28,
    },

    {
      type: "call",
      caller: "mahmoud",
      mode: "missed",
      durationFrames: 18,
    },

    {
      type: "call",
      caller: "mahmoud",
      mode: "incoming",
      durationFrames: 24,
    },

    {
      type: "call",
      caller: "mahmoud",
      mode: "missed",
      durationFrames: 18,
    },

    {
      type: "presence",
      person: "ahmed",
      status: "online",
      delayFrames: 15,
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "normal",
      camera: "static",
      timestamp: "10:46 ص",
      messages: [
        {
          text: "في إيه يا جماعة؟",
          state: "question",
        },
        {
          text: "لقيت 6 missed calls.",
          state: "warning",
          highlights: ["6 missed calls"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "tension",
      camera: "focus-message",
      timestamp: "10:46 ص",
      messages: [
        {
          text: "الـ Billing Service واقعة.",
          state: "bad-news",
        },
        {
          text: "ومحدش فاهم تتصلح إزاي.",
          state: "shock",
          highlights: ["محدش فاهم"],
        },
      ],
    },

    // ====================================================
    // RECEIPTS FROM ONE MONTH AGO
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "reveal",
      camera: "slow-push",
      timestamp: "10:47 ص",
      messages: [
        {
          text: "غريبة.",
          state: "sarcastic",
        },
        {
          text: "مش الكود نفسه هو الـ Documentation؟",
          state: "sarcastic",

          replyTo: {
            messageId: "code-is-docs",
            speaker: "mahmoud",
            previewText: "الكود نفسه هو الـ Documentation.",
          },
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "10:47 ص",
      messages: [
        {
          text: "...",
          state: "hesitant",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 28,
                interrupted: true,
              },
            ],
          },
        },
        {
          text: "أحمد مش وقته.",
          state: "warning",
        },
      ],
    },

    {
      type: "messages",
      speaker: "omar",
      beat: "comedic",
      camera: "static",
      timestamp: "10:47 ص",
      messages: [
        {
          text: "هو وقته شوية بصراحة.",
          state: "sarcastic",

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "😂",
                from: "youssef",
                delayFrames: 15,
              },
            ],
          },
        },
      ],
    },

    // ====================================================
    // AHMED FIXES IT
    // ====================================================

    {
      type: "messages",
      speaker: "ahmed",
      beat: "tension",
      camera: "focus-message",
      timestamp: "10:48 ص",
      messages: [
        {
          text: "متعملوش Restart تاني.",
          state: "warning",
        },
        {
          text: "الـ Dead Letter Queue بتعيد نفس الـ Events.",
          state: "important",
        },
        {
          text: "Pause الـ Consumer الأول، وبعدها Replay للـ failed batch.",
          state: "important",
          highlights: ["Pause", "Replay"],
        },
      ],
    },

    {
      type: "time-passage",
      label: "بعد 6 دقايق",
      style: "clock",
      sound: "clock",
      durationFrames: 26,
    },

    {
      type: "messages",
      speaker: "youssef",
      beat: "relief",
      camera: "static",
      timestamp: "10:54 ص",

      overlays: [
        {
          type: "notification",
          source: "Monitoring",
          title: "Billing Service Recovered",
          body: "Payment success rate: 99.8%",
          delayFrames: 5,
          durationFrames: 55,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "رجعت ✅",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // SUDDEN CHANGE OF HEART
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "reveal",
      camera: "slow-push",
      timestamp: "10:55 ص",
      messages: [
        {
          text: "تمام.",
          state: "normal",
        },
        {
          text: "واضح إن عندنا مشكلة Documentation.",
          state: "important",
          highlights: ["مشكلة Documentation"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "10:55 ص",
      messages: [
        {
          text: "عندنا؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "normal",
      camera: "focus-message",
      timestamp: "10:55 ص",
      messages: [
        {
          text: "أيوه.",
          state: "normal",
        },
        {
          text: "لازم يبقى عندنا Ownership أكتر للـ Documentation.",
          state: "important",
          highlights: ["Ownership"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "10:56 ص",
      messages: [
        {
          text: "أنا طلبت يومين من شهر.",
          state: "sarcastic",

          replyTo: {
            messageId: "no-docs-needed",
            speaker: "mahmoud",
            previewText: "بصراحة مش محتاجين Documentation دلوقتي.",
          },
        },
      ],
    },

    // ====================================================
    // FINAL ESCALATION
    // ====================================================

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "10:56 ص",

      overlays: [
        {
          type: "notification",
          source: "Jira",
          title: "New task assigned to you",
          body: "[URGENT] Document entire Billing Service",
          delayFrames: 15,
          durationFrames: 60,
          sound: "warning",
        },
      ],

      messages: [
        {
          text: "حلو.",
          state: "good-news",
        },
        {
          text: "اعملها النهارده بقى.",
          state: "important",
          highlights: ["النهارده"],
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "10:57 ص",
      messages: [
        {
          text: "النهارده؟",
          state: "shock",
        },
        {
          text: "مش كانت محتاجة يومين؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "slow-push",
      timestamp: "10:57 ص",
      messages: [
        {
          text: "آه بس دلوقتي بقت Priority.",
          state: "important",
          highlights: ["Priority"],
        },
        {
          text: "بس حاول متأثرش على التاسكات بتاعتك ❤️",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      speaker: "ahmed",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "10:57 ص",
      messages: [
        {
          text: "طبعًا.",
          state: "sarcastic",
        },
        {
          text: "هكتبها وأنا مستني الـ Build.",
          state: "sarcastic",
        },
      ],
    },
  ],
}
