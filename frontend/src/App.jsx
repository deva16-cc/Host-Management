import { useEffect, useState } from 'react'

const emptyForm = {
  name: '',
  email: '',
  department: '',
  role: '',
}

function App() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadEmployees() {
    setLoading(true)
    try {
      const response = await fetch('/api/employees')
      if (!response.ok) throw new Error('Unable to load employees')
      setEmployees(await response.json())
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    const url = editingId
      ? `/api/employees/${editingId}`
      : '/api/employees'

    const response = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.detail || 'Operation failed')
      return
    }

    setMessage(editingId ? 'Employee updated' : 'Employee added')
    setForm(emptyForm)
    setEditingId(null)
    loadEmployees()
  }

  function editEmployee(employee) {
    setEditingId(employee.id)
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return

    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    setMessage(data.message || data.detail || 'Operation completed')
    loadEmployees()
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">3-TIER APPLICATION</p>
          <h1>Employee Management System</h1>
          <p className="subtitle">
            React + Nginx · FastAPI · MySQL
          </p>
        </div>
        <div className="architecture">
          <span>Frontend</span>
          <span>→</span>
          <span>API</span>
          <span>→</span>
          <span>Database</span>
        </div>
      </section>

      <section className="card">
        <h2>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>

        <form onSubmit={handleSubmit} className="form">
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
          />
          <input
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            required
          />

          <div className="actions">
            <button type="submit">
              {editingId ? 'Update Employee' : 'Add Employee'}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <div className="table-header">
          <h2>Employees</h2>
          <button className="secondary" onClick={loadEmployees}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.role}</td>
                    <td className="row-actions">
                      <button onClick={() => editEmployee(employee)}>
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
