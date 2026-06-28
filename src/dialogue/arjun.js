export const arjunDialogue = {
    nodes: {
        // === MORNING SCENE — Bandra Apartment ===
        morning_start: {
            speaker: 'Arjun',
            text: {
                hi: 'सुबह हो गई... आज का दिन भी बस ऐसे ही कटेगा।',
                en: 'It\'s morning... another day just like the rest.'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ोन उठाओ',
                        en: 'Pick up the phone'
                    },
                    next: 'morning_phone'
                }
            ]
        },
        morning_phone: {
            speaker: 'Assistant',
            text: {
                hi: 'अर्जुन भाई, विक्रम जी बोल रहे हैं रक्ष छाबड़ा की मीटिंग फाइनल हो गई। दो बजे कास्टिंग ऑफिस आना है।',
                en: 'Arjun bhai, Vikram ji says the Raksh Chhabra meeting is confirmed. Two o\'clock, casting office.'
            },
            options: [
                {
                    text: {
                        hi: 'अभी से? मैंने तैयारी भी नहीं की।',
                        en: 'Already? I haven\'t even prepared.'
                    },
                    next: 'morning_unprepared'
                },
                {
                    text: {
                        hi: 'पापा को बोल दो मैं आ रहा हूँ।',
                        en: 'Tell Dad I\'ll be there.'
                    },
                    next: 'morning_compliant'
                },
                {
                    text: {
                        hi: '...ठीक है।',
                        en: '...Okay.'
                    },
                    next: 'morning_resigned'
                }
            ]
        },
        morning_unprepared: {
            speaker: 'Assistant',
            text: {
                hi: 'विक्रम जी बोल रहे हैं तैयारी की ज़रूरत नहीं है। बस तुम्हारा चेहरा काफी है।',
                en: 'Vikram ji says no preparation needed. Your face is enough.'
            },
            options: [
                {
                    text: {
                        hi: '...बस चेहरा काफी है?',
                        en: '...Just my face is enough?'
                    },
                    next: 'morning_to_auto'
                }
            ]
        },
        morning_compliant: {
            speaker: 'Arjun',
            text: {
                hi: 'हाँ पापा... मैं आ रहा हूँ।',
                en: 'Yes Dad... I\'m coming.'
            },
            options: [
                {
                    text: {
                        hi: 'ऑटो बुलाओ',
                        en: 'Call an auto'
                    },
                    next: 'morning_to_auto',
                    effects: { arjun: { guilt: +5, respect: -5 } }
                }
            ]
        },
        morning_resigned: {
            speaker: 'Arjun',
            text: {
                hi: 'फिर वही... पापा की व्यवस्था, पापा की मर्ज़ी।',
                en: 'Same old... Dad\'s arrangement, Dad\'s wish.'
            },
            options: [
                {
                    text: {
                        hi: 'चलो चलते हैं',
                        en: 'Let\'s go'
                    },
                    next: 'morning_to_auto',
                    effects: { arjun: { guilt: +10 } }
                }
            ]
        },
        morning_to_auto: {
            speaker: 'Arjun',
            text: {
                hi: 'बांद्रा से कास्टिंग ऑफिस... चलो।',
                en: 'Bandra to the casting office... let\'s go.'
            },
            options: [
                {
                    text: {
                        hi: 'ऑटो में बैठो',
                        en: 'Get in the auto'
                    },
                    next: 'auto_start'
                }
            ]
        },

        // === AUTO RIDE — Conversation with Driver ===
        auto_start: {
            speaker: 'Auto Driver',
            text: {
                hi: 'कहाँ जाना है भाई?',
                en: 'Where to, brother?'
            },
            options: [
                {
                    text: {
                        hi: 'कास्टिंग ऑफिस, अंधेरी',
                        en: 'Casting office, Andheri'
                    },
                    next: 'auto_driver_response'
                }
            ]
        },
        auto_driver_response: {
            speaker: 'Auto Driver',
            text: {
                hi: 'अरे वाह! एक्टर हो क्या? फिल्मों में काम करते हो?',
                en: 'Oh wow! Are you an actor? Do you work in films?'
            },
            options: [
                {
                    text: {
                        hi: 'नहीं यार, बस... एक मीटिंग है।',
                        en: 'No man, just... a meeting.'
                    },
                    next: 'auto_driver_knows_father'
                }
            ]
        },
        auto_driver_knows_father: {
            speaker: 'Auto Driver',
            text: {
                hi: 'मल्होत्रा? अरे विक्रम मल्होत्रा जी का बेटा हो? धमाका प्रोडक्शंस वाले? उनका तो बड़ा नाम है!',
                en: 'Malhotra? Are you Vikram Malhotra\'s son? Dhamaka Productions? He\'s a big name!'
            },
            options: [
                {
                    text: {
                        hi: 'हाँ... वही हूँ।',
                        en: 'Yes... that\'s me.'
                    },
                    next: 'auto_driver_fame',
                    effects: { arjun: { guilt: +5, respect: -5 } }
                },
                {
                    text: {
                        hi: 'बस... पापा का नाम है, मेरा नहीं।',
                        en: 'Just... Dad\'s name, not mine.'
                    },
                    next: 'auto_driver_fame',
                    effects: { arjun: { guilt: -5, respect: +5 } }
                }
            ]
        },
        auto_driver_fame: {
            speaker: 'Auto Driver',
            text: {
                hi: 'अरे भाई, तुम्हारे पापा ने तो बहुत मेहनत की है। तुम तो लकी हो! बाप का नाम काम आता है।',
                en: 'Brother, your father has worked very hard. You\'re lucky! A father\'s name comes in handy.'
            },
            options: [
                {
                    text: {
                        hi: '...हाँ, लकी हूँ मैं।',
                        en: '...Yes, I\'m lucky.'
                    },
                    next: 'auto_arrival'
                }
            ]
        },
        auto_arrival: {
            speaker: 'Auto Driver',
            text: {
                hi: 'ये रहा कास्टिंग ऑफिस। ऑल द बेस्ट भाई!',
                en: 'Here\'s the casting office. All the best, brother!'
            },
            options: [
                {
                    text: {
                        hi: 'शुक्रिया',
                        en: 'Thanks'
                    },
                    next: 'arrival_office'
                }
            ]
        },

        // === CASTING OFFICE ARRIVAL ===
        arrival_office: {
            speaker: 'Office Staff',
            text: {
                hi: 'अर्जुन भाई! आप आ गए! आपके पापा ने फ़ोन किया था। बैठिए, रक्ष जी आते ही होंगे।',
                en: 'Arjun bhai! You\'re here! Your father called. Please sit, Raksh ji will be here any moment.'
            },
            options: [
                {
                    text: {
                        hi: 'शुक्रिया',
                        en: 'Thank you'
                    },
                    next: 'arrival_recognition'
                }
            ]
        },
        arrival_recognition: {
            speaker: 'Another Staff',
            text: {
                hi: 'अरे ये विक्रम मल्होत्रा जी के बेटे हैं! उनकी फिल्में देखी हैं सब। लीजेंड हैं वो।',
                en: 'These are Vikram Malhotra\'s son! We\'ve seen all his films. He\'s a legend.'
            },
            options: [
                {
                    text: {
                        hi: 'वेटिंग रूम में बैठते हैं',
                        en: 'Let\'s sit in the waiting room'
                    },
                    next: 'arrival_to_waiting'
                }
            ]
        },
        arrival_to_waiting: {
            speaker: 'Arjun',
            text: {
                hi: 'सब लोग पापा का नाम जानते हैं... मेरा नहीं।',
                en: 'Everyone knows Dad\'s name... not mine.'
            },
            options: [
                {
                    text: {
                        hi: 'वेटिंग रूम जाओ',
                        en: 'Go to the waiting room'
                    },
                    next: 'waiting_enter'
                }
            ]
        },

        // === WAITING ROOM — Encounter with Sundaram (Emotional Core) ===
        waiting_enter: {
            speaker: 'Arjun',
            text: {
                hi: 'वेटिंग रूम में एक आदमी बैठा है... लगता है वो भी ऑडिशन के लिए आया है। उसका हेडशॉट कुछ मुड़ा हुआ है।',
                en: 'There\'s a man sitting in the waiting room... looks like he\'s here for an audition too. His headshot is a bit creased.'
            },
            options: [
                {
                    text: {
                        hi: 'उससे बात करो',
                        en: 'Talk to him'
                    },
                    next: 'sundaram_meet',
                    effects: { sundaram: { empathy: +5, trust: +5 } }
                },
                {
                    text: {
                        hi: 'चुपचाप बैठो',
                        en: 'Sit quietly'
                    },
                    next: 'sundaram_silence',
                    effects: { sundaram: { empathy: -5 } }
                }
            ]
        },
        sundaram_meet: {
            speaker: 'Arjun',
            text: {
                hi: 'हैलो भैया... आप भी ऑडिशन दे रहे हो? आपका हेडशॉट देख रहा था... थोड़ा मुड़ गया है।',
                en: 'Hello brother... are you also giving an audition? I was looking at your headshot... it\'s a bit creased.'
            },
            options: [
                {
                    text: {
                        hi: 'हाँ, रक्ष छाबड़ा की फिल्म के लिए',
                        en: 'Yes, for Raksh Chhabra\'s film'
                    },
                    next: 'sundaram_intro'
                }
            ]
        },
        sundaram_silence: {
            speaker: 'Arjun',
            text: {
                hi: 'बस बैठकर इंतज़ार करते हैं... कुछ बोलने की ज़रूरत नहीं।',
                en: 'Just sitting and waiting... no need to say anything.'
            },
            options: [
                {
                    text: {
                        hi: 'फिर भी बात करो',
                        en: 'Talk anyway'
                    },
                    next: 'sundaram_meet'
                }
            ]
        },
        sundaram_intro: {
            speaker: 'Sundaram',
            text: {
                hi: 'हाँ भैया, रक्ष छाबड़ा की फिल्म है। तुम भी आए हो? ये हेडशॉट... बहुत मुश्किल से बनवाया है।',
                en: 'Yes brother, Raksh Chhabra\'s film. You\'ve come too? This headshot... made it with great difficulty.'
            },
            options: [
                {
                    text: {
                        hi: 'हाँ... पापा ने बोला था।',
                        en: 'Yes... Dad told me to come.'
                    },
                    next: 'sundaram_asks_father'
                }
            ]
        },
        sundaram_asks_father: {
            speaker: 'Sundaram',
            text: {
                hi: 'तुम्हारे पापा? कौन हैं तुम्हारे पापा?',
                en: 'Your father? Who is your father?'
            },
            options: [
                {
                    text: {
                        hi: 'विक्रम मल्होत्रा... धमाका प्रोडक्शंस।',
                        en: 'Vikram Malhotra... Dhamaka Productions.'
                    },
                    next: 'sundaram_reaction'
                }
            ]
        },
        sundaram_reaction: {
            speaker: 'Sundaram',
            text: {
                hi: 'विक्रम मल्होत्रा! अरे भैया, तुम तो बड़े आदमी के बेटे हो! तुम्हें तो कुछ करने की ज़रूरत नहीं।',
                en: 'Vikram Malhotra! Brother, you\'re a big man\'s son! You don\'t need to do anything.'
            },
            options: [
                {
                    text: {
                        hi: 'नहीं यार... मैं भी वैसे ही हूँ जैसे तुम।',
                        en: 'No man... I\'m just like you.'
                    },
                    next: 'sundaram_bhojpuri',
                    effects: { sundaram: { trust: +10, empathy: +5 } }
                }
            ]
        },
        sundaram_bhojpuri: {
            speaker: 'Sundaram',
            text: {
                hi: 'अरे नहीं भैया, तुम तो अलग हो। तुम्हारे पापा का नाम है। मेरे जैसे लोग तो बस... भटकते रहते हैं।',
                en: 'No brother, you\'re different. Your father has a name. People like me just... keep wandering.'
            },
            options: [
                {
                    text: {
                        hi: 'भटकते रहते हैं?',
                        en: 'Keep wandering?'
                    },
                    next: 'sundaram_story'
                }
            ]
        },
        sundaram_story: {
            speaker: 'Sundaram',
            text: {
                hi: 'हाँ भैया, मैं बिहार से आया हूँ। यहाँ मुंबई में कोई जानता नहीं। बस ऑडिशन देता रहता हूँ, कभी कभी कुछ होता है।',
                en: 'Yes brother, I\'m from Bihar. No one knows me here in Mumbai. I just keep giving auditions, sometimes something happens.'
            },
            options: [
                {
                    text: {
                        hi: 'कभी कभी कुछ होता है?',
                        en: 'Sometimes something happens?'
                    },
                    next: 'sundaram_hope'
                }
            ]
        },
        sundaram_hope: {
            speaker: 'Sundaram',
            text: {
                hi: 'हाँ भैया, उम्मीद है ना? बस वही है। तुम्हारे पापा ने तो सब कर दिया, तुम्हें बस आना था।',
                en: 'Yes brother, there\'s hope, right? That\'s all there is. Your father has done everything, you just had to show up.'
            },
            options: [
                {
                    text: {
                        hi: 'शायद तुम सही कह रहे हो...',
                        en: 'Maybe you\'re right...'
                    },
                    next: 'sundaram_bhojpuri_attempt',
                    effects: { sundaram: { empathy: +10 }, arjun: { guilt: +5 } }
                }
            ]
        },
        sundaram_bhojpuri_attempt: {
            speaker: 'Arjun',
            text: {
                hi: 'भैया... एक बात बोलूँ? मुझे भोजपुरी थोड़ी बहुत आती है... मेरी माँ बिहार से हैं।',
                en: 'Brother... can I say something? I know a little Bhojpuri... my mother is from Bihar.'
            },
            options: [
                {
                    text: {
                        hi: 'आधी-अधूरी भोजपुरी बोलो',
                        en: 'Speak half-remembered Bhojpuri'
                    },
                    next: 'sundaram_bhojpuri_response',
                    effects: { sundaram: { trust: +15, empathy: +10 } }
                },
                {
                    text: {
                        hi: 'नहीं, कुछ नहीं',
                        en: 'No, nothing'
                    },
                    next: 'sundaram_advice',
                    effects: { sundaram: { trust: -5 } }
                }
            ]
        },
        sundaram_bhojpuri_response: {
            speaker: 'Sundaram',
            text: {
                hi: 'अरे भैया! तुम भोजपुरी जानते हो? क्या बात है! तुम तो अपने ही लगे!',
                en: 'Oh brother! You know Bhojpuri? Wow! You seem like one of us!'
            },
            options: [
                {
                    text: {
                        hi: 'बस थोड़ा बहुत... माँ से सीखा है।',
                        en: 'Just a little... learned from mother.'
                    },
                    next: 'sundaram_advice',
                    effects: { sundaram: { trust: +10, respect: +5 } }
                }
            ]
        },
        sundaram_advice: {
            speaker: 'Sundaram',
            text: {
                hi: 'भैया, एक बात बोलूँ? तुम्हारे पापा का नाम है, पर तुम भी कुछ करो। बस नाम से काम नहीं चलता।',
                en: 'Brother, can I say one thing? Your father has a name, but you should do something too. Just a name isn\'t enough.'
            },
            options: [
                {
                    text: {
                        hi: '...तुम सही कह रहे हो।',
                        en: '...You\'re right.'
                    },
                    next: 'audition_call',
                    effects: { sundaram: { trust: +15, respect: +10 } }
                }
            ]
        },

        // === AUDITION — Narrative Sequence ===
        audition_call: {
            speaker: 'Assistant',
            text: {
                hi: 'अर्जुन जी? आपका नंबर है... अंदर आइए।',
                en: 'Arjun ji? Your number is... please come inside.'
            },
            options: [
                {
                    text: {
                        hi: 'ऑडिशन रूम में जाओ',
                        en: 'Go to the audition room'
                    },
                    next: 'audition_enter'
                }
            ]
        },
        audition_enter: {
            speaker: 'Raksh',
            text: {
                hi: 'अर्जुन... विक्रम का बेटा? ठीक है, बैठो। क्या करना चाहते हो?',
                en: 'Arjun... Vikram\'s son? Alright, sit. What do you want to do?'
            },
            options: [
                {
                    text: {
                        hi: 'मैं एक्टिंग करना चाहता हूँ।',
                        en: 'I want to act.'
                    },
                    next: 'audition_scene'
                }
            ]
        },
        audition_scene: {
            speaker: 'Raksh',
            text: {
                hi: 'ठीक है, एक सीन करो। तुम्हारे पिता ने बोला है तुममें वो बात है। दिखाओ।',
                en: 'Alright, do a scene. Your father says you have it in you. Show me.'
            },
            options: [
                {
                    text: {
                        hi: 'एक सीन करो — इमोशनल ड्रामा',
                        en: 'Do a scene — emotional drama'
                    },
                    next: 'audition_perform'
                }
            ]
        },
        audition_perform: {
            speaker: 'Arjun',
            text: {
                hi: '...मैंने सब कुछ खो दिया है। अब कुछ नहीं बचा। बस... खामोशी है।',
                en: '...I\'ve lost everything. Nothing\'s left now. Just... silence.'
            },
            options: [
                {
                    text: {
                        hi: 'सीन खत्म करो',
                        en: 'Finish the scene'
                    },
                    next: 'audition_response',
                    effects: { arjun: { respect: +5 } }
                }
            ]
        },
        audition_response: {
            speaker: 'Raksh',
            text: {
                hi: 'तुम्हारे पापा की instinct हमेशा सही होती है। तुम्हें वो look है। कर लेंगे।',
                en: 'Your father\'s instincts are always right. You have the look. We\'ll manage.'
            },
            options: [
                {
                    text: {
                        hi: '...शुक्रिया',
                        en: '...Thank you'
                    },
                    next: 'post_audition'
                }
            ]
        },

        // === POST-AUDITION — Call from Father ===
        post_audition: {
            speaker: 'Arjun',
            text: {
                hi: 'ऑडिशन खत्म हुआ... रक्ष जी ने बोला पापा की instinct सही है।',
                en: 'Audition\'s done... Raksh ji said Dad\'s instinct is right.'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ोन आता है',
                        en: 'Phone rings'
                    },
                    next: 'post_audition_call'
                }
            ]
        },
        post_audition_call: {
            speaker: 'Vikram',
            text: {
                hi: 'अर्जुन, रक्ष ने बोला तुमने अच्छा किया। मैंने बोला था ना? तुममें वो बात है।',
                en: 'Arjun, Raksh said you did well. I told you, right? You have it in you.'
            },
            options: [
                {
                    text: {
                        hi: 'पापा, रक्ष जी ने बोला आपकी instinct...',
                        en: 'Dad, Raksh ji said your instinct...'
                    },
                    next: 'post_audition_father'
                }
            ]
        },
        post_audition_father: {
            speaker: 'Vikram',
            text: {
                hi: 'मेरी instinct? मैंने तुम्हें जन्म दिया, मैं जानता हूँ तुम क्या हो। चलो, शाम को घर आओ, डिनर करते हैं।',
                en: 'My instinct? I gave you birth, I know what you are. Come home tonight, let\'s have dinner.'
            },
            options: [
                {
                    text: {
                        hi: '...ठीक है पापा।',
                        en: '...Okay Dad.'
                    },
                    next: 'dinner_start'
                }
            ]
        },

        // === DINNER CONFRONTATION — Climax ===
        dinner_start: {
            speaker: 'Arjun',
            text: {
                hi: 'रेस्तरां में बैठे हैं... पापा ने महंगी जगह चुनी है। जैसे हर चीज़ में पैसा झलकता है।',
                en: 'Sitting in the restaurant... Dad chose an expensive place. Like money shows in everything.'
            },
            options: [
                {
                    text: {
                        hi: 'पापा का इंतज़ार करो',
                        en: 'Wait for Dad'
                    },
                    next: 'dinner_vikram_arrives'
                }
            ]
        },
        dinner_vikram_arrives: {
            speaker: 'Vikram',
            text: {
                hi: 'बैठो अर्जुन। आज का दिन कैसा रहा?',
                en: 'Sit down Arjun. How was your day?'
            },
            options: [
                {
                    text: {
                        hi: 'अच्छा था... ऑडिशन हुआ।',
                        en: 'It was good... had the audition.'
                    },
                    next: 'dinner_father_pride'
                }
            ]
        },
        dinner_father_pride: {
            speaker: 'Vikram',
            text: {
                hi: 'हाँ, रक्ष ने बताया। बहुत खुश हूँ अर्जुन। तुम्हारे पापा ने बहुत मेहनत की है इंडस्ट्री में।',
                en: 'Yes, Raksh told me. I\'m very happy, Arjun. Your father has worked very hard in this industry.'
            },
            options: [
                {
                    text: {
                        hi: 'पापा, मैं जानता हूँ...',
                        en: 'Dad, I know...'
                    },
                    next: 'dinner_confrontation'
                }
            ]
        },
        dinner_confrontation: {
            speaker: 'Arjun',
            text: {
                hi: 'पापा, एक बात पूछूँ? क्या मैं सच में एक्टिंग कर सकता हूँ... या सिर्फ आपके नाम की वजह से?',
                en: 'Dad, can I ask one thing? Can I really act... or is it just because of your name?'
            },
            options: [
                {
                    text: {
                        hi: 'पापा का जवाब सुनो',
                        en: 'Hear Dad\'s response'
                    },
                    next: 'dinner_key_line'
                }
            ]
        },
        dinner_key_line: {
            speaker: 'Vikram',
            text: {
                hi: 'तेरे बाप ने मेहनत की है ताकि तेरे को मेहनत ना करनी पड़े। यही ज़िन्दगी है।',
                en: 'Your father worked hard so you wouldn\'t have to. That\'s life.'
            },
            options: [
                {
                    text: {
                        hi: 'पर पापा... मैं भी तो कुछ करना चाहता हूँ।',
                        en: 'But Dad... I also want to do something.'
                    },
                    next: 'dinner_father_anger'
                }
            ]
        },
        dinner_father_anger: {
            speaker: 'Vikram',
            text: {
                hi: 'क्या करना चाहता है? तेरे जैसे सैकड़ों लोग हैं इस मुंबई में जो भटकते रहते हैं। तुझे तो सब मिल गया।',
                en: 'What do you want to do? There are hundreds like you in Mumbai who keep wandering. You\'ve got everything.'
            },
            options: [
                {
                    text: {
                        hi: 'पर मुझे वो सब नहीं चाहिए... मुझे अपने लिए कुछ करना है।',
                        en: 'But I don\'t want all that... I want to do something for myself.'
                    },
                    next: 'dinner_father_final',
                    effects: { arjun: { guilt: -10, respect: +10 } }
                }
            ]
        },
        dinner_father_final: {
            speaker: 'Vikram',
            text: {
                hi: 'अपने लिए? जो तेरे पास है वो तेरे लिए ही तो है। और क्या चाहिए?',
                en: 'For yourself? What you have is for you only. What more do you want?'
            },
            options: [
                {
                    text: {
                        hi: '...कुछ नहीं पापा।',
                        en: '...Nothing Dad.'
                    },
                    next: 'dinner_realization',
                    effects: { arjun: { guilt: +10, respect: -10 } }
                }
            ]
        },
        dinner_realization: {
            speaker: 'Arjun',
            text: {
                hi: 'पापा की बातें सुनकर लगता है... शायद वो सही कह रहे हैं। या शायद नहीं। सुंदरम की बातें याद आ रही हैं।',
                en: 'Listening to Dad... maybe he\'s right. Or maybe not. Sundaram\'s words are coming back to me.'
            },
            options: [
                {
                    text: {
                        hi: 'अंत',
                        en: 'End'
                    },
                    effect: () => { console.log('Arjun chapter ended'); },
                    effects: { arjun: { guilt: +5 } }
                }
            ]
        }
    }
};
