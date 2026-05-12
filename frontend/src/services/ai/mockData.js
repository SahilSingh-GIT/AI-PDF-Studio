// services/ai/mockData.js
// Provides realistic engineering-related mock data for the AI frontend

export const MOCK_SUMMARY = {
  overview: "This document explores advanced concepts in Operating Systems, focusing primarily on Virtual Memory architectures, Cache Mapping techniques, and Deadlock resolution strategies. It emphasizes real-world application in modern high-performance computing.",
  mainTopics: [
    "Virtual Memory & Paging",
    "Cache Mapping Strategies",
    "Deadlock Detection & Prevention",
    "Transformer Models in System Optimization"
  ],
  summary: "The text provides a comprehensive overview of how operating systems handle constrained resources. It delves into the paging mechanics of Virtual Memory, demonstrating how hardware and software cooperate to provide isolated address spaces. Furthermore, it outlines how Cache Mapping (Direct, Associative, and Set-Associative) drastically improves CPU throughput. Finally, it touches upon deadlock resolution using Banker's Algorithm and recent theoretical applications of Transformer Models for predicting and optimizing OS task scheduling.",
  keyTakeaways: [
    "Virtual memory relies on page tables and TLBs to map virtual to physical addresses efficiently.",
    "Cache hits heavily dictate system performance; Set-Associative mapping offers the best tradeoff.",
    "Deadlocks require four conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) to occur.",
    "Emerging DBMS architectures use AI models to preemptively resolve deadlocks."
  ]
};

export const MOCK_INSIGHTS = {
  importantConcepts: [
    { title: "Virtual Memory", description: "An abstraction separating logical memory from physical memory, allowing execution of processes that may not be completely in memory." },
    { title: "TLB (Translation Lookaside Buffer)", description: "A memory cache that stores recent translations of virtual memory to physical addresses for faster retrieval." },
    { title: "Deadlock", description: "A situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process." }
  ],
  importantPoints: [
    "Context switching overhead is minimized when the TLB hit ratio is high.",
    "Direct mapped caches suffer from conflict misses more than fully associative caches.",
    "Banker's Algorithm is used for deadlock avoidance by simulating allocation for predetermined maximum possible amounts of all resources."
  ],
  commonMistakes: [
    "Confusing Page Faults with Segmentation Faults. Page faults are normal OS behavior for fetching data from disk; segfaults are illegal access errors.",
    "Assuming Deadlock Prevention and Deadlock Avoidance are the same. Prevention negates one of the four Coffman conditions, while avoidance dynamically checks resource requests."
  ],
  examTips: [
    "Always remember the 4 Coffman conditions for deadlocks: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.",
    "When calculating Cache Miss Penalty, be sure to include the bus transfer time."
  ]
};

export const MOCK_SEARCH_RESULTS = [
  {
    pageNumber: 12,
    snippet: "...the CPU searches the TLB. If a TLB hit occurs, the physical address is immediately constructed. In the event of a TLB miss, a page table walk is required...",
  },
  {
    pageNumber: 15,
    snippet: "...cache mapping techniques define how memory blocks are placed in cache lines. Direct mapping assigns each memory block to exactly one cache line, causing potential conflict misses...",
  },
  {
    pageNumber: 34,
    snippet: "...resolving a deadlock often requires terminating one or more processes. Alternatively, resource preemption can be utilized if the resources state can be safely saved and restored...",
  },
  {
    pageNumber: 41,
    snippet: "...in modern DBMS, transaction deadlocks are frequently handled via wait-die or wound-wait schemes using timestamp ordering...",
  },
  {
    pageNumber: 52,
    snippet: "...recent studies suggest that Transformer Models can predict page access patterns, potentially replacing traditional LRU algorithms for page replacement..."
  }
];

