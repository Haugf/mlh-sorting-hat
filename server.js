require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.json());

// OAuth Configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = 'public user:read:email user:read:profile user:read:education'; // Added education scope

app.get('/debug-config', (req, res) => {
    res.json({
        clientId: CLIENT_ID ? 'Loaded' : 'Missing',
        redirectUri: REDIRECT_URI,
        scopes: SCOPES,
        encodedScopes: encodeURIComponent(SCOPES)
    });
});

// 1. Redirect user to MyMLH for authorization
app.get('/login', (req, res) => {
    const authUrl = `https://my.mlh.io/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;
    console.log('Redirecting to:', authUrl);
    res.redirect(authUrl);
});

// 2. Handle callback and exchange code for access token
app.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send(`Authentication Error: ${error}. Please check your MyMLH App Scopes.`);
    }

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const tokenResponse = await axios.post('https://my.mlh.io/oauth/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const accessToken = tokenResponse.data.access_token;

        // In a real app, you'd establish a session here. 
        // For this hackathon demo, we'll redirect to the frontend with the token in the URL hash 
        // (simple but not production secure) or just serve the main page and let frontend fetch via proxy.
        // Let's redirect to home with a query param to indicate success, 
        // but we need to store the token somewhere. 
        // Simplest for this demo: Send token to client (be careful in prod).
        res.redirect(`/?token=${accessToken}`);

    } catch (error) {
        const errorMsg = `Error exchanging code for token: ${error.response ? JSON.stringify(error.response.data) : error.message}\n`;
        fs.appendFileSync('error.log', errorMsg);
        console.error(errorMsg);
        res.status(500).send('Authentication failed');
    }
});

// 3. Proxy endpoint to fetch user data
app.get('/api/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const userResponse = await axios.get('https://api.mlh.com/v4/users/me?expand[]=education', {
            headers: {
                Authorization: authHeader
            }
        });
        res.json(userResponse.data);
    } catch (error) {
        let errorLog = `[${new Date().toISOString()}] Error fetching user data: ${error.message}\n`;
        if (error.response) {
            errorLog += `Status: ${error.response.status}\n`;
            errorLog += `Data: ${JSON.stringify(error.response.data)}\n`;
            errorLog += `Headers: ${JSON.stringify(error.response.headers)}\n`;
        }
        fs.appendFileSync('error.log', errorLog);

        console.error('Error fetching user data:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
