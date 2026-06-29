export const sundaramDialogue = {
    nodes: {
        start: {
            speaker: 'Sundaram',
            text: {
                hi: 'यही है वो कास्टिंग ऑफिस... देखते हैं क्या होता है।',
                en: 'This is the casting office... let\'s see what happens.',
                bhojpuri: 'ईहे है ओ कास्टिंग ऑफिस... देखते हैं का होता है।'
            },
            options: [
                {
                    text: {
                        hi: 'अंदर जाओ',
                        en: 'Go inside',
                        bhojpuri: 'अंदर जाव'
                    },
                    next: 'enter_office'
                },
                {
                    text: {
                        hi: 'पहले इधर-उधर देखो',
                        en: 'Look around first',
                        bhojpuri: 'पहिले इधर-उधर देखव'
                    },
                    next: 'look_around'
                }
            ]
        },
        enter_office: {
            speaker: 'Sundaram',
            text: {
                hi: 'अंदर जाते हैं... देखते हैं कौन है।',
                en: 'Let\'s go inside... see who\'s there.',
                bhojpuri: 'अंदर जाते हैं... देखते हैं कौन है।'
            },
            options: [
                {
                    text: {
                        hi: 'वेटिंग रूम में बैठो',
                        en: 'Sit in the waiting room',
                        bhojpuri: 'वेटिंग रूम में बैठव'
                    },
                    next: 'waiting_room'
                },
                {
                    text: {
                        hi: 'चाय वाले से चाय लो',
                        en: 'Get tea from the chai wallah',
                        bhojpuri: 'चाय वाला से चाय लेव'
                    },
                    next: 'chai'
                }
            ]
        },
        look_around: {
            speaker: 'Sundaram',
            text: {
                hi: 'पहले इधर-उधर देखते हैं... दादर से यहाँ तक 16 घंटे की ट्रेन थी। पटना से मुंबई... वही सपना, बस शहर बदल गया।',
                en: 'Let me look around first... 16 hours by train from Dadar. Patna to Mumbai... same dream, just a different city.',
                bhojpuri: 'पहिले इधर-उधर देखते हैं... दादर से यहाँ तक 16 घंटे की ट्रेन थी। पटना से मुंबई... वही सपना, बस शहर बदल गया।'
            },
            options: [
                {
                    text: {
                        hi: 'अंदर जाओ',
                        en: 'Go inside',
                        bhojpuri: 'अंदर जाव'
                    },
                    next: 'enter_office'
                },
                {
                    text: {
                        hi: 'चाय वाले से चाय लो',
                        en: 'Get tea from the chai wallah',
                        bhojpuri: 'चाय वाला से चाय लेव'
                    },
                    next: 'chai'
                }
            ]
        },
        chai: {
            speaker: 'Sundaram',
            text: {
                hi: 'चाय वाला: "चाय लोगे?" ... लगता है बिहारी है। एहसान हो जाएगा।',
                en: 'Chai wallah: "Want some tea?" ... Looks like he\'s from Bihar. A familiar connection.',
                bhojpuri: 'चाय वाला: "चाय लेव?" ... लगता है बिहारी है। एहसान हो जाएगा।'
            },
            options: [
                {
                    text: {
                        hi: '"बिहारी हो?"',
                        en: '"Are you from Bihar?"',
                        bhojpuri: '"बिहारी हो?"'
                    },
                    next: 'chai_bihar'
                },
                {
                    text: {
                        hi: 'बस चाय लो',
                        en: 'Just take the tea',
                        bhojpuri: 'बस चाय लेव'
                    },
                    next: 'enter_office'
                }
            ]
        },
        chai_bihar: {
            speaker: 'Sundaram',
            text: {
                hi: 'चाय वाला: "हाँ भैया, पटना से। यहाँ चाय बेचते हैं, सपने देखते हैं।" ... अच्छा लगा कोई अपना मिला।',
                en: 'Chai wallah: "Yes brother, from Patna. Sell tea here, dream here." ... Nice to find someone from home.',
                bhojpuri: 'चाय वाला: "हाँ भैया, पटना से। यहाँ चाय बेचते हैं, सपने देखते हैं।" ... अच्छा लगा कोई अपना मिला।'
            },
            options: [
                {
                    text: {
                        hi: 'अंदर जाओ',
                        en: 'Go inside',
                        bhojpuri: 'अंदर जाव'
                    },
                    next: 'enter_office'
                }
            ]
        },
        waiting_room: {
            speaker: 'Sundaram',
            text: {
                hi: 'वेटिंग रूम में बैठे हैं... सब मुंबई वाले लगते हैं। मैं अकेला बिहारी हूँ शायद। पटना में थिएटर करता था, अब यहाँ ऑडिशन दे रहा हूँ।',
                en: 'Sitting in the waiting room... everyone looks like they\'re from Mumbai. Maybe I\'m the only one from Bihar. Used to do theater in Patna, now giving auditions here.',
                bhojpuri: 'वेटिंग रूम में बैठे हैं... सब मुंबई वाले लगते हैं। मैं अकेला बिहारी हूँ शायद। पटना में थिएटर करता था, अब यहाँ ऑडिशन दे रहा हूँ।'
            },
            options: [
                {
                    text: {
                        hi: 'चुपचाप बैठो',
                        en: 'Sit quietly',
                        bhojpuri: 'चुपचाप बैठव'
                    },
                    next: 'sit_and_wait'
                },
                {
                    text: {
                        hi: 'किसी से बात करो',
                        en: 'Talk to someone',
                        bhojpuri: 'किसी से बात करव'
                    },
                    next: 'talk_actor'
                }
            ]
        },
        talk_actor: {
            speaker: 'Sundaram',
            text: {
                hi: 'अरे भैया, आप भी ऑडिशन के लिए आए हैं?',
                en: 'Hey brother, are you also here for the audition?',
                bhojpuri: 'अरे भैया, तूम भी ऑडिशन के लिए आए हो?'
            },
            options: [
                {
                    text: {
                        hi: 'हाँ, रक्ष छाबड़ा के बारे में पूछो',
                        en: 'Yes, ask about Raksh Chhabra',
                        bhojpuri: 'हाँ, रक्ष छाबड़ा के बारे में पूछव'
                    },
                    next: 'actor_response'
                }
            ]
        },
        actor_response: {
            speaker: 'Actor',
            text: {
                hi: 'हाँ भैया, रक्ष छाबड़ा बहुत बड़े प्रोड्यूसर हैं। उनकी फिल्म है।',
                en: 'Yes brother, Raksh Chhabra is a big producer. He has a film.',
                bhojpuri: 'हाँ भैया, रक्ष छाबड़ा बहुत बड़े प्रोड्यूसर हैं। उनकी फिल्म है।'
            },
            options: [
                {
                    text: {
                        hi: 'वेटिंग रूम में वापस जाओ',
                        en: 'Go back to the waiting room',
                        bhojpuri: 'वेटिंग रूम में वापस जाव'
                    },
                    next: 'waiting_room'
                }
            ]
        },
        sit_and_wait: {
            speaker: 'Sundaram',
            text: {
                hi: 'बस बैठकर इंतज़ार करते हैं... देखते हैं कब बुलाते हैं।',
                en: 'Just sitting and waiting... let\'s see when they call.',
                bhojpuri: 'बस बैठकर इंतज़ार करते हैं... देखते हैं कब बुलाते हैं।'
            },
            options: [
                {
                    text: {
                        hi: 'ऑडिशन के लिए बुलाया गया',
                        en: 'Called for audition',
                        bhojpuri: 'ऑडिशन के लिए बुलाया गया'
                    },
                    next: 'audition_call'
                }
            ]
        },
        audition_call: {
            speaker: 'Assistant',
            text: {
                hi: 'सुंदरम जी? आपका नंबर है... अंदर आइए।',
                en: 'Sundaram ji? Your number is... please come inside.',
                bhojpuri: 'सुंदरम जी? तोहारा नंबर है... अंदर आइए।'
            },
            options: [
                {
                    text: {
                        hi: 'ऑडिशन रूम में जाओ',
                        en: 'Go to the audition room',
                        bhojpuri: 'ऑडिशन रूम में जाव'
                    },
                    next: 'to_audition'
                }
            ]
        },
        to_audition: {
            speaker: 'Sundaram',
            text: {
                hi: 'चलो, ऑडिशन देते हैं... देखते हैं क्या होता है।',
                en: 'Let\'s go, give the audition... let\'s see what happens.',
                bhojpuri: 'चलो, ऑडिशन देते हैं... देखते हैं का होता है।'
            },
            options: [
                {
                    text: {
                        hi: 'ऑडिशन शुरू करो',
                        en: 'Start the audition',
                        bhojpuri: 'ऑडिशन शुरू करव'
                    },
                    next: 'audition_scene'
                }
            ]
        },
        audition_scene: {
            speaker: 'Sundaram',
            text: {
                hi: 'आपकी ज़िन्दगी में कोई ऐसा इंसान है जो आपको सबसे ज़्यादा प्यार करता है?',
                en: 'Is there anyone in your life who loves you the most?',
                bhojpuri: 'तोहार ज़िन्दगी में कोई ऐसा इंसान है जो तोहाका सबसे ज़्यादा प्यार करता है?'
            },
            options: [
                {
                    text: {
                        hi: 'हाँ, मेरी माँ',
                        en: 'Yes, my mother',
                        bhojpuri: 'हाँ, हमार माँ'
                    },
                    next: 'audition_end',
                    effect: () => { console.log('Sundaram chose mother'); }
                },
                {
                    text: {
                        hi: 'नहीं, कोई नहीं',
                        en: 'No, no one',
                        bhojpuri: 'ना, कोई ना'
                    },
                    next: 'audition_end',
                    effect: () => { console.log('Sundaram chose no one'); }
                }
            ]
        },
        audition_end: {
            speaker: 'Rekha',
            text: {
                hi: 'बहुत अच्छा... हम आपको कॉल करेंगे।',
                en: 'Very good... we will call you.',
                bhojpuri: 'बहुत अच्छा... हम तोहाका कॉल करब।'
            },
            options: [
                {
                    text: {
                        hi: 'धन्यवाद',
                        en: 'Thank you',
                        bhojpuri: 'धन्यवाद'
                    },
                    effect: () => {
                        console.log('Sundaram chapter ended');
                        window.dispatchEvent(new CustomEvent('chapterComplete', { detail: { chapter: 'sundaram' } }));
                    }
                }
            ]
        }
    }
};
