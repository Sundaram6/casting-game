export const FLASHBACK_SCENES = {
  sundaram_patna: {
    location: 'patna',
    description: "Sundaram's father's small shop in Patna",
    dialogue: {
      nodes: {
        start: {
          speaker: 'Mother',
          text: {
            hi: 'beta, Mumbai jaake bada ban',
            en: 'Son, go to Mumbai and become someone big',
            bhojpuri: 'बेटा, मुंबई जाके बड़ा बन'
          },
          options: [
            {
              text: {
                hi: 'माँ, मैं कोशिश करूँगा',
                en: "Mother, I'll try my best",
                bhojpuri: 'माँ, हम कोसिस करब'
              },
              next: 'promise'
            }
          ]
        },
        promise: {
          speaker: 'Sundaram',
          text: {
            hi: 'माँ, मैं ज़रूर कामयाब होऊँगा।',
            en: "Mother, I'll definitely succeed.",
            bhojpuri: 'माँ, हम ज़रूर कामयाब होब।'
          },
          options: [
            {
              text: {
                hi: 'धन्यवाद',
                en: 'Thank you',
                bhojpuri: 'धन्यवाद'
              },
              effect: () => { console.log('Sundaram flashback ended'); }
            }
          ]
        }
      }
    },
    environment: 'sundaram_patna',
    duration: 6
  },
  arjun_childhood: {
    location: 'film_set',
    description: 'Arjun as a child on a film set',
    dialogue: {
      nodes: {
        start: {
          speaker: 'Father',
          text: {
            hi: 'Arjun ko role do. Woh talented hai.',
            en: "Give Arjun the role. He's talented.",
            bhojpuri: 'अर्जुन के रोल देव। ओ टैलेंटेड है।'
          },
          options: [
            {
              text: {
                hi: 'पापा, मैं एक्टिंग करूँगा',
                en: 'Dad, I will act',
                bhojpuri: 'बाबा, हम एक्टिंग करब'
              },
              next: 'childhood_end'
            }
          ]
        },
        childhood_end: {
          speaker: 'Arjun',
          text: {
            hi: 'पापा की वजह से मुझे रोल मिला।',
            en: "I got the role because of dad.",
            bhojpuri: 'बाबा के वजह से हमके रोल मिलल।'
          },
          options: [
            {
              text: {
                hi: 'धन्यवाद',
                en: 'Thank you',
                bhojpuri: 'धन्यवाद'
              },
              effect: () => { console.log('Arjun flashback ended'); }
            }
          ]
        }
      }
    },
    environment: 'arjun_childhood',
    duration: 5
  },
  rekha_1998: {
    location: 'casting_office_1998',
    description: 'Rekha fighting for an unknown Adivasi actress',
    dialogue: {
      nodes: {
        start: {
          speaker: 'Rekha',
          text: {
            hi: 'yeh ladki bahut talented hai',
            en: 'This girl is very talented',
            bhojpuri: 'ई लड़की बहुत टैलेंटेड है'
          },
          options: [
            {
              text: {
                hi: 'उसे मौका दो',
                en: 'Give her a chance',
                bhojpuri: 'ओके मौका देव'
              },
              next: 'producer_response'
            }
          ]
        },
        producer_response: {
          speaker: 'Producer',
          text: {
            hi: 'hum kisi anjaan ko launch nahi kar sakte',
            en: "We can't launch an unknown",
            bhojpuri: 'हम किसी अनजान के लॉन्च ना कर सकते'
          },
          options: [
            {
              text: {
                hi: 'देखो, यह लड़की खास है',
                en: 'Look, this girl is special',
                bhojpuri: 'देखव, ई लड़की खास है'
              },
              next: 'rekha_fight'
            }
          ]
        },
        rekha_fight: {
          speaker: 'Rekha',
          text: {
            hi: 'अगर आपने इसे रोल नहीं दिया, तो आपको पछतावा होगा।',
            en: "If you don't give her this role, you'll regret it.",
            bhojpuri: 'अगर तूने ईके रोल ना दिहाँ, तो तोहके पछतावा होता।'
          },
          options: [
            {
              text: {
                hi: 'ठीक है, देखते हैं',
                en: "Fine, let's see",
                bhojpuri: 'ठीक है, देखते हैं'
              },
              effect: () => { console.log('Rekha flashback ended'); }
            }
          ]
        }
      }
    },
    environment: 'rekha_1998',
    duration: 8
  }
};