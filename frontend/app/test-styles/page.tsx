export default function TestStyles() {
  return (
    <div style={{ padding: '40px' }}>
      <h1 className="text-4xl font-bold 
        text-blue-500 mb-4">
        Tailwind Test
      </h1>
      
      <div className="card mb-4">
        Card with custom class
      </div>
      
      <div className="glass p-4 rounded-xl mb-4">
        Glass effect card
      </div>
      
      <button className="btn-primary mr-4">
        Primary Button
      </button>
      
      <button className="btn-ghost">
        Ghost Button
      </button>
      
      <div className="flex gap-4 mt-4">
        <span className="badge badge-active">
          Active
        </span>
        <span className="badge badge-idle">
          Idle
        </span>
        <span className="badge badge-sleeping">
          Sleeping
        </span>
      </div>
      
      <input 
        className="input-dark mt-4" 
        placeholder="Test input..."
      />
    </div>
  )
}
