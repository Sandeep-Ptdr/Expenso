export type Language = "en" | "hi";

export type TranslationKey =
  | "language.english"
  | "language.hindi"
  | "auth.appName"
  | "auth.loginTitle"
  | "auth.loginSubtitle"
  | "auth.registerTitle"
  | "auth.registerSubtitle"
  | "auth.email"
  | "auth.password"
  | "auth.fullName"
  | "auth.emailPlaceholder"
  | "auth.passwordPlaceholder"
  | "auth.passwordCreatePlaceholder"
  | "auth.fullNamePlaceholder"
  | "auth.signIn"
  | "auth.signingIn"
  | "auth.createAccount"
  | "auth.creatingAccount"
  | "auth.needAccount"
  | "auth.haveAccount"
  | "auth.loginError"
  | "auth.registerError"
  | "tabs.dashboard"
  | "tabs.transactions"
  | "tabs.assistant"
  | "dashboard.welcome"
  | "dashboard.defaultTitle"
  | "dashboard.summary"
  | "dashboard.logout"
  | "dashboard.income"
  | "dashboard.expense"
  | "dashboard.balance"
  | "dashboard.paymentMethodSplit"
  | "dashboard.cash"
  | "dashboard.online"
  | "dashboard.aiInsight"
  | "dashboard.refresh"
  | "dashboard.generatingInsight"
  | "dashboard.aiBusy"
  | "dashboard.aiInsightError"
  | "dashboard.aiInsightFallback"
  | "dashboard.tryAgain"
  | "dashboard.suggestedAction"
  | "dashboard.topCategories"
  | "dashboard.noExpenseCategories"
  | "dashboard.transactionsAnalyzed"
  | "dashboard.noInsightsTitle"
  | "dashboard.noInsightsMessage"
  | "dashboard.generateInsight"
  | "dashboard.aiQuickAdd"
  | "dashboard.addTransaction"
  | "dashboard.recentTransactions"
  | "dashboard.viewAll"
  | "dashboard.refreshingTransactions"
  | "dashboard.overviewError"
  | "dashboard.noTransactionsTitle"
  | "dashboard.noTransactionsMessage"
  | "summary.onTrack"
  | "summary.needsAttention"
  | "summary.overview"
  | "transactions.title"
  | "transactions.subtitle"
  | "transactions.category"
  | "transactions.categoryPlaceholder"
  | "transactions.type"
  | "transactions.paymentMethod"
  | "transactions.startDate"
  | "transactions.endDate"
  | "transactions.datePlaceholder"
  | "transactions.applyFilters"
  | "transactions.clear"
  | "transactions.count"
  | "transactions.loading"
  | "transactions.loadError"
  | "transactions.noResultsTitle"
  | "transactions.noResultsMessage"
  | "transactions.deleteTitle"
  | "transactions.deleteMessage"
  | "transactions.cancel"
  | "transactions.delete"
  | "assistant.title"
  | "assistant.subtitle"
  | "assistant.suggestedQuestions"
  | "assistant.example1"
  | "assistant.example2"
  | "assistant.example3"
  | "assistant.askLabel"
  | "assistant.askPlaceholder"
  | "assistant.sessionExpired"
  | "assistant.emptyQuestion"
  | "assistant.unavailable"
  | "assistant.error"
  | "assistant.thinking"
  | "assistant.askButton"
  | "assistant.answerTitle"
  | "assistant.answerBasedOn"
  | "assistant.firstQuestionTitle"
  | "assistant.firstQuestionMessage"
  | "transactionCard.person"
  | "transactionCard.delete"
  | "transactionCard.deleting"
  | "transactionType.income"
  | "transactionType.expense"
  | "transactionType.transfer"
  | "paymentMethod.cash"
  | "paymentMethod.online"
  | "common.none"
  | "common.missing"
  | "common.currency"
  | "add.title"
  | "add.subtitle"
  | "add.aiParserTitle"
  | "add.aiParserSubtitle"
  | "add.quickExamples"
  | "add.describeTransaction"
  | "add.describePlaceholder"
  | "add.aiSessionExpired"
  | "add.aiPromptRequired"
  | "add.aiParseError"
  | "add.aiConfidence"
  | "add.aiConfidenceMessage"
  | "add.aiNeedsReview"
  | "add.aiSummaryReview"
  | "add.aiSummaryDone"
  | "add.aiFailedTitle"
  | "add.aiCompleteTitle"
  | "add.fillWithAI"
  | "add.parsing"
  | "add.clear"
  | "add.type"
  | "add.amount"
  | "add.amountPlaceholder"
  | "add.category"
  | "add.categoryPlaceholder"
  | "add.paymentMethod"
  | "add.date"
  | "add.description"
  | "add.descriptionPlaceholder"
  | "add.person"
  | "add.personPlaceholder"
  | "add.saveFailedTitle"
  | "add.saveError"
  | "add.saving"
  | "add.save"
  | "aiQuick.title"
  | "aiQuick.subtitle"
  | "aiQuick.examplePrompts"
  | "aiQuick.describeLabel"
  | "aiQuick.describePlaceholder"
  | "aiQuick.webMicOnly"
  | "aiQuick.micPermission"
  | "aiQuick.speechUnavailable"
  | "aiQuick.noSpeech"
  | "aiQuick.temporarilyUnavailable"
  | "aiQuick.startVoiceError"
  | "aiQuick.aiSessionExpired"
  | "aiQuick.promptRequired"
  | "aiQuick.parseError"
  | "aiQuick.useMic"
  | "aiQuick.stopListening"
  | "aiQuick.listening"
  | "aiQuick.parseTransaction"
  | "aiQuick.aiFailedTitle"
  | "aiQuick.suggestionTitle"
  | "aiQuick.suggestionSubtitle"
  | "aiQuick.type"
  | "aiQuick.amount"
  | "aiQuick.category"
  | "aiQuick.paymentMethod"
  | "aiQuick.date"
  | "aiQuick.description"
  | "aiQuick.person"
  | "aiQuick.confidence"
  | "aiQuick.unknown"
  | "aiQuick.needsMoreDetailTitle"
  | "aiQuick.needsMoreDetailMessage"
  | "aiQuick.saveFailedTitle"
  | "aiQuick.saveRequiresParse"
  | "aiQuick.saveNeedsMore"
  | "aiQuick.saveError"
  | "aiQuick.saving"
  | "aiQuick.save"
  | "aiQuick.openFullForm";

