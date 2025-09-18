// backend/src/services/ragPipeline.js
const jinaai = require('jinaai');
const { retrieveRelevantPassages, storeEmbeddings } = require('../utils/vectorStore');
const { fetchNewsArticles } = require('../utils/newsIngestion');

const jinaClient = new jinaai({ apiKey: process.env.JINA_API_KEY });

// Keywords for detecting non-news domains
const NON_NEWS_DOMAINS = {
    weather: ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'humidity', 'climate'],
    time: ['time', 'clock', 'hour', 'minute', 'today', 'date', 'day', 'month', 'year', 'am', 'pm'],
    personal: ['hello', 'hi', 'hey', 'how are you', 'who are you', 'your name']
};

// Function to detect if query is outside news domain
function detectQueryDomain(query) {
    const lowercaseQuery = query.toLowerCase();

    // Check for weather-related queries
    if (NON_NEWS_DOMAINS.weather.some(keyword => lowercaseQuery.includes(keyword))) {
        return 'weather';
    }

    // Check for time-related queries
    if (NON_NEWS_DOMAINS.time.some(keyword => lowercaseQuery.includes(keyword))) {
        return 'time';
    }

    // Check for personal queries
    if (NON_NEWS_DOMAINS.personal.some(keyword => lowercaseQuery.includes(keyword))) {
        return 'personal';
    }

    // Default to news domain
    return 'news';
}

// Function to generate appropriate response for non-news domains
function generateNonNewsResponse(query, domain) {
    switch (domain) {
        case 'weather':
            return "I'm a news chatbot and don't have real-time weather information. For accurate weather updates for locations like " +
                query.replace(/weather|forecast|temperature/gi, '').trim() +
                ", please check a weather service like Weather.com, AccuWeather, or your local meteorological department's website.";

        case 'time':
            return "I'm a news chatbot focused on providing news information. I don't have access to real-time data like current time. " +
                "You can check the time on your device or use a time service website.";

        case 'personal':
            return "Hello! I'm a news chatbot designed to help you with news-related questions. I can provide information about recent news events, " +
                "summarize news articles, or answer questions about current affairs. How can I help you with news today?";

        default:
            return null; // Will be handled by the news pipeline
    }
}

async function processQuery(query, chatHistory = []) {
    try {
        // Detect query domain
        const queryDomain = detectQueryDomain(query);

        // Handle non-news domains with appropriate responses
        if (queryDomain !== 'news') {
            const nonNewsResponse = generateNonNewsResponse(query, queryDomain);
            if (nonNewsResponse) {
                return nonNewsResponse;
            }
        }

        let relevantPassages = [];
        let passageRetrievalFailed = false;

        try {
            // Get more passages for variety
            relevantPassages = await retrieveRelevantPassages(query, 5);

            // Check if we got meaningful results
            if (relevantPassages.length === 0 ||
                (relevantPassages.length === 1 && relevantPassages[0].text.includes("I don't have specific information"))) {
                passageRetrievalFailed = true;
            }
        } catch (error) {
            console.error('Error retrieving passages:', error);
            passageRetrievalFailed = true;
            relevantPassages = [
                { text: "I don't have specific information, but I'll try to help.", title: "General Knowledge" }
            ];
        }

        // If we couldn't find relevant news passages, provide a clear message
        if (passageRetrievalFailed) {
            return "I don't have any news information about \"" + query + "\". I'm a news chatbot and can only answer questions related to news articles in my database. Please try asking about recent news events or current affairs.";
        }

        // Only include the last 4 messages from chat history to prevent repetition
        const recentChatHistory = chatHistory.slice(-4);

        // Format chat history for Jina
        const formattedHistory = recentChatHistory.map(msg => ({
            role: msg.role === 'user' ? 'human' : 'assistant',
            content: msg.content
        }));

        // Add system message to encourage varied responses
        const systemMessage = {
            role: 'system',
            content: 'You are a helpful news assistant that provides varied, informative responses based on news articles. Only answer with information from the provided news context. If the query is not about news or the context doesn\'t contain relevant information, clearly state that you don\'t have that information.'
        };

        // Create context with relevant passages
        const contextText = relevantPassages.map(p => p.text).join('\n\n');
        const prompt = `Based on the following news information:\n\n${contextText}\n\nPlease provide a unique and helpful answer to: ${query}`;

        try {
            // Use Jina's chat completion API with optimized parameters for variety
        const result = await jinaClient.chat.completions.create({
            messages: [
                systemMessage,
                ...formattedHistory,
                { role: 'human', content: prompt }
            ],
            model: 'jina-chat',
            temperature: 1.0, // Slightly increased for more creativity
            top_p: 0.95,
            max_tokens: 1024,
            frequency_penalty: 0.7, // Increased to strongly reduce repetition
            presence_penalty: 0.7,  // Increased to strongly encourage new content
            logit_bias: {
                // Bias to avoid repetitive patterns
                345: -1.0, // Common punctuation patterns
                1012: -1.0, // Period patterns
                301: -1.0 // Common introductory phrases
            }
        });

            return result.choices[0].message.content;
        } catch (apiError) {
            console.error('Jina API Error:', apiError);

            // Improved fallback response
            return `I found some relevant news information that might help with your question about "${query}":\n\n${relevantPassages.map(p => `- ${p.title || 'Article'}: ${p.text.substring(0, 150)}...`).join('\n\n')}`;
        }
    } catch (error) {
        console.error('Error in RAG pipeline:', error);
        return 'I\'m having trouble accessing the latest news information. Please try asking a general question or try again later.';
    }
}



async function initializeRAG() {
    try {
        const articles = await fetchNewsArticles();
        await storeEmbeddings(articles);
        console.log('✅ RAG pipeline initialized');
        return true;
    } catch (error) {
        console.error('Failed to initialize RAG pipeline:', error);
        return false;
    }
}

module.exports = { processQuery, initializeRAG };
