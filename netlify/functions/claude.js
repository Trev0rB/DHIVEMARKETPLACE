// DHIVE - Claude API Backend Function
// This keeps your API key secure

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }
    
    try {
        const { message, category, chatHistory } = JSON.parse(event.body);
        
        // Build system prompt based on category
        const systemPrompts = {
            'Automation': 'You are an AI assistant helping users build automation tools. Provide practical code examples in HTML, CSS, and JavaScript. Focus on workflow automation and productivity tools. Keep responses concise and include working code snippets.',
            'Analytics': 'You are an AI assistant helping users build analytics tools. Focus on data visualization, metrics tracking, and reporting features using Chart.js or similar libraries. Provide complete working examples.',
            'Content': 'You are an AI assistant helping users build content creation tools. Help with text generation, editing, and content management features. Provide practical HTML/CSS/JS examples.',
            'Development': 'You are an AI assistant helping users build development tools. Provide code examples, best practices, and technical implementation guidance using modern JavaScript, HTML5, and CSS3.'
        };
        
        const systemPrompt = systemPrompts[category] || 'You are a helpful AI assistant building web tools. Provide complete, working code examples in HTML, CSS, and JavaScript.';
        
        // Prepare messages for Claude API
        const messages = chatHistory.length > 0 ? chatHistory : [];
        messages.push({
            role: 'user',
            content: message
        });
        
        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                system: systemPrompt,
                messages: messages
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', errorText);
            throw new Error(`Claude API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract response text
        const aiResponse = data.content[0].text;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: aiResponse
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Failed to process request',
                details: error.message
            })
        };
    }
};