type TranslationMap = Record<TranslationKey, string>;

export const translations: Record<Language, TranslationMap> = {
  en: {
    "language.english": "EN",
    "language.hindi": "हि",
    "auth.appName": "Expense Manager",
    "auth.loginTitle": "Money clarity, built for everyday life.",
    "auth.loginSubtitle":
      "Sign in to manage income, expenses, and transfers from one calm, mobile-first workspace.",
    "auth.registerTitle": "Create your account",
    "auth.registerSubtitle":
      "Create your account and start tracking your full money picture from day one.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.emailPlaceholder": "you@example.com",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.passwordCreatePlaceholder": "Create a secure password",
    "auth.fullNamePlaceholder": "Your full name",
    "auth.signIn": "Sign In",
    "auth.signingIn": "Signing In...",
    "auth.createAccount": "Create Account",
    "auth.creatingAccount": "Creating Account...",
    "auth.needAccount": "Need an account? Create one",
    "auth.haveAccount": "Already have an account? Sign in",
    "auth.loginError": "Unable to sign in right now. Please try again.",
    "auth.registerError": "Unable to create your account right now. Please try again.",
    "tabs.dashboard": "Dashboard",
    "tabs.transactions": "Transactions",
    "tabs.assistant": "Assistant",
    "dashboard.welcome": "Welcome back",
    "dashboard.defaultTitle": "Dashboard",
    "dashboard.summary":
      "Track income, outgoing money, and transfers with a quick summary of where your money stands today.",
    "dashboard.logout": "Logout",
    "dashboard.income": "Income",
    "dashboard.expense": "Outgoing",
    "dashboard.balance": "Balance",
    "dashboard.paymentMethodSplit": "Payment Method Split",
    "dashboard.cash": "Cash",
    "dashboard.online": "Online",
    "dashboard.aiInsight": "AI Monthly Insight",
    "dashboard.refresh": "Refresh",
    "dashboard.generatingInsight": "Generating your monthly AI insight...",
    "dashboard.aiBusy":
      "AI insight is temporarily busy right now. Please wait a moment and try again.",
    "dashboard.aiInsightError": "Unable to load AI insight",
    "dashboard.aiInsightFallback": "Unable to load AI insights right now.",
    "dashboard.tryAgain": "Try Again",
    "dashboard.suggestedAction": "Suggested action",
    "dashboard.topCategories": "Top outgoing categories this month",
    "dashboard.noExpenseCategories": "No outgoing categories yet for this month.",
    "dashboard.transactionsAnalyzed": "Based on {count} transaction{s} from {month}/{year}.",
    "dashboard.noInsightsTitle": "No insights generated yet",
    "dashboard.noInsightsMessage":
      "Generate an AI monthly insight when you want a summary. The result will be cached for a while so repeated visits do not consume quota immediately.",
    "dashboard.generateInsight": "Generate AI Insight",
    "dashboard.aiQuickAdd": "AI quick add",
    "dashboard.addTransaction": "Add transaction",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.viewAll": "View all",
    "dashboard.refreshingTransactions": "Refreshing your latest transactions...",
    "dashboard.overviewError": "Unable to load overview",
    "dashboard.noTransactionsTitle": "No transactions yet",
    "dashboard.noTransactionsMessage":
      "Add your first income or outgoing entry to start seeing trends and balances.",
    "summary.onTrack": "On track",
    "summary.needsAttention": "Needs attention",
    "summary.overview": "Overview",
    "transactions.title": "Transactions",
    "transactions.subtitle":
      "Filter by category, type, date, and payment method to understand where your money is moving.",
    "transactions.category": "Category",
    "transactions.categoryPlaceholder": "Food, Salary, Rent...",
    "transactions.type": "Type",
    "transactions.paymentMethod": "Payment Method",
    "transactions.startDate": "Start Date",
    "transactions.endDate": "End Date",
    "transactions.datePlaceholder": "YYYY-MM-DD",
    "transactions.applyFilters": "Apply Filters",
    "transactions.clear": "Clear",
    "transactions.count": "{count} transaction{s}",
    "transactions.loading": "Loading matching transactions...",
    "transactions.loadError": "Unable to load transactions",
    "transactions.noResultsTitle": "No matching results",
    "transactions.noResultsMessage":
      "Try broadening your filters or add a new transaction that matches this view.",
    "transactions.deleteTitle": "Delete transaction",
    "transactions.deleteMessage": "This entry will be removed permanently.",
    "transactions.cancel": "Cancel",
    "transactions.delete": "Delete",
    "assistant.title": "AI Assistant",
    "assistant.subtitle":
      "Ask questions about your spending patterns, categories, and payment methods based on your saved transactions.",
    "assistant.suggestedQuestions": "Suggested questions",
    "assistant.example1": "How much did I spend on food this month?",
    "assistant.example2": "What was my highest expense category recently?",
    "assistant.example3": "How much did I spend online versus cash this month?",
    "assistant.askLabel": "Ask the assistant",
    "assistant.askPlaceholder": "How much did I spend on food this month?",
    "assistant.sessionExpired": "Your session has expired. Please sign in again.",
    "assistant.emptyQuestion": "Enter a spending question for the assistant.",
    "assistant.unavailable": "Assistant unavailable",
    "assistant.error": "Unable to get an assistant answer right now.",
    "assistant.thinking": "Thinking...",
    "assistant.askButton": "Ask Assistant",
    "assistant.answerTitle": "Assistant Answer",
    "assistant.answerBasedOn": "Based on {count} recent transaction{s}.",
    "assistant.firstQuestionTitle": "Ask your first question",
    "assistant.firstQuestionMessage":
      "Try asking about monthly food spending, payment method breakdowns, or your top expense category.",
    "transactionCard.person": "Person",
    "transactionCard.delete": "Delete",
    "transactionCard.deleting": "Deleting...",
    "transactionType.income": "Income",
    "transactionType.expense": "Expense",
    "transactionType.transfer": "Transfer",
    "paymentMethod.cash": "Cash",
    "paymentMethod.online": "Online",
    "common.none": "None",
    "common.missing": "Missing",
    "common.currency": "Rs. {amount}",
    "add.title": "Add Transaction",
    "add.subtitle":
      "Add income, expense, or transfer entries with the exact details you want to track.",
    "add.aiParserTitle": "AI Transaction Parser",
    "add.aiParserSubtitle":
      "Type something like `Paid 300 cash for lunch today` and let AI fill the form for you.",
    "add.quickExamples": "Quick examples",
    "add.describeTransaction": "Describe the transaction",
    "add.describePlaceholder": "Paid 300 cash for lunch today",
    "add.aiSessionExpired": "Your session has expired. Please sign in again.",
    "add.aiPromptRequired": "Enter a sentence like 'Paid 300 cash for lunch today'.",
    "add.aiParseError": "Unable to parse that transaction right now.",
    "add.aiConfidence": "AI confidence",
    "add.aiConfidenceMessage": "{percent}% confident in the parsed result.",
    "add.aiNeedsReview": "Still needs your review",
    "add.aiSummaryReview": "AI filled most fields. Please review: {fields}",
    "add.aiSummaryDone": "AI filled the form. Please review and save.",
    "add.aiFailedTitle": "AI parsing failed",
    "add.aiCompleteTitle": "AI parsing complete",
    "add.fillWithAI": "Fill With AI",
    "add.parsing": "Parsing...",
    "add.clear": "Clear",
    "add.type": "Type",
    "add.amount": "Amount",
    "add.amountPlaceholder": "0.00",
    "add.category": "Category",
    "add.categoryPlaceholder": "Food, Salary, Rent...",
    "add.paymentMethod": "Payment Method",
    "add.date": "Date",
    "add.description": "Description",
    "add.descriptionPlaceholder": "Optional note",
    "add.person": "Person",
    "add.personPlaceholder": "Who is involved in this transfer?",
    "add.saveFailedTitle": "Could not save transaction",
    "add.saveError": "Unable to save this transaction right now.",
    "add.saving": "Saving...",
    "add.save": "Save Transaction",
    "aiQuick.title": "AI Quick Add",
    "aiQuick.subtitle":
      "Describe a transaction naturally, review the parsed result, and save it in one fast flow.",
    "aiQuick.examplePrompts": "Example prompts",
    "aiQuick.describeLabel": "Describe the transaction",
    "aiQuick.describePlaceholder": "Paid 300 cash for lunch today",
    "aiQuick.webMicOnly": "Live microphone input is available in the mobile app, not the web build.",
    "aiQuick.micPermission": "Microphone permission is required for voice input.",
    "aiQuick.speechUnavailable":
      "Speech recognition is not available on this device. Please enable voice input services in system settings.",
    "aiQuick.noSpeech":
      "No speech was detected. Please try again and speak a little closer to the microphone.",
    "aiQuick.temporarilyUnavailable":
      "Speech recognition is temporarily unavailable. Please try again in a moment.",
    "aiQuick.startVoiceError": "Unable to start voice input right now.",
    "aiQuick.aiSessionExpired": "Your session has expired. Please sign in again.",
    "aiQuick.promptRequired": "Enter a sentence like 'Paid 300 cash for lunch today'.",
    "aiQuick.parseError": "Unable to parse that transaction right now.",
    "aiQuick.useMic": "Use Microphone",
    "aiQuick.stopListening": "Stop Listening",
    "aiQuick.listening": "Listening...",
    "aiQuick.parseTransaction": "Parse Transaction",
    "aiQuick.aiFailedTitle": "AI parsing failed",
    "aiQuick.suggestionTitle": "AI Suggestion",
    "aiQuick.suggestionSubtitle": "Review this parsed transaction before saving it.",
    "aiQuick.type": "Type",
    "aiQuick.amount": "Amount",
    "aiQuick.category": "Category",
    "aiQuick.paymentMethod": "Payment Method",
    "aiQuick.date": "Date",
    "aiQuick.description": "Description",
    "aiQuick.person": "Person",
    "aiQuick.confidence": "Confidence",
    "aiQuick.unknown": "Unknown",
    "aiQuick.needsMoreDetailTitle": "Needs more detail",
    "aiQuick.needsMoreDetailMessage": "AI could not confidently fill: {fields}",
    "aiQuick.saveFailedTitle": "Could not save transaction",
    "aiQuick.saveRequiresParse": "Parse a transaction before saving.",
    "aiQuick.saveNeedsMore":
      "AI still needs more details. Try a clearer sentence or use the full Add Transaction form.",
    "aiQuick.saveError": "Unable to save this transaction right now.",
    "aiQuick.saving": "Saving...",
    "aiQuick.save": "Save AI Transaction",
    "aiQuick.openFullForm": "Open Full Form",
  },
  hi: {
    "language.english": "EN",
    "language.hindi": "हि",
    "auth.appName": "एक्सपेंस मैनेजर",
    "auth.loginTitle": "रोज़मर्रा के लिए आसान मनी क्लैरिटी।",
    "auth.loginSubtitle":
      "एक शांत, मोबाइल-फर्स्ट वर्कस्पेस से अपनी आय, खर्च और ट्रांसफर मैनेज करने के लिए साइन इन करें।",
    "auth.registerTitle": "अपना अकाउंट बनाएं",
    "auth.registerSubtitle":
      "अपना अकाउंट बनाएं और पहले दिन से अपने पैसों की पूरी तस्वीर ट्रैक करना शुरू करें।",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.fullName": "पूरा नाम",
    "auth.emailPlaceholder": "you@example.com",
    "auth.passwordPlaceholder": "अपना पासवर्ड दर्ज करें",
    "auth.passwordCreatePlaceholder": "एक सुरक्षित पासवर्ड बनाएं",
    "auth.fullNamePlaceholder": "आपका पूरा नाम",
    "auth.signIn": "साइन इन",
    "auth.signingIn": "साइन इन हो रहा है...",
    "auth.createAccount": "अकाउंट बनाएं",
    "auth.creatingAccount": "अकाउंट बनाया जा रहा है...",
    "auth.needAccount": "अकाउंट नहीं है? नया बनाएं",
    "auth.haveAccount": "पहले से अकाउंट है? साइन इन करें",
    "auth.loginError": "अभी साइन इन नहीं हो सका। कृपया फिर से कोशिश करें।",
    "auth.registerError": "अभी अकाउंट नहीं बन सका। कृपया फिर से कोशिश करें।",
    "tabs.dashboard": "डैशबोर्ड",
    "tabs.transactions": "लेन-देन",
    "tabs.assistant": "असिस्टेंट",
    "dashboard.welcome": "वापसी पर स्वागत है",
    "dashboard.defaultTitle": "डैशबोर्ड",
    "dashboard.summary":
      "आज आपकी रकम कहाँ खड़ी है, इसका सारांश देखें और आय, खर्च व ट्रांसफर ट्रैक करें।",
    "dashboard.logout": "लॉगआउट",
    "dashboard.income": "आय",
    "dashboard.expense": "खर्च",
    "dashboard.balance": "बैलेंस",
    "dashboard.paymentMethodSplit": "पेमेंट मेथड विभाजन",
    "dashboard.cash": "कैश",
    "dashboard.online": "ऑनलाइन",
    "dashboard.aiInsight": "एआई मासिक इनसाइट",
    "dashboard.refresh": "रिफ्रेश",
    "dashboard.generatingInsight": "आपकी मासिक एआई इनसाइट बनाई जा रही है...",
    "dashboard.aiBusy": "एआई इनसाइट अभी व्यस्त है। थोड़ी देर बाद फिर कोशिश करें।",
    "dashboard.aiInsightError": "एआई इनसाइट लोड नहीं हुई",
    "dashboard.aiInsightFallback": "अभी एआई इनसाइट लोड नहीं हो सकी।",
    "dashboard.tryAgain": "फिर कोशिश करें",
    "dashboard.suggestedAction": "सुझाया गया कदम",
    "dashboard.topCategories": "इस महीने की सबसे बड़ी खर्च कैटेगरी",
    "dashboard.noExpenseCategories": "इस महीने अभी कोई खर्च कैटेगरी नहीं है।",
    "dashboard.transactionsAnalyzed": "{month}/{year} के {count} लेन-देन{s} के आधार पर।",
    "dashboard.noInsightsTitle": "अभी कोई इनसाइट नहीं बनी",
    "dashboard.noInsightsMessage":
      "जब चाहें एआई मासिक इनसाइट बनाएं। यह कुछ समय के लिए कैश रहेगी ताकि बार-बार खुलने पर कोटा तुरंत खर्च न हो।",
    "dashboard.generateInsight": "एआई इनसाइट बनाएं",
    "dashboard.aiQuickAdd": "एआई क्विक ऐड",
    "dashboard.addTransaction": "लेन-देन जोड़ें",
    "dashboard.recentTransactions": "हाल के लेन-देन",
    "dashboard.viewAll": "सभी देखें",
    "dashboard.refreshingTransactions": "हाल के लेन-देन रिफ्रेश हो रहे हैं...",
    "dashboard.overviewError": "ओवरव्यू लोड नहीं हो सका",
    "dashboard.noTransactionsTitle": "अभी कोई लेन-देन नहीं है",
    "dashboard.noTransactionsMessage":
      "ट्रेंड और बैलेंस देखने के लिए अपनी पहली आय या खर्च जोड़ें।",
    "summary.onTrack": "सही दिशा में",
    "summary.needsAttention": "ध्यान दें",
    "summary.overview": "सारांश",
    "transactions.title": "लेन-देन",
    "transactions.subtitle":
      "कैटेगरी, प्रकार, तारीख और पेमेंट मेथड के हिसाब से फ़िल्टर करें और समझें कि आपका पैसा कहाँ जा रहा है।",
    "transactions.category": "कैटेगरी",
    "transactions.categoryPlaceholder": "खाना, सैलरी, किराया...",
    "transactions.type": "प्रकार",
    "transactions.paymentMethod": "पेमेंट मेथड",
    "transactions.startDate": "शुरू की तारीख",
    "transactions.endDate": "अंतिम तारीख",
    "transactions.datePlaceholder": "YYYY-MM-DD",
    "transactions.applyFilters": "फ़िल्टर लागू करें",
    "transactions.clear": "साफ़ करें",
    "transactions.count": "{count} लेन-देन{s}",
    "transactions.loading": "मिलते हुए लेन-देन लोड हो रहे हैं...",
    "transactions.loadError": "लेन-देन लोड नहीं हुए",
    "transactions.noResultsTitle": "कोई मिलते-जुलते नतीजे नहीं",
    "transactions.noResultsMessage":
      "फ़िल्टर व्यापक करें या इस दृश्य से मेल खाता नया लेन-देन जोड़ें।",
    "transactions.deleteTitle": "लेन-देन हटाएं",
    "transactions.deleteMessage": "यह एंट्री हमेशा के लिए हट जाएगी।",
    "transactions.cancel": "रद्द करें",
    "transactions.delete": "हटाएं",
    "assistant.title": "एआई असिस्टेंट",
    "assistant.subtitle":
      "अपने सेव किए गए लेन-देन के आधार पर खर्च के पैटर्न, कैटेगरी और पेमेंट मेथड के बारे में सवाल पूछें।",
    "assistant.suggestedQuestions": "सुझाए गए सवाल",
    "assistant.example1": "इस महीने मैंने खाने पर कितना खर्च किया?",
    "assistant.example2": "हाल में मेरी सबसे बड़ी खर्च कैटेगरी कौन सी थी?",
    "assistant.example3": "इस महीने मैंने ऑनलाइन और कैश में कितना खर्च किया?",
    "assistant.askLabel": "असिस्टेंट से पूछें",
    "assistant.askPlaceholder": "इस महीने मैंने खाने पर कितना खर्च किया?",
    "assistant.sessionExpired": "आपका सेशन समाप्त हो गया है। फिर से साइन इन करें।",
    "assistant.emptyQuestion": "असिस्टेंट के लिए खर्च से जुड़ा सवाल लिखें।",
    "assistant.unavailable": "असिस्टेंट उपलब्ध नहीं है",
    "assistant.error": "अभी असिस्टेंट का जवाब नहीं मिल सका।",
    "assistant.thinking": "सोच रहा है...",
    "assistant.askButton": "असिस्टेंट से पूछें",
    "assistant.answerTitle": "असिस्टेंट का जवाब",
    "assistant.answerBasedOn": "{count} हाल के लेन-देन{s} के आधार पर।",
    "assistant.firstQuestionTitle": "अपना पहला सवाल पूछें",
    "assistant.firstQuestionMessage":
      "मासिक खाने का खर्च, पेमेंट मेथड ब्रेकडाउन या सबसे बड़ी खर्च कैटेगरी के बारे में पूछें।",
    "transactionCard.person": "व्यक्ति",
    "transactionCard.delete": "हटाएं",
    "transactionCard.deleting": "हटाया जा रहा है...",
    "transactionType.income": "आय",
    "transactionType.expense": "खर्च",
    "transactionType.transfer": "ट्रांसफर",
    "paymentMethod.cash": "कैश",
    "paymentMethod.online": "ऑनलाइन",
    "common.none": "कोई नहीं",
    "common.missing": "अनुपलब्ध",
    "common.currency": "रु. {amount}",
    "add.title": "लेन-देन जोड़ें",
    "add.subtitle":
      "वही सटीक जानकारी दर्ज करें जिसे आप ट्रैक करना चाहते हैं और आय, खर्च या ट्रांसफर जोड़ें।",
    "add.aiParserTitle": "एआई ट्रांज़ैक्शन पार्सर",
    "add.aiParserSubtitle":
      "`Paid 300 cash for lunch today` जैसा वाक्य लिखें और एआई को फ़ॉर्म भरने दें।",
    "add.quickExamples": "झटपट उदाहरण",
    "add.describeTransaction": "लेन-देन का विवरण लिखें",
    "add.describePlaceholder": "Paid 300 cash for lunch today",
    "add.aiSessionExpired": "आपका सेशन समाप्त हो गया है। फिर से साइन इन करें।",
    "add.aiPromptRequired": "'Paid 300 cash for lunch today' जैसा वाक्य लिखें।",
    "add.aiParseError": "अभी इस लेन-देन को पार्स नहीं किया जा सका।",
    "add.aiConfidence": "एआई भरोसा",
    "add.aiConfidenceMessage": "पार्स किए गए नतीजे पर {percent}% भरोसा है।",
    "add.aiNeedsReview": "इन चीज़ों की समीक्षा करें",
    "add.aiSummaryReview": "एआई ने ज़्यादातर फ़ील्ड भर दिए। कृपया देखें: {fields}",
    "add.aiSummaryDone": "एआई ने फ़ॉर्म भर दिया है। जांचकर सेव करें।",
    "add.aiFailedTitle": "एआई पार्सिंग विफल रही",
    "add.aiCompleteTitle": "एआई पार्सिंग पूरी हुई",
    "add.fillWithAI": "एआई से भरें",
    "add.parsing": "पार्स हो रहा है...",
    "add.clear": "साफ़ करें",
    "add.type": "प्रकार",
    "add.amount": "राशि",
    "add.amountPlaceholder": "0.00",
    "add.category": "कैटेगरी",
    "add.categoryPlaceholder": "खाना, सैलरी, किराया...",
    "add.paymentMethod": "पेमेंट मेथड",
    "add.date": "तारीख",
    "add.description": "विवरण",
    "add.descriptionPlaceholder": "वैकल्पिक नोट",
    "add.person": "व्यक्ति",
    "add.personPlaceholder": "इस ट्रांसफर में कौन शामिल है?",
    "add.saveFailedTitle": "लेन-देन सेव नहीं हो सका",
    "add.saveError": "अभी यह लेन-देन सेव नहीं हो सका।",
    "add.saving": "सेव हो रहा है...",
    "add.save": "लेन-देन सेव करें",
    "aiQuick.title": "एआई क्विक ऐड",
    "aiQuick.subtitle":
      "लेन-देन को सामान्य भाषा में लिखें, पार्स किया गया नतीजा देखें और तेज़ी से सेव करें।",
    "aiQuick.examplePrompts": "उदाहरण प्रॉम्प्ट",
    "aiQuick.describeLabel": "लेन-देन का विवरण लिखें",
    "aiQuick.describePlaceholder": "Paid 300 cash for lunch today",
    "aiQuick.webMicOnly":
      "लाइव माइक्रोफ़ोन इनपुट सिर्फ मोबाइल ऐप में उपलब्ध है, वेब में नहीं।",
    "aiQuick.micPermission": "वॉइस इनपुट के लिए माइक्रोफ़ोन अनुमति ज़रूरी है।",
    "aiQuick.speechUnavailable":
      "इस डिवाइस पर स्पीच रिकग्निशन उपलब्ध नहीं है। सिस्टम सेटिंग्स में वॉइस इनपुट सेवाएं चालू करें।",
    "aiQuick.noSpeech": "कोई आवाज़ नहीं मिली। कृपया फिर से बोलकर कोशिश करें।",
    "aiQuick.temporarilyUnavailable":
      "स्पीच रिकग्निशन अभी उपलब्ध नहीं है। थोड़ी देर में फिर कोशिश करें।",
    "aiQuick.startVoiceError": "अभी वॉइस इनपुट शुरू नहीं हो सका।",
    "aiQuick.aiSessionExpired": "आपका सेशन समाप्त हो गया है। फिर से साइन इन करें।",
    "aiQuick.promptRequired": "'Paid 300 cash for lunch today' जैसा वाक्य लिखें।",
    "aiQuick.parseError": "अभी इस लेन-देन को पार्स नहीं किया जा सका।",
    "aiQuick.useMic": "माइक्रोफ़ोन इस्तेमाल करें",
    "aiQuick.stopListening": "सुनना बंद करें",
    "aiQuick.listening": "सुन रहा है...",
    "aiQuick.parseTransaction": "लेन-देन पार्स करें",
    "aiQuick.aiFailedTitle": "एआई पार्सिंग विफल रही",
    "aiQuick.suggestionTitle": "एआई सुझाव",
    "aiQuick.suggestionSubtitle": "सेव करने से पहले इस पार्स किए गए लेन-देन की समीक्षा करें।",
    "aiQuick.type": "प्रकार",
    "aiQuick.amount": "राशि",
    "aiQuick.category": "कैटेगरी",
    "aiQuick.paymentMethod": "पेमेंट मेथड",
    "aiQuick.date": "तारीख",
    "aiQuick.description": "विवरण",
    "aiQuick.person": "व्यक्ति",
    "aiQuick.confidence": "भरोसा",
    "aiQuick.unknown": "अज्ञात",
    "aiQuick.needsMoreDetailTitle": "और जानकारी चाहिए",
    "aiQuick.needsMoreDetailMessage": "एआई इन फ़ील्ड को भरोसे से नहीं भर सका: {fields}",
    "aiQuick.saveFailedTitle": "लेन-देन सेव नहीं हो सका",
    "aiQuick.saveRequiresParse": "सेव करने से पहले लेन-देन पार्स करें।",
    "aiQuick.saveNeedsMore":
      "एआई को अभी और जानकारी चाहिए। थोड़ा स्पष्ट वाक्य लिखें या पूरा Add Transaction फ़ॉर्म इस्तेमाल करें।",
    "aiQuick.saveError": "अभी यह लेन-देन सेव नहीं हो सका।",
    "aiQuick.saving": "सेव हो रहा है...",
    "aiQuick.save": "एआई लेन-देन सेव करें",
    "aiQuick.openFullForm": "पूरा फ़ॉर्म खोलें",
  },
};
