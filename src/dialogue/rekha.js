export const REKHA_DIALOGUE = {
    nodes: {
        // === MORNING ROUTINE — Rekha's Apartment, Bandra ===
        morning_start: {
            speaker: 'Rekha',
            text: {
                hi: 'फ़िल्टर कॉफ़ी... माँ ने सिखाया था, तमिल तरीके से। तीस साल हो गए, वही कप।',
                en: 'Filter coffee... mother taught me, the Tamil way. Thirty years, same cup.'
            },
            options: [
                {
                    text: {
                        hi: 'स्क्रिप्ट्स देखो',
                        en: 'Look at the scripts'
                    },
                    next: 'morning_scripts'
                },
                {
                    text: {
                        hi: 'फ़ोन उठाओ',
                        en: 'Pick up the phone'
                    },
                    next: 'morning_phone_check'
                }
            ]
        },
        morning_scripts: {
            speaker: 'Rekha',
            text: {
                hi: 'आज की स्क्रिप्ट्स... एक ही तरह की। नए चेहरे, पुरानी कहानी। कब तक देखूँ?',
                en: 'Today\'s scripts... all the same. New faces, old stories. How long can I keep watching?'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ोन की घंटी बजती है',
                        en: 'Phone rings'
                    },
                    next: 'morning_phone_ring'
                }
            ]
        },
        morning_phone_check: {
            speaker: 'Rekha',
            text: {
                hi: 'फ़ोन पर मिस्ड कॉल... विक्रम का है। हमेशा की तरह, सुबह से।',
                en: 'Missed calls on the phone... Vikram\'s. Like always, since morning.'
            },
            options: [
                {
                    text: {
                        hi: 'वापस कॉल करो',
                        en: 'Call back'
                    },
                    next: 'morning_phone_ring'
                },
                {
                    text: {
                        hi: 'अनदेखा करो',
                        en: 'Ignore it'
                    },
                    next: 'morning_ignore'
                }
            ]
        },
        morning_phone_ring: {
            speaker: 'Vikram',
            text: {
                hi: 'रेखा, तुम्हें पता है ना आज रक्ष छाबड़ा की मीटिंग है? रेकॉर्ड्स भेज दो।',
                en: 'Rekha, you know about today\'s Raksh Chhabra meeting? Send the records.'
            },
            options: [
                {
                    text: {
                        hi: 'हाँ, भेज दूँगी।',
                        en: 'Yes, I\'ll send them.'
                    },
                    next: 'morning_to_office',
                    effects: { rekha: { complicity: +5, trust: +5 } }
                },
                {
                    text: {
                        hi: 'विक्रम, एक मिनट... आज कौन-कौन है लिस्ट में?',
                        en: 'Vikram, one minute... who all are on the list today?'
                    },
                    next: 'morning_list_question'
                }
            ]
        },
        morning_ignore: {
            speaker: 'Rekha',
            text: {
                hi: 'अनदेखा कर सकती हूँ... पर कर नहीं पाती। यही तो है तीस साल का बोझ।',
                en: 'I could ignore it... but I can\'t. That\'s the weight of thirty years.'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ोन उठाओ',
                        en: 'Pick up the phone'
                    },
                    next: 'morning_phone_ring'
                }
            ]
        },
        morning_list_question: {
            speaker: 'Vikram',
            text: {
                hi: 'लिस्ट में कौन है, तुम्हें पता है। वही लोग। बस रेकॉर्ड्स भेज दो।',
                en: 'Who\'s on the list, you know. Same people. Just send the records.'
            },
            options: [
                {
                    text: {
                        hi: '...ठीक है।',
                        en: '...Okay.'
                    },
                    next: 'morning_to_office',
                    effects: { rekha: { complicity: +10, trust: +5 } }
                }
            ]
        },
        morning_to_office: {
            speaker: 'Rekha',
            text: {
                hi: 'चलो, ऑफिस चलते हैं। वही रास्ता, वही ट्रैफ़िक, वही ज़िन्दगी।',
                en: 'Let\'s go, to the office. Same road, same traffic, same life.'
            },
            options: [
                {
                    text: {
                        hi: 'ऑफिस जाओ',
                        en: 'Go to the office'
                    },
                    next: 'office_arrival'
                }
            ]
        },

        // === REVIEWING TAPES — Casting Office ===
        office_arrival: {
            speaker: 'Rekha',
            text: {
                hi: 'ऑफिस में आते ही वही खुशबू... पुरानी कॉफ़ी और नई उम्मीदों की।',
                en: 'The same smell as soon as I enter... old coffee and new hopes.'
            },
            options: [
                {
                    text: {
                        hi: 'ऑडिशन टेप देखो',
                        en: 'Watch the audition tapes'
                    },
                    next: 'tapes_start'
                }
            ]
        },
        tapes_start: {
            speaker: 'Rekha',
            text: {
                hi: 'आज के टेप... पहले वाला लड़का, सुंदरम। बिहार से आया है।',
                en: 'Today\'s tapes... the first boy, Sundaram. Came from Bihar.'
            },
            options: [
                {
                    text: {
                        hi: 'सुंदरम का टेप देखो',
                        en: 'Watch Sundaram\'s tape'
                    },
                    next: 'tapes_sundaram'
                }
            ]
        },
        tapes_sundaram: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम... इसमें कुछ है। असली भावना है। बिहार से आया है, मुंबई में कोई नहीं। फिर भी खड़ा है।',
                en: 'Sundaram... there\'s something in him. Real emotion. Came from Bihar, no one in Mumbai. Still standing.'
            },
            options: [
                {
                    text: {
                        hi: 'अर्जुन का टेप देखो',
                        en: 'Watch Arjun\'s tape'
                    },
                    next: 'tapes_arjun'
                },
                {
                    text: {
                        hi: 'सुंदरम का टेप फिर से देखो',
                        en: 'Watch Sundaram\'s tape again'
                    },
                    next: 'tapes_sundaram_again'
                }
            ]
        },
        tapes_sundaram_again: {
            speaker: 'Rekha',
            text: {
                hi: 'एक बार और... हाँ। इस लड़के में वो बात है जो बाकी में नहीं। असली दर्द है।',
                en: 'Once more... yes. This boy has what the others don\'t. Real pain.'
            },
            options: [
                {
                    text: {
                        hi: 'अर्जुन का टेप देखो',
                        en: 'Watch Arjun\'s tape'
                    },
                    next: 'tapes_arjun'
                }
            ]
        },
        tapes_arjun: {
            speaker: 'Rekha',
            text: {
                hi: 'अर्जुन... विक्रम का बेटा। अच्छा चेहरा है, पर अंदर कुछ नहीं। सब बाहर से आता है।',
                en: 'Arjun... Vikram\'s son. Good face, but nothing inside. Everything comes from outside.'
            },
            options: [
                {
                    text: {
                        hi: 'तुलना करो',
                        en: 'Compare them'
                    },
                    next: 'tapes_compare'
                }
            ]
        },
        tapes_compare: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम में टैलेंट है, अर्जुन में नाम है। इंडस्ट्री किसको चुनेगी? वही जो हमेशा चुनती है।',
                en: 'Sundaram has talent, Arjun has a name. Who will the industry choose? The same one it always chooses.'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ोन बजता है — विक्रम',
                        en: 'Phone rings — Vikram'
                    },
                    next: 'call_vikram_start'
                }
            ]
        },

        // === PHONE CALL WITH VIKRAM — The Moral Climax ===
        call_vikram_start: {
            speaker: 'Vikram',
            text: {
                hi: 'रेखा, टेप देख लिए? अर्जुन का कैसा है?',
                en: 'Rekha, watched the tapes? How\'s Arjun\'s?'
            },
            options: [
                {
                    text: {
                        hi: 'विक्रम... अर्जुन अच्छा है, पर सुंदरम बेहतर है।',
                        en: 'Vikram... Arjun is good, but Sundaram is better.'
                    },
                    next: 'call_pushback'
                },
                {
                    text: {
                        hi: 'विक्रम, सुनो... आज के टेप में एक लड़का है, सुंदरम। उसमें असली टैलेंट है।',
                        en: 'Vikram, listen... there\'s a boy in today\'s tapes, Sundaram. He has real talent.'
                    },
                    next: 'call_pushback'
                }
            ]
        },
        call_pushback: {
            speaker: 'Vikram',
            text: {
                hi: 'रेखा, मैं समझता हूँ। पर रक्ष छाबड़ा ने बोला है — उन्हें एक चेहरा चाहिए जो फ़ैमिली फ्रेंडली हो। अर्जुन फ़िट बैठता है।',
                en: 'Rekha, I understand. But Raksh Chhabra said — he needs a face that\'s family-friendly. Arjun fits.'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ैमिली फ्रेंडली? सुंदरम ज़्यादा असली है।',
                        en: 'Family-friendly? Sundaram is more real.'
                    },
                    next: 'call_pushback_2'
                },
                {
                    text: {
                        hi: 'विक्रम, मैंने तीस साल देखे हैं। ज़रा रुको...',
                        en: 'Vikram, I\'ve seen thirty years. Just wait...'
                    },
                    next: 'call_pushback_2'
                }
            ]
        },
        call_pushback_2: {
            speaker: 'Vikram',
            text: {
                hi: 'रेखा, तुम जानती हो यह कैसे काम करता है। टैलेंट अकेले काम नहीं करता। तुम्हारा काम है मेरे लिए चुनना।',
                en: 'Rekha, you know how this works. Talent alone doesn\'t work. Your job is to choose for me.'
            },
            options: [
                {
                    text: {
                        hi: 'तुम्हारे लिए? मैं इंडस्ट्री के लिए चुनती हूँ।',
                        en: 'For you? I choose for the industry.'
                    },
                    next: 'call_pushback_3'
                }
            ]
        },
        call_pushback_3: {
            speaker: 'Vikram',
            text: {
                hi: 'रेखा... तुम जानती हो कि अगर मैंने रक्ष से बोल दिया कि तुमने सही नहीं चुना... तो तुम्हारा क्या होगा?',
                en: 'Rekha... you know if I tell Raksh you didn\'t choose right... what will happen to you?'
            },
            options: [
                {
                    text: {
                        hi: '...धमकी दे रहे हो?',
                        en: '...Are you threatening me?'
                    },
                    next: 'call_relent'
                },
                {
                    text: {
                        hi: 'विक्रम, ये ग़लत है।',
                        en: 'Vikram, this is wrong.'
                    },
                    next: 'call_relent'
                }
            ]
        },
        call_relent: {
            speaker: 'Rekha',
            text: {
                hi: '...ठीक है विक्रम। अर्जुन का नाम आगे रख दो।',
                en: '...Okay Vikram. Put Arjun\'s name forward.'
            },
            options: [
                {
                    text: {
                        hi: 'फ़ोन रख दो',
                        en: 'Put down the phone'
                    },
                    next: 'call_aftermath',
                    effects: { rekha: { complicity: +15, trust: -10 } }
                }
            ]
        },
        call_aftermath: {
            speaker: 'Rekha',
            text: {
                hi: 'फ़ोन रखा। हाथ काँप रहे हैं। तीस साल... और आज भी वही होता है। मैं चुनती हूँ, पर चुनाव मेरा नहीं।',
                en: 'Put down the phone. Hands are shaking. Thirty years... and it\'s still the same. I choose, but the choice isn\'t mine.'
            },
            options: [
                {
                    text: {
                        hi: '1998 याद आता है...',
                        en: '1998 comes back...'
                    },
                    next: 'flashback_start'
                }
            ]
        },

        // === FLASHBACK TRIGGER — 1998 Adivasi Actress ===
        flashback_start: {
            speaker: 'Rekha',
            text: {
                hi: '1998... वो लड़की। आदिवासी। नाम था उसका... क्या था नाम? भूल गई। नहीं, याद है।',
                en: '1998... that girl. Adivasi. Her name was... what was it? Forgot. No, I remember.'
            },
            options: [
                {
                    text: {
                        hi: 'नाम याद करो',
                        en: 'Remember the name'
                    },
                    next: 'flashback_name'
                }
            ]
        },
        flashback_name: {
            speaker: 'Rekha',
            text: {
                hi: 'गीता। गीता था नाम। झारखंड से आई थी। इतनी खूबसूरत... और इतनी असली।',
                en: 'Geeta. The name was Geeta. Came from Jharkhand. So beautiful... and so real.'
            },
            options: [
                {
                    text: {
                        hi: 'क्या हुआ था?',
                        en: 'What happened?'
                    },
                    next: 'flashback_story'
                }
            ]
        },
        flashback_story: {
            speaker: 'Rekha',
            text: {
                hi: 'मैंने उसे चुना था। सबसे अच्छी थी। पर प्रोड्यूसर ने बोला — इसका चेहरा "बहुत गाँव वाला" है। हीरोइन नहीं बन सकती।',
                en: 'I had chosen her. She was the best. But the producer said — her face is "too village". Can\'t be a heroine.'
            },
            options: [
                {
                    text: {
                        hi: 'तुमने क्या किया?',
                        en: 'What did you do?'
                    },
                    next: 'flashback_choice'
                }
            ]
        },
        flashback_choice: {
            speaker: 'Rekha',
            text: {
                hi: 'मैंने कुछ नहीं किया। बस चुप रही। गीता चली गई। पता नहीं कहाँ। शायद वापस झारखंड चली गई।',
                en: 'I did nothing. Just stayed quiet. Geeta left. Don\'t know where. Maybe went back to Jharkhand.'
            },
            options: [
                {
                    text: {
                        hi: 'वापस वर्तमान में आओ',
                        en: 'Return to the present'
                    },
                    next: 'flashback_end'
                }
            ]
        },
        flashback_end: {
            speaker: 'Rekha',
            text: {
                hi: 'आज भी वही होता है। असली टैलेंट को कोई नहीं चाहता। बस चेहरा चाहिए, नाम चाहिए। मैं चुप रहती हूँ। हमेशा की तरह।',
                en: 'It still happens today. No one wants real talent. Just a face, a name. I stay quiet. Like always.'
            },
            options: [
                {
                    text: {
                        hi: 'सुंदरम आता है',
                        en: 'Sundaram arrives'
                    },
                    next: 'meeting_sundaram_start'
                }
            ]
        },

        // === MEETING SUNDARAM — After His Audition ===
        meeting_sundaram_start: {
            speaker: 'Sundaram',
            text: {
                hi: 'रेखा मैडम... मेरा ऑडिशन कैसा था? सच बताइए।',
                en: 'Rekha madam... how was my audition? Tell me the truth.'
            },
            options: [
                {
                    text: {
                        hi: 'सच बताओ',
                        en: 'Tell the truth'
                    },
                    next: 'meeting_truth'
                },
                {
                    text: {
                        hi: 'टालो',
                        en: 'Deflect'
                    },
                    next: 'meeting_deflect'
                }
            ]
        },
        meeting_truth: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम... तुम्हारा ऑडिशन बहुत अच्छा था। सबसे अच्छा। मैं तीस साल से देख रही हूँ, तुममें वो बात है।',
                en: 'Sundaram... your audition was very good. The best. I\'ve been watching for thirty years, you have it.'
            },
            options: [
                {
                    text: {
                        hi: 'पर क्या होगा?',
                        en: 'But what will happen?'
                    },
                    next: 'meeting_reality'
                }
            ]
        },
        meeting_deflect: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम... ऑडिशन अच्छा था। हम आपको कॉल करेंगे।',
                en: 'Sundaram... the audition was good. We\'ll call you.'
            },
            options: [
                {
                    text: {
                        hi: 'सुंदरम ज़ोर देता है',
                        en: 'Sundaram presses'
                    },
                    next: 'meeting_push'
                }
            ]
        },
        meeting_push: {
            speaker: 'Sundaram',
            text: {
                hi: 'मैडम, सच बताइए। मैं बिहार से आया हूँ। मुझे पता है कि इंडस्ट्री कैसे काम करती है। सच बताइए।',
                en: 'Madam, tell me the truth. I came from Bihar. I know how the industry works. Tell me the truth.'
            },
            options: [
                {
                    text: {
                        hi: 'सच बताओ',
                        en: 'Tell the truth'
                    },
                    next: 'meeting_reality'
                }
            ]
        },
        meeting_reality: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम... सच ये है कि तुम्हारा टैलेंट बहुत अच्छा है। पर इंडस्ट्री सिर्फ टैलेंट नहीं देखती। नाम चाहिए, पहचान चाहिए।',
                en: 'Sundaram... the truth is your talent is very good. But the industry doesn\'t just see talent. You need a name, a identity.'
            },
            options: [
                {
                    text: {
                        hi: 'सुंदरम की प्रतिक्रिया',
                        en: 'Sundaram\'s reaction'
                    },
                    next: 'meeting_sundaram_reaction'
                }
            ]
        },
        meeting_sundaram_reaction: {
            speaker: 'Sundaram',
            text: {
                hi: 'तो मतलब... मैं बेकार हूँ? मैंने इतनी मेहनत की... और बस नाम नहीं है तो कुछ नहीं?',
                en: 'So I\'m worthless? I worked so hard... and just because I don\'t have a name, nothing?'
            },
            options: [
                {
                    text: {
                        hi: 'उसे सांत्वना दो',
                        en: 'Comfort him'
                    },
                    next: 'meeting_comfort'
                },
                {
                    text: {
                        hi: 'कुछ मत बोलो',
                        en: 'Say nothing'
                    },
                    next: 'meeting_silence'
                }
            ]
        },
        meeting_comfort: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम... तुम बेकार नहीं हो। मैंने तुम्हें देखा है। तुममें वो बात है। पर मैं... मैं अकेली नहीं चुन सकती।',
                en: 'Sundaram... you\'re not worthless. I\'ve seen you. You have it. But I... I can\'t choose alone.'
            },
            options: [
                {
                    text: {
                        hi: 'सुंदरम चला जाता है',
                        en: 'Sundaram leaves'
                    },
                    next: 'meeting_end'
                }
            ]
        },
        meeting_silence: {
            speaker: 'Rekha',
            text: {
                hi: '...कुछ नहीं बोल पाती। जैसे 1998 में गीता के लिए कुछ नहीं बोली थी।',
                en: '...Can\'t say anything. Like I didn\'t say anything for Geeta in 1998.'
            },
            options: [
                {
                    text: {
                        hi: 'सुंदरम चला जाता है',
                        en: 'Sundaram leaves'
                    },
                    next: 'meeting_end'
                }
            ]
        },
        meeting_end: {
            speaker: 'Rekha',
            text: {
                hi: 'सुंदरम चला गया। उसके कदमों में वही था जो गीता के कदमों में था — टूटी उम्मीद।',
                en: 'Sundaram left. In his steps was what was in Geeta\'s steps — broken hope.'
            },
            options: [
                {
                    text: {
                        hi: 'शाम होती है',
                        en: 'Evening falls'
                    },
                    next: 'ending_start'
                }
            ]
        },

        // === ENDING — Glass of Wine, The Photo ===
        ending_start: {
            speaker: 'Rekha',
            text: {
                hi: 'शाम हो गई। एक गिलास वाइन... तीस साल का हिसाब।',
                en: 'Evening\'s here. A glass of wine... thirty years of accounting.'
            },
            options: [
                {
                    text: {
                        hi: 'तस्वीर देखो',
                        en: 'Look at the photo'
                    },
                    next: 'ending_photo'
                }
            ]
        },
        ending_photo: {
            speaker: 'Rekha',
            text: {
                hi: 'वो तस्वीर... 1998 की। मैं और गीता। उस दिन उसने पहली बार कहा था — मैडम, आप मेरी हीरोइन हो।',
                en: 'That photo... from 1998. Me and Geeta. That day she said for the first time — madam, you\'re my heroine.'
            },
            options: [
                {
                    text: {
                        hi: 'वाइन पीओ',
                        en: 'Drink the wine'
                    },
                    next: 'ending_reflection'
                }
            ]
        },
        ending_reflection: {
            speaker: 'Rekha',
            text: {
                hi: 'तीस साल... कितने चेहरे देखे, कितनी उम्मीदें तोड़ीं। मैं क्या हूँ? गेटकीपर? साथी? या बस... एक और चुप रहने वाली?',
                en: 'Thirty years... how many faces saw, how many hopes broken. What am I? Gatekeeper? Companion? Or just... another one who stays quiet?'
            },
            options: [
                {
                    text: {
                        hi: 'अंत',
                        en: 'End'
                    },
                    next: 'ending_final'
                }
            ]
        },
        ending_final: {
            speaker: 'Rekha',
            text: {
                hi: 'कल फिर वही होगा। नए चेहरे, नई उम्मीदें। और मैं... वही रहूँगी। चुनती रहूँगी, पर चुनाव मेरा नहीं।',
                en: 'Tomorrow the same will happen. New faces, new hopes. And I... I\'ll be the same. Keep choosing, but the choice won\'t be mine.'
            },
            options: [
                {
                    text: {
                        hi: 'खत्म',
                        en: 'Finish'
                    },
                    effect: () => { console.log('Rekha chapter ended'); },
                    effects: { rekha: { complicity: +5 } }
                }
            ]
        }
    }
};
