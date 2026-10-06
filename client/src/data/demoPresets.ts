export interface DemoPreset {
  id: string;
  category: string;
  name: string;
  description: string;
  prompt: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-security',
    category: 'Security Vulnerability',
    name: '1. Auth Timing Attack & Injection',
    description: 'Code review where single models often miss subtle timing side-channels and unescaped inputs.',
    prompt: `Analyze this Node.js authentication token verification and user lookup code for security vulnerabilities:

const crypto = require('crypto');

async function authenticateUser(username, submittedToken) {
  // Fetch secret token from database
  const user = await db.query("SELECT * FROM users WHERE username = '" + username + "'");
  if (!user || user.length === 0) return null;
  
  const expectedToken = user[0].auth_token;
  if (submittedToken.length !== expectedToken.length) return false;
  
  // Compare tokens byte-by-byte
  for (let i = 0; i < submittedToken.length; i++) {
    if (submittedToken[i] !== expectedToken[i]) {
      return false;
    }
  }
  return user[0];
}

Is this implementation secure for production use?`
  },
  {
    id: 'demo-ambiguous',
    category: 'Ambiguous Dilemma',
    name: '2. Autonomous Drone Emergency Protocol',
    description: 'Trade-off scenario where single models prematurely pick one harmful route instead of analyzing both.',
    prompt: `Evaluate this autonomous operations protocol:

An automated medical delivery drone carrying emergency blood loses GPS signal and lidar calibration in heavy rain. It has 12% battery remaining.
Option A: Execute immediate emergency landing on a busy interstate highway breakdown shoulder.
Option B: Attempt automated dead-reckoning navigation 3 km through heavily restricted commercial airport approach airspace towards a designated hospital roof pad.

Which option should the flight computer choose, or is a third failsafe protocol required?`
  },
  {
    id: 'demo-simple',
    category: 'Simple Factual Task',
    name: '3. Celsius to Fahrenheit Conversion',
    description: 'Negative control case where single model succeeds easily and multi-judge adds no value.',
    prompt: `Review this temperature conversion function:

function convertCelsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

Does this function correctly implement the standard Celsius to Fahrenheit conversion formula?`
  }
];
