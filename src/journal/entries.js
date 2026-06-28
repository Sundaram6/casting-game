// src/journal/entries.js
// Bilingual journal entries for key story moments

export const JOURNAL_ENTRIES = {
  sundaram_arrival: {
    character: 'sundaram',
    title: { en: 'Arrival in Mumbai', hi: 'मुंबई में आगमन' },
    content: {
      en: 'Arrived at Dadar station after 16 hours. The city is everything and nothing like I imagined. The crowds, the noise, the dreams—all colliding.',
      hi: '16 घंटे बाद दादर स्टेशन पहुँचा। शहर वैसा ही है जैसा सोचा था... और बिल्कुल नहीं। भीड़, शोर, सपने—सब टकरा रहे हैं।'
    },
    trigger: 'sundaram_arrives_mumbai'
  },
  arjun_phone_call: {
    character: 'arjun',
    title: { en: 'The Call', hi: 'वो फ़ोन कॉल' },
    content: {
      en: 'Dad\'s assistant called. The part is already mine. I haven\'t even auditioned yet. This is how it works here.',
      hi: 'पापा के असिस्टेंट का कॉल आया। रोल पहले से मेरा है। ऑडिशन भी नहीं दिया। यहीं तो है यहाँ का तरीक़ा।'
    },
    trigger: 'arjun_receives_call'
  },
  rekha_watches_tapes: {
    character: 'rekha',
    title: { en: 'Two Tapes', hi: 'दो टेप' },
    content: {
      en: 'Sundaram\'s tape: raw, brilliant. Arjun\'s tape: competent, safe. Same ending every time.',
      hi: 'सुंदरम का टेप: कच्चा, शानदार। अर्जुन का टेप: ठीक-ठाक, सुरक्षित। हर बार वही अंत।'
    },
    trigger: 'rekha_reviews_tapes'
  },
  sundaram_first_audition: {
    character: 'sundaram',
    title: { en: 'The Audition', hi: 'ऑडिशन' },
    content: {
      en: 'Walked into the casting office. Everyone looked at me like I didn\'t belong. Maybe I don\'t. But I\'m here.',
      hi: 'कास्टिंग ऑफिस में कदम रखा। सब मुझे ऐसे देख रहे थे जैसे मेरी जगह यहाँ नहीं है। शायद नहीं भी है। लेकिन मैं हूँ।'
    },
    trigger: 'sundaram_first_audition'
  },
  arjun_privilege: {
    character: 'arjun',
    title: { en: 'The Advantage', hi: 'फ़ायदा' },
    content: {
      en: 'Showed up to set. Director shook my hand like we were old friends. Dad\'s name opens doors mine can\'t.',
      hi: 'सेट पर पहुँचा। निर्देशक ने मेरा हाथ मिलाया जैसे हम पुराने दोस्त हों। पापा का नाम वो दरवाज़े खोलता है जो मेरा नहीं खोल सकता।'
    },
    trigger: 'arjun_shows_up_set'
  },
  rekha_moral_conflict: {
    character: 'rekha',
    title: { en: 'The Dilemma', hi: 'दुविधा' },
    content: {
      en: 'How many talented people have I watched walk away? The system is broken. But I keep showing up.',
      hi: 'कितने प्रतिभाशाली लोगों को मैंने जाते देखा है? व्यवस्था टूटी हुई है। लेकिन मैं फिर भी आती हूँ।'
    },
    trigger: 'rekha_witnesses_injustice'
  },
  sundaram_networking: {
    character: 'sundaram',
    title: { en: 'The Party', hi: 'पार्टी' },
    content: {
      en: 'Attended a industry party. Smiled until my face hurt. Everyone knows everyone. I know no one.',
      hi: 'इंडस्ट्री पार्टी में गया। चेहरा दुखने तक मुस्कुराया। सब सबको जानते हैं। मैं किसी को नहीं जानता।'
    },
    trigger: 'sundaram_attends_party'
  },
  arjun_self_doubt: {
    character: 'arjun',
    title: { en: 'The Mirror', hi: 'आईना' },
    content: {
      en: 'Saw Sundaram\'s audition tape. He has something I don\'t. Talent? Hunger? Something real.',
      hi: 'सुंदरम का ऑडिशन टेप देखा। उसमें कुछ है जो मुझमें नहीं। प्रतिभा? भूख? कुछ असली।'
    },
    trigger: 'arjun_sees_sundaram_audition'
  },
  rekha_final_choice: {
    character: 'rekha',
    title: { en: 'The Decision', hi: 'फ़ैसला' },
    content: {
      en: 'The contract is signed. The choice is made. But which choice? The one they wanted, or the one I should have made?',
      hi: 'कॉन्ट्रैक्ट साइन हो गया। फ़ैसला हो गया। लेकिन कौन सा? जो वो चाहते थे, या जो मुझे करना चाहिए था?'
    },
    trigger: 'rekha_signs_contract'
  }
};

export function getEntryForTrigger(triggerId) {
  return Object.values(JOURNAL_ENTRIES).find(e => e.trigger === triggerId);
}
