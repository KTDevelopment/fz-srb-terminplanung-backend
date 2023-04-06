## Description

Backend für die Terminplanung der Fanfarenzug Strausberg App.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev
```

## TODO
- aus app ausloggen wenn userdata isDeleted

email error:
to=<johann.grunewald07@gmail.com>, relay=gmail-smtp-in.l.google.com
[74.125.140.27]:25, delay=0.75, delays=0.11/0/0.09/0.56, dsn=5.7.26, status=bounced (host gmail-smtp-in.l.google.com
[74.125.140.27] said: 550-5.7.26 This message does not pass authentication checks (SPF and DKIM both 550-5.7.26 do not pass). 
SPF check for [fanfarenzug-strausberg-terminplan.de] 550-5.7.26 does not pass with ip: [178.254.33.166].
To best protect our users 550-5.7.26 from spam, the message has been blocked. 
Please visit 550-5.7.26  https://support.google.com/mail/answer/81126#authentication for more 550 5.7.26 information. 
a9-20020a056000188900b00228dbcc7c33si2430294wri.163 - gsmtp (in reply to end of DATA command))
