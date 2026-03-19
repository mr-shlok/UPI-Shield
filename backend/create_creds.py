import json
import re

# Use a raw string for the source
raw_private_key_source = r'''-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDv52udKu9bHp9V\nRo+2+dVl5r7oh4ZI15Xuu7CkxczyJVlAID3pwAXZ+lT8Vy85tkWQO3raxaeUyAMp\npXoMrWb62uYWg62bsoOJ7h9uU+IywaLAcaYuJfpiIxXZ7uKR2qg55ZLM7oiaUxDU\ncbzCL+LdfAIVIGdenPelzNnIJllJsxeGkoCr543P0UtGA+izSk+DGPFC5a3RucBN\nmcEgambJPcgLM4H+bF8avE7IxeTP6xQQl0UZfvgCFEuAjpefGrQeqysAP7HOj1B8\nY0+fZwmfjcRCrAeWmbMI8O99UEz3yGTVOufH27aQjyX+Qv51kvd4bPFCdGTBe95G\nCJBUpJK1AgMBAAECggEAMtuDMYAg2lcBTZVmEZLghZf3WDmkwsvrJb9FyQSCuEGp\nLEI5hdR2mRlry0vbP9ePYy5s0rSMnGqTWxCQsV/QQTVHCjZThzp+jq67nIqtXPe2\nPihJo6Za8FOCRh9RijyJpa5wor+dl2OtIXBUJPF8XVo04dArAcBycoRdFcRlcM0c\uzYShXCehVsow8UsAStepy5A91zsCFYRqZ+83U+1mSHh00qpL1NOz7tbhjvS3oHn\nThRTHcyXUbfE+DY0ZKQIn68FH4J0559m0RCAe/qikXc1fDXUS53Bb9ASpxneadL9\nwPI4n08vCCdHFp9/c7lI47q037GryEaiyWRoJDu2kQKBgQD/xFf5PXCgBxTU9O7r\GEfRee1/PrTT02oWVUriNEAOAcSoaegqbBNJ70COF1w7Ub5QL8l+dpWIGx3EdsCH\nEvAxowB1y8mWwpUwBAwXE7O6kES9oE0L+Tcd3Pqp+vreOpY1z7ILFq4H6p65wXF+\naulpStivLzCdlzCkvqcBBabj0QKBgQDwH2BzVAnt5lWmoIAJi0RQZKX7Sh2iiiCf\nMRE4tA5lWUoSr+It86N2UkNLb6XUu6wD83U9LK5LxsoIsKo4F9ComlgE5wFaqD+t\nfbqnBmhYc1uG2GjJF1MAmsEIwmDUNDxZUfUyn0fskDMhZY/OAhJDzhME8+XdV5ZE\n2Lve44gtpQKBgF07453VicKsEin3B0jn1vZDbhHed+hnvtpZSSzgQyFX/6oswRcF\nwppG/s9NMK/nAmsUoGzbKXMt/1HowBH9E1Xkx3wpR1kPoXaZYxbedbvib0x4rN1a\ngX7/WNixxtVPogYHqi1knRgBrM6l94tPybo6MHbbyusHfBHx9crnloihAoGALujC\nS+V4Bxy/UMz8FmE5mEcBUgUZov4+/zpztdMfGNeHq/zmP7ngDiZl9R+7ksKTCTaP\nicLnze/o2ifBKTIl1jpIxbRnRFGoFvl/9E9BJT5r+/zdA6Pl2DFjUpW+mtYVkBF9\nyETrpSBKjNStcj5fWRWyC36mQkZxGcQJd7KVkO0CgYBkaaLZhArz9QJPRAB3NBbd\ndk//NQEhrCOAd72RKy8UIrlv1Y/xG8QyZ4bLTolYqB7Kox5Z9mbMB2RP6lcIZdau\n0bcoaw/e7CzXzrrDVTJRVK1S1Csp2AUDhEKvYt6v0plQnIIAi6yCte/gD3dhsQDJ\npvckwHJfYP3ROFL9jd8+og==\n-----END PRIVATE KEY-----\n'''

# Fix: First convert all "\\" (escaped backslash) to a single character backslash
# But since it's a raw string r'''...''', the backslashes are already single.
# So we need to handle both \n and solo \.

# Replace literal "\n" strings (backslash and n) with real newlines
formatted_key = raw_private_key_source.strip().replace('\\n', '\n')

# Now, find any REMAINING solo backslashes (not followed by n) and turn them into newlines
# because they are likely missing 'n' or are accidental line breaks.
formatted_key = re.sub(r'\\(?![n])', '\n', formatted_key)

config = {
  "type": "service_account",
  "project_id": "upi-shield-abc05",
  "private_key_id": "6873efe7aea0955940713450a46e24c999af53e2",
  "private_key": formatted_key,
  "client_email": "firebase-adminsdk-fbsvc@upi-shield-abc05.iam.gserviceaccount.com",
  "client_id": "102827001505005759483",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40upi-shield-abc05.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

with open('firebase-credentials.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Regenerated firebase-credentials.json with cleaned backslashes")
