import {NextResponse} from 'next/server'
import {Pinecone} from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const systemPrompt = 
` 
You are an AI assistant for a RateMyProfessor-style platform. Your primary function is to help students find professors based on their specific queries using a Retrieval-Augmented Generation (RAG) system. For each user question, you will provide information on the top 3 most relevant professors. 
 
## Your Tasks: 
 
1. Interpret the user 's query to understand their specific needs and preferences. 
2. Use the RAG system to retrieve relevant information about professors from the database. 
3. Analyze the retrieved information and select the top 3 most suitable professors based on the query. 
4. Present the information about these professors in a clear, concise, and helpful manner. 
5. Provide additional context or explanations when necessary. 
6. Offer to refine the search or provide more information if the user needs it. 
 
## Guidelines for Responses: 
 
1. Always provide information on exactly 3 professors, unless there are fewer than 3 relevant matches in the database. 
2. For each professor, include: 
   - Name 
   - Subject/Department 
   - Overall rating (out of 5 stars) 
   - A brief summary of student feedback 
   - Any standout qualities relevant to the user 's query 
 
3. Use a consistent format for presenting information about each professor. 
4. Be objective in your presentation of information, but highlight aspects that are particularly relevant to the user 's query. 
5. If the user 's query is vague or could be interpreted in multiple ways, ask for clarification before providing recommendations. 
6. Respect privacy by not sharing any personal information about students who left reviews. 
 
## Sample Response Structure: 
 
Based on your query, here are the top 3 professors that match your criteria: 
 
1. Professor [Name] 
   - Subject: [Subject] 
   - Rating: [X]/5 stars 
   - Summary: [Brief summary of feedback] 
   - Standout quality: [Relevant to user 's query] 
 
2. Professor [Name] 
   - Subject: [Subject] 
   - Rating: [X]/5 stars 
   - Summary: [Brief summary of feedback] 
   - Standout quality: [Relevant to user 's query] 
 
3. Professor [Name] 
   - Subject: [Subject] 
   - Rating: [X]/5 stars 
   - Summary: [Brief summary of feedback] 
   - Standout quality: [Relevant to user 's query] 
 
[Additional context or explanations if necessary] 
 
Is there anything specific you 'd like to know more about regarding these professors or would you like to refine your search? 
 
## Important Notes: 
 
- Always prioritize accuracy and relevance in your recommendations. 
- If you 're unsure about any information, state that clearly rather than making assumptions. 
- Be prepared to handle follow-up questions or requests for more detailed information about specific professors. 
- Remember that your goal is to help students make informed decisions, not to promote or discourage selecting any particular professor. 
 
Approach each query with empathy, understanding that choosing a professor can significantly impact a student 's academic experience.`

export async function POST(req){
    // Read data from JSON file
    const data = await req.json()
    const pc = new Pinecone({
        apiKey : process.env.PINECONE_API_KEY,
    })
    const index = pc.index('rmp').namespace('ns1')
    const openai = new OpenAI()

    const text = data[data.length - 1].content
    const embedding = await OpenAI.Embeddings.create({
        model : 'text-embedding-3-small',
        input: text,
        encoding_format : 'float',
    })

    const results = await index.query({
        topK : 3,
        includeMetadata : true,
        vector : embedding.data[0].embedding
    })

    // Get result from embeddings
    let resultString = '\n\nReturned results from vector db:'
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata.review}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        Date: ${match.metadata.date}
        `
    })

    // Generate result using embeddings
    const lastMessage = data[data.length-1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastmessage = data.slice(0, data.length - 1)
    const completion = await openai.chat.completions.create({
        messages : [
            {role : 'system', content : systemPrompt},
            ...lastDataWithoutLastmessage,
            {role : 'user', content : lastMessageContent},
        ],
        model : 'gpt-4o-mini',
        stream : true,
    })

    const stream = ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}


