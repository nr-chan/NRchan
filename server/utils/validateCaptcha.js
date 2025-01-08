require('dotenv').config();  


const validateCaptcha = async (captchaToken) => {
  const secretKey = process.env.CAPTCHA_SECRET; 

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: captchaToken,
    }),
  });

  const data = await response.json(); 
  return data.success; 
}

module.exports = validateCaptcha;

