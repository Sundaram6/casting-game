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
                hi: 'पहले थोड़ा इधर-उधर देख लेते हैं... यहाँ का माहौल कैसा है।',
                en: 'Let me look around first... see what the place is like.',
                bhojpuri: 'पहिले थोड़ा इधर-उधर देख लेव... यहाँ का माहौल कैसा है।'
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
                hi: 'चाय वाला भी यहीं है... चलो एक चाय पीते हैं।',
                en: 'The chai wallah is here too... let me get some tea.',
                bhojpuri: 'चाय वाला भी यहीं है... चलो एक चाय पीते हैं।'
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
                hi: 'वेटिंग रूम में बैठते हैं... यहाँ और भी लोग हैं।',
                en: 'Let me sit in the waiting room... there are other people here too.',
                bhojpuri: 'वेटिंग रूम में बैठते हैं... यहाँ और भी लोग हैं।'
            },
            options: [
                {
                    text: {
                        hi: 'दूसरे एक्टर से बात करो',
                        en: 'Talk to another actor',
                        bhojpuri: 'दूसरे एक्टर से बात करव'
                    },
                    next: 'talk_actor'
                },
                {
                    text: {
                        hi: 'बस बैठकर इंतज़ार करो',
                        en: 'Just sit and wait',
                        bhojpuri: 'बस बैठकर इंतज़ार करव'
                    },
                    next: 'sit_and_wait'
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
