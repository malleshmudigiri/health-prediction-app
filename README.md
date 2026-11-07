# Health Prediction & Patient Management

React (Vite) frontend + FastAPI backend + SQLite + optional Gemini AI remarks.

## Run backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows; create .env manually on macOS/Linux
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

## Run frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

Set `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env` if needed.
Set `GEMINI_API_KEY` in `backend/.env` to enable AI-generated remarks. Without a key,
the API returns a safe fallback message. Never commit `.env` files.

## Notes
- DOB input/display uses DD.MM.YYYY or DD/MM/YYYY; future and impossible dates are rejected.
- Email is validated by Pydantic.
- Duplicate patient names/emails are allowed because the assessment includes a repeated record.
- AI output is informational only, not a medical diagnosis. Blood-test interpretation depends on
  units, reference ranges, age, sex, clinical history and laboratory context.
