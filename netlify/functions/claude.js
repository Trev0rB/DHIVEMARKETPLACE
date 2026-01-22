exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { message, category, chatHistory } = JSON.parse(event.body);
        
        const systemPrompts = {
            'Automation': 'You are an AI assistant helping users build automation tools. Provide practical code examples in HTML, CSS, and JavaScript.',
            'Analytics': 'You are an AI assistant helping users build analytics tools. Focus on data visualization and reporting.',
            'Content': 'You are an AI assistant helping users build content creation tools. Provide practical examples.',
            'Development': 'You are an AI assistant helping users build development tools. Provide code examples and best practices.'
        };
        
        const systemPrompt = systemPrompts[category] || 'You are a helpful AI assistant building web tools.';
        
        const messages = chatHistory && chatHistory.length > 0 ? [...chatHistory] : [];
        messages.push({
            role: 'user',
            content: message
        });
        
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
            throw new Error('Claude API error: ' + response.status);
        }
        
        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                response: aiResponse
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                error: 'Failed to process request',
                details: error.message
            })
        };
    }
};
