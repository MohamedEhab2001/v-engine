import type { ChatVideo } from "../src/schema/video";

export const video: ChatVideo = {
  id: "visibility-by-proxy",

  settings: {
    language: "ar",
    direction: "rtl",
    fps: 30,
  },

  workspaceName: "NOVA",

  channels: {
    engineering: {
      name: "engineering",
      topic: "Engineering team",
      icon: "⚙️",
    },

    "career-ahmed": {
      name: "career-ahmed",
      topic: "Ahmed — Career progression",
      icon: "📈",
    },

    "architecture-spotlight": {
      name: "architecture-spotlight",
      topic: "Monthly technical knowledge sharing",
      icon: "🏗️",
    },
  },

  ambience: {
    src: "audio/office-ambience.mp3",
    volume: 0.06,
  },

  hook: {
    text: "لما يقولولك محتاج Visibility أكتر… وبعدين يخلّوك تجهز حد تاني للـ Presentation",
    highlights: ["Visibility أكتر", "تجهز حد تاني"],
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
    // ACT 1 — NEW "VISIBILITY" OPPORTUNITY
    // ====================================================

    {
      type: "channel-create",
      channel: "architecture-spotlight",
      by: "mahmoud",
      reason: "علشان نشارك المعرفة بشكل أكبر بين التيمز",
      timestamp: "10:02 ص",
      durationFrames: 55,
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "normal",
      camera: "channel-focus",
      timestamp: "10:03 ص",

      messages: [
        {
          text: "Welcome يا جماعة 👋",
          state: "good-news",
        },

        {
          text: "هنبدأ من الشهر ده Architecture Spotlight.",
          state: "important",
          highlights: ["Architecture Spotlight"],
        },

        {
          text: "كل شهر حد يشرح جزء مهم من السيستم.",
          state: "normal",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "reveal",
      camera: "slow-push",
      timestamp: "10:03 ص",

      messages: [
        {
          text: "وأول Presenter هيكون...",
          state: "reveal",
        },

        {
          text: "يوسف 🔥",
          state: "good-news",
          highlights: ["يوسف"],
          zoom: true,
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "shock",
      camera: "static",
      timestamp: "10:04 ص",

      messages: [
        {
          text: "أنا؟ 😅",
          state: "shock",
        },

        {
          text: "هشرح إيه؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "normal",
      camera: "focus-message",
      timestamp: "10:04 ص",

      messages: [
        {
          text: "Billing Architecture.",
          state: "important",
          highlights: ["Billing Architecture"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "10:04 ص",

      messages: [
        {
          text: "...",
          state: "hesitant",
        },

        {
          text: "بس أحمد هو اللي فاهمها أكتر مني.",
          state: "warning",
          highlights: ["أحمد"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "static",
      timestamp: "10:05 ص",

      messages: [
        {
          text: "عارف.",
          state: "normal",
        },

        {
          text: "أحمد يجهزك ❤️",
          state: "good-news",
          highlights: ["أحمد يجهزك"],
          zoom: true,
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "slow-push",
      timestamp: "10:05 ص",

      messages: [
        {
          text: "...",
          state: "hesitant",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 30,
                interrupted: true,
              },
            ],
          },
        },

        {
          text: "مش كنت أنا محتاج Visibility؟",
          state: "question",
          highlights: ["Visibility"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "static",
      timestamp: "10:06 ص",

      messages: [
        {
          text: "وده Visibility.",
          state: "good-news",
        },

        {
          text: "بس بشكل Leadership.",
          state: "important",
          highlights: ["Leadership"],
        },
      ],
    },

    // ====================================================
    // ACT 2 — PREPARING YOUSSEF
    // ====================================================

    {
      type: "time-passage",
      label: "بعد يومين",
      style: "calendar",
      sound: "swoosh",
      dates: [
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
      ],
      durationFrames: 32,
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "normal",
      camera: "static",
      timestamp: "1:12 م",

      messages: [
        {
          text: "أحمد ممكن تبص على الـ Slides؟",
          state: "question",
        },

        {
          text: "أنا عامل أول نسخة.",
          state: "normal",

          attachment: {
            type: "link",
            title: "Billing Architecture — Draft",
            description: "Architecture Spotlight • Youssef",
            domain: "slides.nova.internal",
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "normal",
      camera: "focus-attachment",
      timestamp: "1:14 م",

      messages: [
        {
          text: "يوسف...",
          state: "hesitant",
        },

        {
          text: "إنت كاتب إن الـ Payment بيدخل Database وبعدها \"يحصل حاجات\".",
          state: "shock",
          highlights: ["يحصل حاجات"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "comedic",
      camera: "static",
      timestamp: "1:14 م",

      messages: [
        {
          text: "ما هي فعلًا بيحصل حاجات.",
          state: "sarcastic",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "normal",
      camera: "focus-attachment",
      timestamp: "1:15 م",

      messages: [
        {
          text: "خد دي.",
          state: "normal",

          attachment: {
            type: "image",
            src: "media/billing-architecture-diagram.png",
            alt: "Billing architecture diagram",
            fit: "contain",
          },
        },

        {
          text: "ده الـ actual flow.",
          state: "important",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "normal",
      camera: "static",
      timestamp: "1:16 م",

      messages: [
        {
          text: "تمام.",
          state: "good-news",
        },

        {
          text: "وسؤال صغير...",
          state: "hesitant",
        },

        {
          text: "بعتلك Voice Note.",
          state: "normal",

          attachment: {
            type: "audio",
            durationSeconds: 6,
            autoplay: true,
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "1:16 م",

      messages: [
        {
          text: "هو الـ idempotency دي معناها إيه أصلًا؟",
          state: "question",
          highlights: ["idempotency"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "1:17 م",

      messages: [
        {
          text: "إنت هتشرحها بكرة.",
          state: "warning",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "comedic",
      camera: "static",
      timestamp: "1:17 م",

      messages: [
        {
          text: "عشان كده بسأل من بدري.",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // ACCIDENTAL MESSAGE
    // ====================================================

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "reveal",
      camera: "static",
      timestamp: "1:48 م",

      messages: [
        {
          text: "أنا مش فاهم نص الـ Presentation دي والله.",
          state: "shock",

          lifecycle: {
            after: [
              {
                type: "delete",
                delayFrames: 32,
                replacementText: "تم حذف هذه الرسالة",
              },
            ],
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "omar",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "1:48 م",

      messages: [
        {
          text: "شفناها.",
          state: "sarcastic",

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "😂",
                from: "ahmed",
                delayFrames: 12,
              },
            ],
          },
        },
      ],
    },

    // ====================================================
    // ACT 3 — PRESENTATION DAY
    // ====================================================

    {
      type: "time-passage",
      label: "تاني يوم — قبل العرض بـ 5 دقايق",
      style: "clock",
      sound: "clock",
      durationFrames: 30,
    },

    {
      type: "presence",
      person: "youssef",
      status: "online",
      delayFrames: 8,
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "normal",
      camera: "channel-focus",
      timestamp: "1:55 م",

      overlays: [
        {
          type: "notification",
          source: "Calendar",
          title: "Architecture Spotlight",
          body: "Billing Architecture • Presenter: Youssef",
          delayFrames: 8,
          durationFrames: 55,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "جاهزين؟ 🔥",
          state: "good-news",
        },
      ],
    },

    {
      type: "group-event",
      event: "added",
      person: "sara",
      by: "mahmoud",
      timestamp: "1:56 م",
      durationFrames: 38,
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "sara",
      beat: "relief",
      camera: "static",
      timestamp: "1:56 م",

      messages: [
        {
          text: "جيت أشجع يوسف ❤️",
          state: "good-news",
        },

        {
          text: "دي فرصة Visibility ممتازة.",
          state: "important",
          highlights: ["Visibility"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "1:56 م",

      messages: [
        {
          text: "...",
          state: "hesitant",
        },
      ],
    },

    // ====================================================
    // PRESENTATION STARTS
    // ====================================================

    {
      type: "media",
      mediaType: "image",
      src: "media/billing-architecture-title-slide.png",
      durationFrames: 65,
      fit: "contain",
    },

    {
      type: "presence",
      person: "youssef",
      status: "idle",
      delayFrames: 5,
    },

    {
      type: "presence",
      person: "youssef",
      status: "offline",
      delayFrames: 12,
    },

    // ====================================================
    // PANIC CALL
    // ====================================================

    {
      type: "call",
      caller: "youssef",
      mode: "incoming",
      durationFrames: 30,
    },

    {
      type: "call",
      caller: "youssef",
      mode: "accepted",
      durationFrames: 32,
      callDurationLabel: "00:18",
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "2:08 م",

      messages: [
        {
          text: "أحمد.",
          state: "warning",
        },

        {
          text: "الـ Laptop اختار يعمل Update دلوقتي.",
          state: "shock",
          highlights: ["Update دلوقتي"],
          zoom: true,
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "shock",
      camera: "static",
      timestamp: "2:08 م",

      messages: [
        {
          text: "إنت بتهزر.",
          state: "shock",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "comedic",
      camera: "static",
      timestamp: "2:08 م",

      messages: [
        {
          text: "واقف على 14%.",
          state: "bad-news",
        },
      ],
    },

    // ====================================================
    // AHMED SAVES THE TALK
    // ====================================================

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "tension",
      camera: "slow-push",
      timestamp: "2:09 م",

      messages: [
        {
          text: "حد يكمل بسرعة.",
          state: "warning",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "reveal",
      camera: "focus-message",
      timestamp: "2:09 م",

      messages: [
        {
          text: "أنا هكمل.",
          state: "important",
          zoom: true,
        },
      ],
    },

    {
      type: "media",
      mediaType: "image",
      src: "media/billing-architecture-diagram.png",
      durationFrames: 55,
      fit: "contain",
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "normal",
      camera: "slow-push",
      timestamp: "2:14 م",

      messages: [
        {
          text: "فالـ Webhook مش بيعدل الـ Payment مباشرة.",
          state: "normal",
        },

        {
          text: "إحنا بنستخدم Idempotency Key علشان نفس الـ Event مايتنفذش مرتين.",
          state: "important",
          highlights: ["Idempotency Key"],
        },

        {
          text: "وده بالمناسبة كان سبب الـ Incident اللي حصل الشهر اللي فات.",
          state: "reveal",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "omar",
      beat: "relief",
      camera: "static",
      timestamp: "2:15 م",

      messages: [
        {
          text: "👏👏👏",
          state: "good-news",

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "🔥",
                from: "mahmoud",
                delayFrames: 10,
              },

              {
                type: "reaction",
                emoji: "❤️",
                from: "sara",
                delayFrames: 18,
              },
            ],
          },
        },
      ],
    },

    // ====================================================
    // YOUSSEF RETURNS
    // ====================================================

    {
      type: "presence",
      person: "youssef",
      status: "online",
      delayFrames: 12,
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "relief",
      camera: "static",
      timestamp: "2:16 م",

      messages: [
        {
          text: "رجعت 😭",
          state: "good-news",
        },

        {
          text: "وصلتوا لفين؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "omar",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "2:16 م",

      messages: [
        {
          text: "خلصنا تقريبًا.",
          state: "sarcastic",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "2:16 م",

      messages: [
        {
          text: "آه.",
          state: "hesitant",
        },

        {
          text: "Presentation موفقة الحمد لله.",
          state: "good-news",
        },
      ],
    },

    // ====================================================
    // ACT 4 — FINALLY, VISIBILITY?
    // ====================================================

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "sara",
      beat: "relief",
      camera: "slow-push",
      timestamp: "2:17 م",

      messages: [
        {
          id: "great-visibility",
          text: "Great visibility يا أحمد 👏",
          state: "good-news",
          highlights: ["visibility", "أحمد"],
          zoom: true,

          lifecycle: {
            after: [
              {
                type: "edit",
                text: "Great support يا أحمد 👏",
                delayFrames: 40,
                state: "good-news",
                highlights: ["support"],
              },
            ],
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "2:17 م",

      messages: [
        {
          text: "استني.",
          state: "warning",
        },

        {
          text: "هي كانت Visibility من ثانيتين.",
          state: "shock",

          replyTo: {
            messageId: "great-visibility",
            speaker: "sara",
            previewText: "Great support يا أحمد 👏",
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "sara",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "2:18 م",

      messages: [
        {
          text: "خلينا نتكلم في الـ Career Channel 😅",
          state: "hesitant",
        },
      ],
    },

    // ====================================================
    // ACT 5 — PROMOTION EVIDENCE
    // ====================================================

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "tension",
      camera: "channel-focus",
      timestamp: "2:20 م",

      messages: [
        {
          text: "تمام.",
          state: "normal",
        },

        {
          text: "هل الـ Presentation اللي أنا لسه قدمتها تتحسب Visibility؟",
          state: "question",
          highlights: ["Visibility"],

          replyTo: {
            speaker: "mahmoud",
            previewText: "بس محتاج Visibility أكتر.",
          },
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "normal",
      camera: "focus-attachment",
      timestamp: "2:20 م",

      messages: [
        {
          text: "خلينا نمشي على الـ framework.",
          state: "normal",

          attachment: {
            type: "document",
            title: "Senior+ Promotion Framework.pdf",
            meta: "Career Framework • Updated this quarter",
            icon: "pdf",
          },
        },
      ],
    },

    {
      type: "form-interaction",
      actor: "ahmed",
      title: "Promotion Readiness Check",
      subtitle: "Senior → Next Level",
      formStyle: "application",

      fields: [
        {
          type: "choice",
          question: "قدمت Presentation قدام ناس خارج التيم؟",
          options: ["نعم", "لا"],
          selected: "نعم",
          state: "good-news",
        },

        {
          type: "choice",
          question: "عملت Mentoring لحد في التيم؟",
          options: ["نعم", "لا"],
          selected: "نعم",
          state: "good-news",
        },

        {
          type: "choice",
          question: "كان ليك Business Impact واضح؟",
          options: ["نعم", "لا"],
          selected: "نعم",
          state: "good-news",
        },

        {
          type: "rating",
          question: "قيّم الـ Visibility بتاعتك",
          max: 5,
          selected: 5,
          state: "good-news",
        },
      ],

      submit: {
        show: true,
        label: "Check Readiness",
        click: true,
      },
    },

    // ====================================================
    // THE DEFINITION CHANGES AGAIN
    // ====================================================

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "tension",
      camera: "slow-push",
      timestamp: "2:22 م",

      messages: [
        {
          text: "حلو جدًا.",
          state: "good-news",
        },

        {
          text: "بس الـ Presentation النهارده كانت Reactive Visibility.",
          state: "important",
          highlights: ["Reactive Visibility"],
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "shock",
      camera: "micro-punch",
      timestamp: "2:22 م",

      messages: [
        {
          text: "Reactive إيه؟",
          state: "shock",
        },

        {
          text: "أنا طلعت قدمت قدام الشركة.",
          state: "angry",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "mahmoud",
      beat: "reveal",
      camera: "focus-message",
      timestamp: "2:23 م",

      messages: [
        {
          text: "بس إنت طلعت لأن يوسف وقع.",
          state: "normal",
        },

        {
          text: "فاللي عملته يتحسب Mentoring أكتر من Visibility.",
          state: "important",
          highlights: ["Mentoring", "Visibility"],
          zoom: true,
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "conflict",
      camera: "micro-shake",
      timestamp: "2:23 م",

      messages: [
        {
          text: "أنا اللي قدمت!",
          state: "angry",
        },

        {
          text: "ويوسف مكانش موجود أصلًا!",
          state: "angry",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "normal",
      camera: "static",
      timestamp: "2:24 م",

      messages: [
        {
          text: "وده Great Leadership ❤️",
          state: "good-news",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "ahmed",
      beat: "comedic",
      camera: "focus-message",
      timestamp: "2:24 م",

      messages: [
        {
          text: "طب علشان تبقى Visibility...",
          state: "hesitant",
        },

        {
          text: "كان المفروض أسرق المايك من يوسف قبل ما اللابتوب يقع؟",
          state: "sarcastic",
        },
      ],
    },

    {
      type: "messages",
      channel: "career-ahmed",
      speaker: "sara",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "2:24 م",

      messages: [
        {
          text: "لا طبعًا 😭",
          state: "hesitant",
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
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "normal",
      camera: "channel-focus",
      timestamp: "2:35 م",

      overlays: [
        {
          type: "notification",
          source: "Calendar",
          title: "Monthly Architecture Spotlight",
          body: "Presenter: Youssef • Content Support: Ahmed",
          delayFrames: 12,
          durationFrames: 65,
          sound: "positive",
        },

        {
          type: "notification",
          source: "People Portal",
          title: "Kudos",
          body: "Youssef — Strong Communication",
          delayFrames: 38,
          durationFrames: 55,
          sound: "positive",
        },
      ],

      messages: [
        {
          text: "بما إن التجربة نجحت جدًا...",
          state: "good-news",
        },

        {
          text: "هنخلي يوسف يقدم الـ Spotlight كل شهر.",
          state: "important",
          highlights: ["كل شهر"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "youssef",
      beat: "shock",
      camera: "static",
      timestamp: "2:35 م",

      messages: [
        {
          text: "كل شهر؟ 😭",
          state: "shock",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "comedic",
      camera: "slow-push",
      timestamp: "2:36 م",

      messages: [
        {
          text: "متقلقش.",
          state: "good-news",
        },

        {
          text: "أحمد هيجهزلك المحتوى.",
          state: "good-news",
          highlights: ["أحمد"],
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "ahmed",
      beat: "awkward-pause",
      camera: "static",
      timestamp: "2:36 م",

      messages: [
        {
          text: "...",
          state: "hesitant",

          lifecycle: {
            before: [
              {
                type: "typing",
                durationFrames: 35,
                interrupted: true,
              },
            ],
          },
        },

        {
          text: "أنا بقيت Ghostwriter؟",
          state: "question",
        },
      ],
    },

    {
      type: "messages",
      channel: "architecture-spotlight",
      speaker: "mahmoud",
      beat: "payoff",
      camera: "focus-message",
      timestamp: "2:36 م",

      messages: [
        {
          text: "لا يا أحمد.",
          state: "normal",
        },

        {
          text: "إنت Leadership Enabler ❤️",
          state: "good-news",
          highlights: ["Leadership Enabler"],
          zoom: true,

          lifecycle: {
            after: [
              {
                type: "reaction",
                emoji: "💀",
                from: "omar",
                delayFrames: 12,
              },

              {
                type: "reaction",
                emoji: "😭",
                from: "youssef",
                delayFrames: 20,
              },

              {
                type: "reaction",
                emoji: "❤️",
                from: "sara",
                delayFrames: 28,
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
};
