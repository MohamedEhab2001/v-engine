import type { ChatVideo } from "../schema/video";

export const video: ChatVideo = {
    id: "performance-review-story",

    settings: {
        language: "ar",
        direction: "rtl",
        fps: 30,
    },

    hook: {
        text: "لما تعمل Performance Review وتكتشف إن النتيجة متقررة من قبل ما تبدأ...",
        highlights: ["Performance Review", "متقررة"],
    },

    workspaceName: "FUC company",

    channels: {
        "performance-review": {
            name: "performance-review",
            topic: "تقييم الأداء السنوي",
            icon: "📋",
        },
        "hr-private": {
            name: "hr-private",
            topic: "خاص — HR فقط",
            icon: "🔒",
        },
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

        youssef: {
            name: "يوسف",
            role: "Software Engineer",
            avatar: "avatars/youssef.png",
            gender: "m",
        },
    },

    screens: [
        // ====================================================
        // ACT 1 — Self assessment
        // ====================================================

        {
            type: "messages",
            speaker: "sara",
            timestamp: "9:03 ص",
            messages: [
                {
                    text: "صباح الخير يا Team ❤️",
                    state: "good-news",
                },
                {
                    text: "بدأنا الـ Annual Performance Review.",
                    state: "important",
                    highlights: ["Annual Performance Review"],
                },
                {
                    text: "كل حد يملأ الـ Self Assessment بتاعه بصراحة.",
                    state: "normal",
                    highlights: ["Self Assessment"],
                },
            ],
        },

        {
            type: "form-interaction",
            actor: "ahmed",
            title: "Annual Performance Review",
            subtitle: "Self Assessment — كن صريحًا في تقييم أدائك",
            formStyle: "feedback",

            fields: [
                {
                    type: "rating",
                    question: "قيّم أداءك السنة دي",
                    max: 5,
                    selected: 5,
                    state: "good-news",
                },

                {
                    type: "choice",
                    question: "هل حققت أهدافك السنوية؟",
                    options: [
                        "أقل من المتوقع",
                        "حققت المتوقع",
                        "تجاوزت المتوقع",
                    ],
                    selected: "تجاوزت المتوقع",
                    state: "important",
                },
            ],

            submit: {
                show: false,
            },
        },

        {
            type: "form-interaction",
            actor: "ahmed",
            title: "Annual Performance Review",
            subtitle: "اذكر أهم إنجازاتك",
            formStyle: "feedback",

            fields: [
                {
                    type: "text",
                    question: "إيه أهم إنجازاتك السنة دي؟",
                    answer:
                        "سلمت 14 feature، قللت الـ production bugs، ودربت اتنين جداد في التيم.",
                    state: "important",
                    typingStyle: "natural",
                },

                {
                    type: "text",
                    question: "اذكر موقف عملت فيه Impact واضح",
                    answer:
                        "وقت الـ production incident اشتغلت لحد 3 الفجر ورجعت السيستم.",
                    state: "important",
                    typingStyle: "natural",
                },
            ],

            submit: {
                show: false,
            },
        },

        {
            type: "form-interaction",
            actor: "ahmed",
            title: "Annual Performance Review",
            subtitle: "آخر خطوة",
            formStyle: "survey",

            fields: [
                {
                    type: "multi-choice",
                    question: "إيه المسؤوليات اللي أخدتها السنة دي؟",
                    options: [
                        "Mentoring",
                        "Architecture",
                        "Production Support",
                        "Hiring Interviews",
                    ],
                    selected: [
                        "Mentoring",
                        "Architecture",
                        "Production Support",
                        "Hiring Interviews",
                    ],
                    state: "good-news",
                },

                {
                    type: "text",
                    question: "أي تعليق إضافي؟",
                    answer:
                        "شايف إني السنة دي قدمت أكتر من المتوقع ومستني التقييم يعكس ده.",
                    state: "important",
                    typingStyle: "slow",
                },
            ],

            submit: {
                show: true,
                label: "إرسال التقييم",
                click: true,
            },
        },

        // ====================================================
        // TIME PASSAGE
        // ====================================================

        {
            type: "time-passage",
            label: "بعد أسبوع",
            style: "calendar",
            sound: "swoosh",
            dates: [
                "5 أكتوبر",
                "8 أكتوبر",
                "11 أكتوبر",
                "12 أكتوبر",
            ],
            durationFrames: 36,
        },

        // ====================================================
        // ACT 2 — Review meeting starts nicely
        // ====================================================

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:03 م",
            messages: [
                {
                    text: "بص يا أحمد...",
                    state: "hesitant",
                },
                {
                    text: "أنا مبسوط جدًا من شغلك السنة دي.",
                    state: "good-news",
                },
                {
                    text: "وعملت Impact واضح جدًا في التيم.",
                    state: "important",
                    highlights: ["Impact واضح جدًا"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:04 م",
            messages: [
                {
                    text: "تسلم ❤️",
                    state: "good-news",
                },
                {
                    text: "الحمد لله كانت سنة تقيلة فعلًا.",
                    state: "normal",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:04 م",
            messages: [
                {
                    text: "وأنت كنت من أكتر الناس اللي شالت مسؤولية.",
                    state: "good-news",
                },
                {
                    text: "وعشان كده تقييمك النهائي...",
                    state: "reveal",
                    holdAfterFrames: 30,
                },
            ],
        },

        // ====================================================
        // ACT 3 — The legendary 3/5
        // ====================================================

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:04 م",
            messages: [
                {
                    text: "3 من 5.",
                    state: "shock",
                    highlights: ["3 من 5"],
                    holdAfterFrames: 40,
                    zoom: true,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:05 م",
            messages: [
                {
                    text: "ثلاثة؟",
                    state: "shock",
                },
                {
                    text: "أنا كنت لسه سامع كلام حلو من شوية.",
                    state: "angry",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:05 م",
            messages: [
                {
                    text: "3 مش وحش.",
                    state: "normal",
                },
                {
                    text: "ده Meets Expectations.",
                    state: "important",
                    highlights: ["Meets Expectations"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:05 م",
            messages: [
                {
                    text: "محمود...",
                    state: "warning",
                },
                {
                    text: "أنا كتبت في الـ Self Assessment إني سلمت 14 feature.",
                    state: "important",
                    highlights: ["14 feature"],
                },
                {
                    text: "ودربت اتنين.",
                    state: "normal",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:06 م",
            messages: [
                {
                    text: "صح.",
                    state: "normal",
                },
                {
                    text: "وده المتوقع منك كـ Senior.",
                    state: "important",
                    highlights: ["المتوقع منك"],
                    holdAfterFrames: 25,
                },
            ],
        },

        // ====================================================
        // ACT 4 — Everything becomes expected
        // ====================================================

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:06 م",
            messages: [
                {
                    text: "طيب الـ production incident؟",
                    state: "question",
                    highlights: ["production incident"],
                },
                {
                    text: "أنا اشتغلت لحد 3 الفجر.",
                    state: "important",
                    highlights: ["3 الفجر"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:06 م",
            messages: [
                {
                    text: "وده Ownership.",
                    state: "important",
                    highlights: ["Ownership"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:07 م",
            messages: [
                {
                    text: "حلو.",
                    state: "hesitant",
                },
                {
                    text: "والـ Ownership دي مش حاجة كويسة؟",
                    state: "question",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:07 م",
            messages: [
                {
                    text: "طبعًا.",
                    state: "good-news",
                },
                {
                    text: "بس متوقعة منك.",
                    state: "normal",
                    holdAfterFrames: 25,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:07 م",
            messages: [
                {
                    text: "طب أعمل إيه زيادة علشان أخد 5؟",
                    state: "question",
                    highlights: ["5"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:08 م",
            messages: [
                {
                    text: "...",
                    state: "hesitant",
                    holdAfterFrames: 18,
                },
                {
                    text: "بصراحة؟",
                    state: "hesitant",
                },
                {
                    text: "محدش بياخد 5.",
                    state: "reveal",
                    highlights: ["محدش بياخد 5"],
                    holdAfterFrames: 35,
                    zoom: true,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:08 م",
            messages: [
                {
                    text: "طب هي موجودة ليه؟",
                    state: "shock",
                },
            ],
        },

        // ====================================================
        // ACT 5 — HR gets added (a new private channel opens)
        // ====================================================

        {
            type: "channel-create",
            channel: "hr-private",
            by: "mahmoud",
            timestamp: "2:08 م",
        },

        {
            type: "group-event",
            event: "added",
            person: "sara",
            by: "mahmoud",
            timestamp: "2:08 م",
            durationFrames: 45,
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:09 م",
            messages: [
                {
                    text: "هاي يا أحمد ❤️",
                    state: "good-news",
                },
                {
                    text: "شوفت سؤالك.",
                    state: "normal",
                },
                {
                    text: "الـ 5 موجودة علشان يبقى عندك حاجة تطمح لها.",
                    state: "important",
                    highlights: ["حاجة تطمح لها"],
                    holdAfterFrames: 30,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:09 م",
            messages: [
                {
                    text: "أطمح لحاجة محدش بياخدها؟",
                    state: "question",
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:09 م",
            messages: [
                {
                    text: "بالظبط ❤️",
                    state: "good-news",
                    holdAfterFrames: 25,
                },
            ],
        },

        // ====================================================
        // ACT 6 — Ahmed tries 4/5
        // ====================================================

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:10 م",
            messages: [
                {
                    text: "طيب ننسى الـ5.",
                    state: "normal",
                },
                {
                    text: "ليه مش 4؟",
                    state: "question",
                    highlights: ["4"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:10 م",
            messages: [
                {
                    text: "الـ4 محتاجة Exceptional Impact.",
                    state: "important",
                    highlights: ["Exceptional Impact"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:10 م",
            messages: [
                {
                    text: "أنا رجعت السيستم الساعة 3 الفجر!",
                    state: "angry",
                    highlights: ["3 الفجر"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:10 م",
            messages: [
                {
                    text: "ده كان Incident.",
                    state: "normal",
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:11 م",
            messages: [
                {
                    text: "أنا اللي حليت الـ Incident!",
                    state: "angry",
                    highlights: ["حليت"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:11 م",
            messages: [
                {
                    text: "وده Expected Ownership.",
                    state: "important",
                    highlights: ["Expected Ownership"],
                    holdAfterFrames: 30,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:11 م",
            messages: [
                {
                    text: "أنا بدأت أكره كلمة Expected.",
                    state: "sarcastic",
                    highlights: ["Expected"],
                },
            ],
        },

        // ====================================================
        // ACT 7 — Salary increase reveal
        // ====================================================

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:12 م",
            messages: [
                {
                    text: "خلاص.",
                    state: "hesitant",
                },
                {
                    text: "الزيادة كام؟",
                    state: "question",
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:12 م",
            messages: [
                {
                    text: "عندنا خبر حلو 🎉",
                    state: "good-news",
                },
                {
                    text: "في Increase 3%.",
                    state: "good-news",
                    highlights: ["3%"],
                    holdAfterFrames: 25,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:12 م",
            messages: [
                {
                    text: "...",
                    state: "hesitant",
                    holdAfterFrames: 20,
                },
                {
                    text: "3%؟",
                    state: "shock",
                },
                {
                    text: "التضخم 15%.",
                    state: "important",
                    highlights: ["15%"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:13 م",
            messages: [
                {
                    text: "إحنا بنتكلم Performance...",
                    state: "warning",
                },
                {
                    text: "مش Economy يا أحمد.",
                    state: "sarcastic",
                    highlights: ["مش Economy"],
                    holdAfterFrames: 35,
                },
            ],
        },

        // ====================================================
        // ACT 8 — Ahmed asks the forbidden question
        // ====================================================

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:13 م",
            messages: [
                {
                    text: "سؤال أخير.",
                    state: "normal",
                },
                {
                    text: "لو كنت جبت 5 كنت هاخد كام؟",
                    state: "question",
                    highlights: ["5"],
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:14 م",
            messages: [
                {
                    text: "بصراحة...",
                    state: "hesitant",
                    holdAfterFrames: 20,
                },
                {
                    text: "مش عارفين.",
                    state: "reveal",
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:14 م",
            messages: [
                {
                    text: "يعني إيه مش عارفين؟",
                    state: "shock",
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:14 م",
            messages: [
                {
                    text: "محدش جاب 5 قبل كده.",
                    state: "sarcastic",
                    highlights: ["محدش جاب 5"],
                    holdAfterFrames: 40,
                },
            ],
        },

        // ====================================================
        // ACT 9 — Final insult
        // ====================================================

        {
            type: "time-passage",
            label: "بعد دقيقة",
            style: "minimal",
            sound: "none",
            durationFrames: 22,
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:15 م",
            messages: [
                {
                    text: "Anyway...",
                    state: "normal",
                },
                {
                    text: "بما إنك Senior وعندك خبرة...",
                    state: "good-news",
                },
                {
                    text: "محتاجك تعمل Performance Review ليوسف الأسبوع الجاي.",
                    state: "important",
                    highlights: ["Performance Review", "يوسف"],
                    holdAfterFrames: 30,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:15 م",
            messages: [
                {
                    text: "أنا؟",
                    state: "shock",
                },
            ],
        },

        {
            type: "messages",
            speaker: "mahmoud",
            timestamp: "2:15 م",
            messages: [
                {
                    text: "أيوه.",
                    state: "normal",
                },
                {
                    text: "دي Leadership Opportunity ❤️",
                    state: "good-news",
                    highlights: ["Leadership Opportunity"],
                    holdAfterFrames: 35,
                },
            ],
        },

        {
            type: "messages",
            speaker: "ahmed",
            timestamp: "2:16 م",
            messages: [
                {
                    text: "حلو.",
                    state: "hesitant",
                },
                {
                    text: "ينفع أديه 5؟",
                    state: "question",
                    holdAfterFrames: 20,
                },
            ],
        },

        {
            type: "messages",
            speaker: "sara",
            timestamp: "2:16 م",
            messages: [
                {
                    text: "لا طبعًا.",
                    state: "shock",
                },
                {
                    text: "خليك واقعي يا أحمد ❤️",
                    state: "good-news",
                    holdAfterFrames: 45,
                },
            ],
        },
    ],
};