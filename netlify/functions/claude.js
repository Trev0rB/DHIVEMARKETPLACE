// DHIVE - Claude API Backend Function with CORS
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: 'Method not allowed' })
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
        const messages = chatHistory && chatHistory.length > 0 ? [...chatHistory] : [];
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
```

### **5. Commit changes**
- Scroll down
- Commit message: `Fix CORS headers`
- Click **"Commit changes"**

---

## 🔄 **Wait for Auto-Deploy**

**1. Go back to Netlify**
- https://app.netlify.com

**2. Wait 30-60 seconds**
- New deployment will start automatically
- Wait for "Site is live" ✅

---

## 🧪 **TEST AGAIN**

**1. Go back to your .webflow.io site**

**2. Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)

**3. Go to Build AI Tool → Sign in → Select category**

**4. Send a message:**
```
Create a simple todo list
