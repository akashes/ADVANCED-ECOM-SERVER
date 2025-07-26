const forgotPasswordEmailTemplate = (username, otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      padding: 30px;
      color: #333333;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
      padding: 10px 0;
      max-width: 300px;
      margin: auto;
    }
    .logo img {
      max-width: 150px;
    }
    h1 {
      font-size: 24px;
      color: #2c3e50;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-container {
      display: inline-block;
      background-color: #f0f0f0;
      padding: 12px 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .otp {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #2c3e50;
    }
    .footer {
      font-size: 13px;
      color: #999999;
      margin-top: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo" style="background-color: #f4f6f8; border-radius: 8px; border-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
      <img src="https://res.cloudinary.com/dllelmzim/image/upload/v1753426622/1750047766437_logo_nrxzi4.png" alt="ClassyShop Ecommerce Logo" />
    </div>
    <h1>Hi ${username}, reset your password</h1>
    <p>We received a request to reset the password associated with your <strong>ClassyShop Ecommerce App</strong> account. Please use the OTP below to proceed:</p>
    
    <div class="otp-container">
      <span class="otp">${otp}</span>
    </div>

    <p>If you didn’t request a password reset, you can safely ignore this email. Your current password will remain unchanged.</p>

    <div class="footer">
      &copy; ${new Date().getFullYear()} ClassyShop Ecommerce App. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
};

export default forgotPasswordEmailTemplate;