export const MOCK_TRANSLATIONS = {
  'English': "This document explores advanced concepts in Operating Systems, focusing primarily on Virtual Memory architectures, Cache Mapping techniques, and Deadlock resolution strategies.",
  'Hindi': "यह दस्तावेज़ ऑपरेटिंग सिस्टम में उन्नत अवधारणाओं की पड़ताल करता है, जो मुख्य रूप से वर्चुअल मेमोरी आर्किटेक्चर, कैश मैपिंग तकनीकों और डेडलॉक रिज़ॉल्यूशन रणनीतियों पर केंद्रित है।",
  'Hindi (Roman)': "Yeh document operating systems mein advanced concepts ki padtaal karta hai, jo mukhya roop se virtual memory architecture, cache mapping techniques aur deadlock resolution par kendrit hai.",
  'Kannada': "ಈ ಡಾಕ್ಯುಮೆಂಟ್ ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್‌ಗಳಲ್ಲಿನ ಸುಧಾರಿತ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಅನ್ವೇಷಿಸುತ್ತದೆ, ಪ್ರಾಥಮಿಕವಾಗಿ ವರ್ಚುವಲ್ ಮೆಮೊರಿ ಆರ್ಕಿಟೆಕ್ಚರ್‌ಗಳು, ಕ್ಯಾಶ್ ಮ್ಯಾಪಿಂಗ್ ತಂತ್ರಗಳು ಮತ್ತು ಡೆಡ್‌ಲಾಕ್ ರೆಸಲ್ಯೂಶನ್ ತಂತ್ರಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸುತ್ತದೆ.",
  'Kannada (Roman)': "Ee document operating systems nallina sudharita parikalpanegalannu anveshisuttade, prathamikavagi virtual memory architectures, cache mapping tantragalu mattu deadlock resolution mele kendrikarisuttade.",
  'Bengali': "এই দস্তাবেজটি অপারেটিং সিস্টেমের উন্নত ধারণাগুলি অন্বেষণ করে, প্রাথমিকভাবে ভার্চুয়াল মেমরি আর্কিটেকচার, ক্যাশে ম্যাপিং কৌশল এবং ডেডলক রেজোলিউশন কৌশলগুলির উপর দৃষ্টি নিবদ্ধ করে।",
  'Bengali (Roman)': "Ei document-ti operating system-er unnoto dharona-guli onneshon kore, prathomik-bhabe virtual memory architecture, cache mapping koushol ebong deadlock resolution koushol-gulir upor drishti niboddho kore.",
  'Tamil': "இந்த ஆவணம் இயங்குதளங்களில் உள்ள மேம்பட்ட கருத்துகளை ஆராய்கிறது, முக்கியமாக மெய்நிகர் நினைவக கட்டமைப்புகள், தற்காலிக சேமிப்பு மேப்பிங் மற்றும் முட்டுக்கட்டை தீர்க்கும் உத்திகள் ஆகியவற்றில் கவனம் செலுத்துகிறது.",
  'Tamil (Roman)': "Indha aavanam iyanguthalangalil ulla mempatta karuthugalai aaraygiradhu, mukkiyamaga meinigar ninaivaga kattamaipugal, tharkaaliga semippu mapping matrum muttukkattai theerkum uthigal aagiyavatril gavanam seluthugiradhu.",
  'Telugu': "ఈ డాక్యుమెంట్ ఆపరేటింగ్ సిస్టమ్స్‌లోని అధునాతన కాన్సెప్ట్‌లను విశ్లేషిస్తుంది, ప్రధానంగా వర్చువల్ మెమరీ ఆర్కిటెక్చర్‌లు, కాష్ మ్యాపింగ్ పద్ధతులు మరియు డెడ్‌లాక్ రిజల్యూషన్ వ్యూహాలపై దృష్టి పెడుతుంది.",
  'Telugu (Roman)': "Ee document operating systems-loni adhunaatana concepts-lanu vishleshistundi, pradhanamga virtual memory architectures, cache mapping paddhatulu mariyu deadlock resolution vyoohalapai drushti pedutundi.",
};

export const MOCK_CHAT_REPLIES = [
  "Based on the document, Virtual Memory is an abstraction that separates logical memory from physical memory. This allows the OS to run programs larger than the available RAM.",
  "The text mentions three cache mapping strategies: Direct Mapping, Fully Associative Mapping, and Set-Associative Mapping. Set-Associative is described as the best trade-off.",
  "Deadlock prevention ensures at least one of the four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) cannot occur.",
  "Transformer models are mentioned in the context of predicting page access patterns, potentially replacing traditional algorithms like LRU for page replacement.",
  "Banker's Algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources."
];
