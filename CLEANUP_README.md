# Cleaned Project - Prepared for Presentation

This project was cleaned to remove ChatGPT/OpenAI integration and several features that were requested removed.

## Removed or Modified Files (best-effort)

- src/utils/aiHelpers.js
- added: src/components/PlaceholderComponent.js
- edited: src/App.js (imports and placeholders)

## How to run

1. Extract the zip.
2. Backend (if present):

```bash
cd backend
npm install
# set any required env variables in backend/.env (Firebase configs etc.)
node server.js
```

3. Frontend:

```bash
cd ../
npm install
npm start
# or npm run build for production
```

If you see errors about missing env values, check `backend/.env` and `src/config/firebase.js` for required Firebase keys and add them back. Only OpenAI keys were removed automatically.

## Notes
- Placeholder components were inserted to avoid UI breakage for removed features.
- I removed assistant/AI backend routes and frontend helper files.
- This is an automated cleanup; if any runtime errors appear, tell me the exact console/build error and I will patch the files and give a new zip immediately.
