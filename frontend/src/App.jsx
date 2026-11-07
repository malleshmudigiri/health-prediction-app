
import { useEffect, useState } from "react";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "./services/patientService";
import { generateAIremarks } from "./services/aiService";

const empty = {
  full_name: "",
  date_of_birth: "",
  email: "",
  glucose: "",
  haemoglobin: "",
  cholesterol: "",
};

function Dashboard({ patients }) {
  return (
    <section className="stats">
      <article className="stat">
        <span>Total patient records</span>
        <strong>{patients.length}</strong>
      </article>

      <article className="stat">
        <span>AI remarks generated</span>
        <strong>{patients.filter((p) => p.remarks).length}</strong>
      </article>
    </section>
  );
}

function PatientForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState(editing || empty);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(editing || empty);
  }, [editing]);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      await onSave(form);
      setForm({ ...empty });
    } catch (err) {
      setError(
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        "Could not save patient."
      );
    }
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h2>{editing ? "Edit patient" : "Add patient"}</h2>

      <label>
        Full name
        <input
          name="full_name"
          value={form.full_name}
          onChange={change}
          required
          minLength="2"
        />
      </label>

      <label>
        Date of birth <small>(DD/MM/YYYY)</small>
        <input
          name="date_of_birth"
          placeholder="28/01/1960"
          value={form.date_of_birth}
          onChange={change}
          required
        />
      </label>

      <label>
        Email address
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={change}
          required
        />
      </label>

      <div className="three">
        <label>
          Glucose
          <input
            type="number"
            step="any"
            min="0.01"
            name="glucose"
            value={form.glucose}
            onChange={change}
            required
          />
        </label>

        <label>
          Haemoglobin
          <input
            type="number"
            step="any"
            min="0.01"
            name="haemoglobin"
            value={form.haemoglobin}
            onChange={change}
            required
          />
        </label>

        <label>
          Cholesterol
          <input
            type="number"
            step="any"
            min="0.01"
            name="cholesterol"
            value={form.cholesterol}
            onChange={change}
            required
          />
        </label>
      </div>

      {error && <p className="error">{String(error)}</p>}

      <div className="actions">
        <button className="primary">
          {editing ? "Update patient" : "Save patient"}
        </button>

        {editing && (
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function PatientList({
  patients,
  onEdit,
  onDelete,
  onGenerate,
  generatingId,
}) {
  return (
    <section className="panel">
      <h2>Patient records</h2>

      {patients.length === 0 ? (
        <p className="muted">
          No patient records yet. Add a patient to get started.
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>DOB</th>
                <th>Email</th>
                <th>Glucose</th>
                <th>Haemoglobin</th>
                <th>Cholesterol</th>
                <th>AI remarks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.date_of_birth}</td>
                  <td>{p.email}</td>
                  <td>{p.glucose}</td>
                  <td>{p.haemoglobin}</td>
                  <td>{p.cholesterol}</td>

                  <td className="remarks">
                    {p.remarks || "Not generated"}
                  </td>

                  <td>
                    <div className="row-actions">
                      <button
                        className="primary small"
                        disabled={generatingId === p.id}
                        onClick={() => onGenerate(p.id)}
                      >
                        {generatingId === p.id
                          ? "Generating..."
                          : "Generate AI"}
                      </button>

                      <button
                        className="secondary small"
                        onClick={() => onEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger small"
                        onClick={() => onDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [patients, setPatients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [generatingId, setGeneratingId] = useState(null);

  async function refresh() {
    const { data } = await getPatients();
    setPatients(data);
  }

  useEffect(() => {
    refresh().catch(() =>
      setNotice("Cannot connect to backend. Start the FastAPI server.")
    );
  }, []);

  async function save(form) {
    const payload = {
      ...form,
      glucose: Number(form.glucose),
      haemoglobin: Number(form.haemoglobin),
      cholesterol: Number(form.cholesterol),
    };

    if (editing) {
      await updatePatient(editing.id, payload);
      setEditing(null);
      setNotice("Patient updated.");
    } else {
      await createPatient(payload);
      setNotice("Patient created.");
    }

    await refresh();
  }

  async function remove(id) {
    if (!window.confirm("Delete this patient record?")) return;

    try {
      await deletePatient(id);
      setNotice("Patient deleted.");
      await refresh();
    } catch (error) {
      setNotice(
        error.response?.data?.detail || "Could not delete patient."
      );
    }
  }

  async function generateRemarks(id) {
    try {
      setGeneratingId(id);
      setNotice("");

      const response = await generateAIremarks(id);

      setNotice(
        response.data?.remarks
          ? "AI remarks generated successfully."
          : "AI request completed. Check the patient record."
      );

      await refresh();
    } catch (error) {
      console.error("AI remarks error:", error.response?.data || error);

      setNotice(
        error.response?.data?.detail ||
        "Failed to generate AI remarks. Check backend logs."
      );
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="logo">+</span>
          <div>
            <strong>HealthDesk</strong>
            <small>Patient management</small>
          </div>
        </div>

        <span className="api-status">
          ● API-connected app
        </span>
      </header>

      <main>
        <div className="intro">
          <div>
            <p className="eyebrow">HEALTH MANAGEMENT</p>
            <h1>Patient overview</h1>
            <p className="muted">
              Manage patient records and review AI-generated
              health information.
            </p>
          </div>
        </div>

        {notice && (
          <div className="notice">
            {notice}
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        <Dashboard patients={patients} />

        <div className="content-grid">
          <PatientForm
            onSave={save}
            editing={editing}
            onCancel={() => setEditing(null)}
          />

          <PatientList
            patients={patients}
            onEdit={setEditing}
            onDelete={remove}
            onGenerate={generateRemarks}
            generatingId={generatingId}
          />
        </div>

        <p className="disclaimer">
          AI remarks are educational information only and
          are not a medical diagnosis. Consult a qualified
          healthcare professional.
        </p>
      </main>
    </div>
  );
}
