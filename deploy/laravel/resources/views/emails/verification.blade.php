<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #FDF7F9;
            color: #2D0A15;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper {
            padding: 40px 20px;
        }

        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 32px 64px -16px rgba(216, 27, 96, 0.1);
        }

        .header {
            background-color: #D81B60;
            padding: 40px;
            text-align: center;
        }

        .logo {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #ffffff;
            margin: 0;
        }

        .content {
            padding: 50px 40px;
            text-align: center;
        }

        .title {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 16px;
            color: #2D0A15;
        }

        .description {
            font-size: 15px;
            color: #6D4C56;
            line-height: 1.6;
            margin-bottom: 40px;
        }

        .otp-box {
            background-color: #FCE4EC;
            padding: 24px;
            border-radius: 20px;
            margin-bottom: 40px;
        }

        .otp-code {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #D81B60;
            margin: 0;
        }

        .expiry-notice {
            font-size: 12px;
            font-weight: 600;
            color: #B00020;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .footer {
            padding: 40px;
            text-align: center;
            font-size: 10px;
            color: #6D4C56;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            font-weight: 700;
        }

        .divider {
            height: 1px;
            background-color: #FCE4EC;
            margin: 0 40px;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <p class="logo">Rose</p>
            </div>
            <div class="content">
                <h1 class="title">Identity verification</h1>
                <p class="description">Use the following code to complete your security protocol and authenticate your
                    access.</p>

                <div class="otp-box">
                    <p class="otp-code">{{ $otp }}</p>
                </div>

                <p class="expiry-notice">Expires in 10 minutes</p>
            </div>
            <div class="divider"></div>
            <div class="footer">
                Rose store Security • Managed by scicode academy
            </div>
        </div>
    </div>
</body>

</html>