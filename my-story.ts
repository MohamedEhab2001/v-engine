export const video = {
    id: "meeting-to-reduce-meetings",

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
        text: "لما الشركة تعمل Meeting علشان تناقش ليه عندنا Meetings كتير",
        highlights: ["Meeting", "Meetings كتير"],
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
        // THE PROBLEM
        // ====================================================

        {
            type: "messages",
            speaker: "ahmed",
            beat: "normal",
            camera: "static",
            timestamp: "10:02 ص",
            messages: [
                {
                    text: "محمود أنا عندي سؤال.",
                    state: "question",
                },
                {
                    text: "إحنا إمتى بنشتغل؟",
                    state: "question",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "awkward-pause",
            camera: "static",
            timestamp: "10:02 ص",
            messages: [
                {
                    text: "يعني إيه؟",
                    state: "question",
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "tension",
            camera: "focus-message",
            timestamp: "10:03 ص",
            messages: [
                {
                    text: "النهارده عندي 7 Meetings.",
                    state: "important",
                    highlights: ["7 Meetings"],
                },
                {
                    text: "وفي النص مطلوب مني أخلص 3 Tasks.",
                    state: "warning",
                    highlights: ["3 Tasks"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "youssef",
            beat: "comedic",
            camera: "static",
            timestamp: "10:03 ص",
            messages: [
                {
                    text: "أنا عندي Meeting اسمها Focus Time.",
                    state: "sarcastic",
                    highlights: ["Focus Time"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "omar",
            beat: "comedic",
            camera: "focus-message",
            timestamp: "10:04 ص",
            messages: [
                {
                    text: "أنا عندي Meeting علشان نجهز للـ Meeting.",
                    state: "sarcastic",
                },
            ],
        },

        // ====================================================
        // MANAGER TAKES ACTION
        // ====================================================

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "reveal",
            camera: "slow-push",
            timestamp: "10:04 ص",
            messages: [
                {
                    text: "عارفين؟",
                    state: "important",
                },
                {
                    text: "عندكم حق.",
                    state: "good-news",
                },
                {
                    text: "لازم نحل مشكلة الـ Meetings دي.",
                    state: "important",
                    highlights: ["نحل مشكلة الـ Meetings"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "relief",
            camera: "static",
            timestamp: "10:05 ص",
            messages: [
                {
                    text: "أخيرًا.",
                    state: "good-news",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "reveal",
            camera: "focus-message",
            timestamp: "10:05 ص",

            overlays: [
                {
                    type: "notification",
                    source: "Calendar",
                    title: "Meeting Efficiency Workshop",
                    body: "اليوم • 2:00 م — 3:30 م",
                    delayFrames: 18,
                    durationFrames: 60,
                    sound: "positive",
                },
            ],

            messages: [
                {
                    text: "حجزت Meeting الساعة 2.",
                    state: "good-news",
                },
                {
                    text: "علشان نناقش إزاي نقلل الـ Meetings.",
                    state: "important",
                    highlights: ["نقلل الـ Meetings"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "shock",
            camera: "micro-punch",
            timestamp: "10:05 ص",
            messages: [
                {
                    text: "حجزت إيه؟",
                    state: "shock",
                },
            ],
        },

        // ====================================================
        // PRE-MEETING
        // ====================================================

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "normal",
            camera: "static",
            timestamp: "10:06 ص",
            messages: [
                {
                    text: "بس محتاجين نكون Prepared.",
                    state: "important",
                },
                {
                    text: "فنعمل Quick Sync الساعة 1:30.",
                    state: "normal",
                    highlights: ["Quick Sync"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "comedic",
            camera: "focus-message",
            timestamp: "10:06 ص",
            messages: [
                {
                    text: "هنعمل Meeting قبل الـ Meeting...",
                    state: "hesitant",
                },
                {
                    text: "اللي هدفها نقلل Meetings؟",
                    state: "sarcastic",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "normal",
            camera: "static",
            timestamp: "10:07 ص",
            messages: [
                {
                    text: "دي مش Meeting.",
                    state: "important",
                },
                {
                    id: "quick-sync",
                    text: "دي Quick Sync.",
                    state: "good-news",
                    highlights: ["Quick Sync"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "omar",
            beat: "payoff",
            camera: "focus-message",
            timestamp: "10:07 ص",
            messages: [
                {
                    text: "آه كده تمام.",
                    state: "sarcastic",
                    replyTo: {
                        messageId: "quick-sync",
                        speaker: "mahmoud",
                        previewText: "دي Quick Sync.",
                    },
                },
            ],
        },

        // ====================================================
        // 1:30
        // ====================================================

        {
            type: "time-passage",
            label: "1:30 م",
            style: "clock",
            sound: "clock",
            durationFrames: 26,
        },

        {
            type: "call",
            caller: "mahmoud",
            mode: "accepted",
            durationFrames: 34,
            callDurationLabel: "00:28:14",
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "shock",
            camera: "focus-message",
            timestamp: "1:59 م",
            messages: [
                {
                    text: "الـ Quick Sync أخدت نص ساعة.",
                    state: "shock",
                    highlights: ["نص ساعة"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "normal",
            camera: "static",
            timestamp: "1:59 م",
            messages: [
                {
                    text: "آه بس كانت Productive.",
                    state: "good-news",
                },
                {
                    text: "يلا الـ Meeting الأساسية بدأت.",
                    state: "important",
                },
            ],
        },

        // ====================================================
        // WORKSHOP
        // ====================================================

        {
            type: "time-passage",
            label: "بعد ساعة ونص",
            style: "clock",
            sound: "clock",
            durationFrames: 30,
        },

        {
            type: "messages",
            speaker: "sara",
            beat: "relief",
            camera: "slow-push",
            timestamp: "3:31 م",
            messages: [
                {
                    text: "شكرًا جدًا يا Team ❤️",
                    state: "good-news",
                },
                {
                    text: "الـ Workshop كانت ممتازة.",
                    state: "good-news",
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "sad",
            camera: "static",
            timestamp: "3:31 م",
            messages: [
                {
                    text: "أنا بقالي ساعتين في Meetings علشان نقلل Meetings.",
                    state: "sarcastic",
                },
            ],
        },

        // ====================================================
        // ACTION ITEMS
        // ====================================================

        {
            type: "messages",
            speaker: "sara",
            beat: "reveal",
            camera: "static",
            timestamp: "3:32 م",
            messages: [
                {
                    text: "طلعنا بـ 3 Action Items.",
                    state: "important",
                    highlights: ["3 Action Items"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            beat: "normal",
            camera: "focus-message",
            timestamp: "3:32 م",
            messages: [
                {
                    text: "1. كل Meeting لازم يبقى ليها Agenda.",
                    state: "normal",
                },
                {
                    text: "2. أي Meeting أطول من 30 دقيقة محتاجة Approval.",
                    state: "normal",
                },
                {
                    text: "3. هنعمل Weekly Meeting نراجع فيها الـ Meetings.",
                    state: "important",
                    highlights: ["Weekly Meeting"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "shock",
            camera: "micro-punch",
            timestamp: "3:33 م",
            messages: [
                {
                    text: "استنى.",
                    state: "warning",
                },
                {
                    text: "هنعمل Meeting أسبوعية...",
                    state: "hesitant",
                },
                {
                    text: "علشان نراجع الـ Meetings؟",
                    state: "shock",
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            beat: "comedic",
            camera: "static",
            timestamp: "3:33 م",
            messages: [
                {
                    text: "بالظبط ❤️",
                    state: "good-news",
                },
            ],
        },

        // ====================================================
        // IT GETS WORSE
        // ====================================================

        {
            type: "messages",
            speaker: "omar",
            beat: "tension",
            camera: "static",
            timestamp: "3:34 م",
            messages: [
                {
                    text: "طيب مين هيقرر الـ Meeting تستاهل Approval ولا لأ؟",
                    state: "question",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "reveal",
            camera: "focus-message",
            timestamp: "3:34 م",
            messages: [
                {
                    text: "محتاجين Committee صغيرة.",
                    state: "important",
                    highlights: ["Committee"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "awkward-pause",
            camera: "static",
            timestamp: "3:34 م",
            messages: [
                {
                    text: "لا.",
                    state: "warning",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "normal",
            camera: "static",
            timestamp: "3:35 م",
            messages: [
                {
                    text: "أحمد استنى بس الفكرة حلوة.",
                    state: "good-news",
                },
                {
                    text: "نجتمع كل خميس 20 دقيقة.",
                    state: "important",
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "conflict",
            camera: "micro-shake",
            timestamp: "3:35 م",
            messages: [
                {
                    text: "إنت عملت Meeting Committee؟!",
                    state: "angry",
                    highlights: ["Meeting Committee"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            beat: "comedic",
            camera: "focus-message",
            timestamp: "3:35 م",
            messages: [
                {
                    text: "اسمها Meeting Governance.",
                    state: "important",
                    highlights: ["Meeting Governance"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "youssef",
            beat: "payoff",
            camera: "focus-message",
            timestamp: "3:36 م",
            messages: [
                {
                    text: "الـ Meetings بقى ليها حكومة.",
                    state: "sarcastic",
                },
            ],
        },

        // ====================================================
        // FINAL ESCALATION
        // ====================================================

        {
            type: "time-passage",
            label: "بعد 5 دقايق",
            style: "minimal",
            sound: "none",
            durationFrames: 20,
        },

        {
            type: "messages",
            speaker: "ahmed",
            beat: "normal",
            camera: "static",
            timestamp: "3:41 م",

            overlays: [
                {
                    type: "notification",
                    source: "Calendar",
                    title: "Meeting Governance",
                    body: "كل خميس • 3:00 م",
                    delayFrames: 5,
                    durationFrames: 55,
                    sound: "positive",
                },
                {
                    type: "notification",
                    source: "Calendar",
                    title: "Meeting Efficiency Weekly",
                    body: "كل إثنين • 10:00 ص",
                    delayFrames: 30,
                    durationFrames: 55,
                    sound: "positive",
                },
            ],

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
            camera: "slow-push",
            timestamp: "3:42 م",
            messages: [
                {
                    text: "مبروك يا جماعة.",
                    state: "good-news",
                },
                {
                    text: "عملنا 3 Meetings جديدة...",
                    state: "sarcastic",
                    highlights: ["3 Meetings جديدة"],
                },
                {
                    text: "علشان نقلل الـ Meetings.",
                    state: "sarcastic",
                },
            ],
        },

        {
            type: "presence",
            person: "ahmed",
            status: "dnd",
            delayFrames: 12,
        },
    ],
};