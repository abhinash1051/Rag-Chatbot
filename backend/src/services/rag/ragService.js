const { GoogleGenerativeAI } = require('@google/generative-ai');
const vectorStore = require('./vectorStore');
const newsIngestion = require('./newsIngestion');

// Initialize Google Generative AI with proper error handling
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Process a query through the RAG pipeline
exports.processQuery = async (query, chatHistory = []) => {
  try {
    // Retrieve relevant passages from vector store
    let relevantPassages = [];
    try {
      relevantPassages = await vectorStore.retrieveRelevantPassages(query, 3);
    } catch (error) {
      console.error('Error retrieving passages:', error);
      relevantPassages = [
        {
          text: "I don't have specific information about that, but I'll try to help based on my general knowledge.",
          title: "General Knowledge",
          url: "",
          score: 1.0
        }
      ];
    }
    
    // Format chat history for context
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Create prompt with retrieved passages
    const contextText = relevantPassages.map(p => p.text).join('\n\n');
    const prompt = `Based on the following information:\n\n${contextText}\n\nPlease answer the following question: ${query}`;
    
    try {
      // Generate response using Gemini
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });
      
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (aiError) {
      console.error('Error generating AI response:', aiError);
      return "I'm having trouble connecting to my knowledge base right now. Here's what I know: " + contextText;
    }
  } catch (error) {
    console.error('Error in RAG pipeline:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again later.';
  }
};

// Initialize the RAG pipeline
exports.initializeRAG = async () => {
  try {
    // Ingest news articles
    const articles = await newsIngestion.fetchNewsArticles();
    
    // Process and store embeddings
    await vectorStore.storeEmbeddings(articles);
    
    console.log('RAG pipeline initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize RAG pipeline:', error);
    return false;
  }
};