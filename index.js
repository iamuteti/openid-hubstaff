const express = require('express');
const {Issuer, generators} = require('openid-client');
const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    Issuer.discover('https://account.hubstaff.com')
        .then(function (hubIssuer) {
            const client = new hubIssuer.Client({
                client_id: 'P3SK_NBGgupNFpSHQOJnINM1prX7jIHU6VneXHxdNA8',
                client_secret: 'CdJE46ODjqLTMRE0KUCKDVf7q39Lg4gcdJWAXl_54PBrkodTWlUTt9katzHEEcgvorATOsycex7dtEXWlPHmPA',
                redirect_uris: ['http://localhost:3000/cb'],
                response_types: ['code']
            });

            const url = client.authorizationUrl({
                scope: 'openid profile email',
                resource: hubIssuer.authorization_endpoint,
                redirect_uri: "http://localhost:3000/cb",
                code_challenge,
                code_challenge_method: 'S256',
                nonce: 1
            });

            return res.json({url})
        })
        .catch(function (e) {
            console.error('Error: ', e);
            return res.json({
                error: e
            })
        });
});

app.get('/cb', (req, res) => {
    Issuer.discover('https://account.hubstaff.com')
        .then(function (hubIssuer) {
            const client = new hubIssuer.Client({
                client_id: 'P3SK_NBGgupNFpSHQOJnINM1prX7jIHU6VneXHxdNA8',
                client_secret: 'CdJE46ODjqLTMRE0KUCKDVf7q39Lg4gcdJWAXl_54PBrkodTWlUTt9katzHEEcgvorATOsycex7dtEXWlPHmPA',
                redirect_uris: ['http://localhost:3000/cb'],
                response_types: ['code']
            });

            const params = client.callbackParams(req);

            if (params.error)
                return res.json(params);

            client.callback('http://localhost:3000/cb', params, { code_verifier })
                .then(function (tokenSet) {
                    console.log('received and validated tokens %j', tokenSet);
                    console.log('validated ID Token claims %j', tokenSet.claims());

                    client.userinfo(tokenSet) // => Promise
                        .then(function (userInfo) {
                            console.log('User info %j', userInfo);
                            return res.json({
                                user: userInfo
                            })
                        })
                        .catch(e => {
                            console.error('Error: ', e);
                            return res.json({
                                error: e
                            })
                        })
                });

        })
        .catch(function (e) {
            console.error('Error: ', e);
            return res.json({
                error: e
            })
        });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));