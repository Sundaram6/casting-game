export const AUDITION_DIALOGUE = {
    nodes: {
        // Sundaram's audition
        'sundaram_start': {
            speaker: 'narrator',
            text: {
                hi: 'सुंदरम ऑडिशन रूम में प्रवेश करता है। वह गहरी सांस लेता है।',
                en: 'Sundaram enters the audition room. He takes a deep breath.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'sundaram_monologue' }
            ]
        },
        'sundaram_monologue': {
            speaker: 'sundaram',
            text: {
                hi: 'मैं सुंदरम हूँ। मैं एक अभिनेता हूँ। मैं छोटे शहर से आया हूँ, लेकिन मेरे सपने बड़े हैं। मैंने हिंदी फिल्में देखकर सीखा, अंग्रेजी में सोचा, और भोजपुरी में सपने देखे। हम भोजपुरी में भी बोलते हैं — हमार गाँव में बड़े सपना हवे।',
                en: 'I am Sundaram. I am an actor. I come from a small town, but my dreams are big. I learned by watching Hindi films, thought in English, and dreamed in Bhojpuri. We also speak Bhojpuri — in our village we have big dreams.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'sundaram_monologue_2' }
            ]
        },
        'sundaram_monologue_2': {
            speaker: 'sundaram',
            text: {
                hi: 'जब मैं मंच पर खड़ा होता हूँ, तो मैं कोई और बन जाता हूँ। मैं वो बन जाता हूँ जो मैं हो सकता हूँ, न कि जो मैं हूँ। यही तो अभिनय है। भोजपुरी में कहते हैं — हम रंगमंच के राजा बन जाईं।',
                en: 'When I stand on stage, I become someone else. I become what I could be, not what I am. That\'s what acting is. In Bhojpuri we say — we become kings of the stage.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'sundaram_monologue_3' }
            ]
        },
        'sundaram_monologue_3': {
            speaker: 'sundaram',
            text: {
                hi: 'मैं जानता हूँ कि इस इंडस्ट्री में किस्मत से ज्यादा जरूरी है पहुँच। लेकिन अगर आप मुझे एक मौका दें, तो मैं दिखा सकता हूँ कि पहुँच के बिना भी कितनी दूर जा सकता है। भोजपुरी में कहते हैं — बिना सहारे के भी हम उड़ सकते हैं।',
                en: 'I know that in this industry, connections matter more than talent. But if you give me a chance, I can show how far I can go without connections. In Bhojpuri we say — even without support, we can fly.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'sundaram_end', effects: ['advance'] }
            ]
        },
        'sundaram_end': {
            speaker: 'narrator',
            text: {
                hi: 'सुंदरम का ऑडिशन समाप्त होता है। वह बाहर निकलता है, उसकी आँखों में उम्मीद की चमक।',
                en: 'Sundaram\'s audition ends. He walks out, eyes shining with hope.'
            },
            options: []
        },

        // Arjun's audition
        'arjun_start': {
            speaker: 'narrator',
            text: {
                hi: 'अर्जुन ऑडिशन रूम में प्रवेश करता है। वह घबराया हुआ है, लेकिन उसके कपड़े महंगे हैं।',
                en: 'Arjun enters the audition room. He\'s nervous, but his clothes are expensive.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'arjun_monologue' }
            ]
        },
        'arjun_monologue': {
            speaker: 'arjun',
            text: {
                hi: 'हैलो, मैं अर्जुन हूँ। मेरे पापा... आपने सुना होगा... वो बड़े एक्टर हैं। मैं भी एक्टिंग करना चाहता हूँ।',
                en: 'Hello, I\'m Arjun. My dad... you might have heard... he\'s a big actor. I want to act too.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'arjun_monologue_2' }
            ]
        },
        'arjun_monologue_2': {
            speaker: 'arjun',
            text: {
                hi: 'मैंने बहुत मेहनत की है। मैंने एक्टिंग क्लासेज ली हैं, डायलॉग प्रैक्टिस की है। लेकिन... मुझे नहीं पता कि मैं अच्छा हूँ या नहीं।',
                en: 'I\'ve worked hard. I\'ve taken acting classes, practiced dialogues. But... I don\'t know if I\'m good or not.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'arjun_monologue_3' }
            ]
        },
        'arjun_monologue_3': {
            speaker: 'arjun',
            text: {
                hi: 'पापा कहते हैं कि इंडस्ट्री में नाम सबसे ज्यादा जरूरी है। शायद वो सही कहते हैं। मेरे पास नाम है, तो क्या काफी नहीं है?',
                en: 'Dad says name matters most in the industry. Maybe he\'s right. I have the name, isn\'t that enough?'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'arjun_end', effects: ['advance'] }
            ]
        },
        'arjun_end': {
            speaker: 'narrator',
            text: {
                hi: 'अर्जुन का ऑडिशन समाप्त होता है। वह बाहर निकलता है, उसके चेहरे पर असमंजस।',
                en: 'Arjun\'s audition ends. He walks out, confusion on his face.'
            },
            options: []
        },

        // Rekha's decision
        'rekha_decision_start': {
            speaker: 'narrator',
            text: {
                hi: 'रेखा अपने ऑफिस में बैठी है। उसके सामने दो टेप रखे हैं — सुंदरम और अर्जुन।',
                en: 'Rekha sits in her office. Two tapes lie before her — Sundaram and Arjun.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'rekha_decision_1' }
            ]
        },
        'rekha_decision_1': {
            speaker: 'rekha',
            text: {
                hi: 'सुंदरम... टैलेंट है। सच्चा टैलेंट। लेकिन इंडस्ट्री को टैलेंट नहीं चाहिए, इंडस्ट्री को नाम चाहिए।',
                en: 'Sundaram... has talent. Real talent. But the industry doesn\'t want talent, it wants a name.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'rekha_decision_2' }
            ]
        },
        'rekha_decision_2': {
            speaker: 'rekha',
            text: {
                hi: 'अर्जुन... कुछ नहीं है। लेकिन उसके पापा का नाम है। और इस इंडस्ट्री में नाम ही सब कुछ है।',
                en: 'Arjun... is nothing. But he has his father\'s name. And in this industry, a name is everything.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'rekha_decision_3' }
            ]
        },
        'rekha_decision_3': {
            speaker: 'rekha',
            text: {
                hi: 'मैं हमेशा यही करती हूँ। मैं वही चुनती हूँ जो इंडस्ट्री चाहती है। शायद इसीलिए मैं जिंदा हूँ।',
                en: 'I always do this. I choose what the industry wants. Maybe that\'s why I\'m still alive.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'rekha_decision_4' }
            ]
        },
        'rekha_decision_4': {
            speaker: 'rekha',
            text: {
                hi: 'अर्जुन को कॉल करो। उसे रोल मिल गया। सुंदरम को... बाद में।',
                en: 'Call Arjun. He got the role. Sundaram... later.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'rekha_decision_end', effects: ['advance'] }
            ]
        },
        'rekha_decision_end': {
            speaker: 'narrator',
            text: {
                hi: 'रेखा फोन रख देती है। उसकी आँखें सुंदरम के टेप पर टिकी हैं।',
                en: 'Rekha puts down the phone. Her eyes linger on Sundaram\'s tape.'
            },
            options: []
        },

        // Ending
        'ending_start': {
            speaker: 'narrator',
            text: {
                hi: 'रेखा अकेली बैठी है। वह सुंदरम का टेप देख रही है।',
                en: 'Rekha sits alone. She watches Sundaram\'s tape.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'ending_1' }
            ]
        },
        'ending_1': {
            speaker: 'narrator',
            text: {
                hi: 'वह टेप रिवाइंड करती है। फिर से देखती है। फिर से।',
                en: 'She rewinds the tape. Watches again. And again.'
            },
            options: [
                { text: { hi: '...', en: '...' }, next: 'ending_2' }
            ]
        },
        'ending_2': {
            speaker: 'narrator',
            text: {
                hi: 'फिर वह लैपटॉप बंद कर देती है। अंधेरे में बैठी रहती है।',
                en: 'Then she closes the laptop. Sits in the dark.'
            },
            options: []
        }
    }
};