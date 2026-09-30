import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [clientWallet, setClientWallet] = useState({ deposit_balance: 50.00, total_spent: 0.00 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTaskSubmissions, setSelectedTaskSubmissions] = useState(null);

  const customClientId = user?.user_metadata?.client_custom_id || `TB-C-000001`;

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Social Media Marketing',
    customCategory: '',
    targetCountry: 'Worldwide',
    targetWorkers: 10,
    reward: 0.20,
    taskUrl: '',
    requiredProof: '',
  });

  useEffect(() => {
    fetchClientTasks();
    fetchClientSubmissions();
    fetchClientWallet();
  }, [user]);

  const fetchClientTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setTasks(data);
  };

  const fetchClientSubmissions = async () => {
    const { data } = await supabase.from('submissions').select('*');
    if (data) setSubmissions(data);
  };

  const fetchClientWallet = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('client_profiles')
      .select('deposit_balance, total_spent')
      .eq('id', user.id)
      .single();

    if (data) {
      setClientWallet({ deposit_balance: data.deposit_balance || 50.00, total_spent: data.total_spent || 0.00 });
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const taskCost = parseFloat(newTask.reward) * parseInt(newTask.targetWorkers);

    if (clientWallet.deposit_balance < taskCost) {
      alert(`আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন: $${taskCost.toFixed(2)}, আপনার ব্যালেন্স: $${clientWallet.deposit_balance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    const finalCategory = newTask.category === 'Other' ? newTask.customCategory || 'Other' : newTask.category;

    const { error } = await supabase.from('tasks').insert([
      {
        client_id: user.id,
        client_custom_id: customClientId,
        title: newTask.title,
        category: finalCategory,
        target_country: newTask.targetCountry,
        target_workers: parseInt(newTask.targetWorkers),
        reward: parseFloat(newTask.reward),
        task_url: newTask.taskUrl,
        proof_requirement: newTask.requiredProof,
        status: 'active'
      }
    ]);

    if (!error) {
      const newBalance = clientWallet.deposit_balance - taskCost;
      const newSpent = clientWallet.total_spent + taskCost;

      await supabase.from('client_profiles').upsert({
        id: user.id,
        client_custom_id: customClientId,
        deposit_balance: newBalance,
        total_spent: newSpent,
        updated_at: new Date()
      });

      setClientWallet({ deposit_balance: newBalance, total_spent: newSpent });
      alert('টাস্ক সফলভাবে পোস্ট করা হয়েছে এবং বাজেট ওয়ালেট থেকে কাটা হয়েছে!');
      setShowModal(false);
      setNewTask({
        title: '',
        category: 'Social Media Marketing',
        customCategory: '',
        targetCountry: 'Worldwide',
        targetWorkers: 10,
        reward: 0.20,
        taskUrl: '',
        requiredProof: '',
      });
      fetchClientTasks();
    } else {
      alert('Error creating task: ' + error.message);
    }
    setLoading(false);
  };

  const handleUpdateSubmissionStatus = async (subId, status) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', subId);

    if (!error) {
      alert(`প্রুফটি ${status === 'approved' ? 'অনুমোদন' : 'বাতিল'} করা হয়েছে!`);
      fetchClientSubmissions();
      setSelectedTaskSubmissions(null);
    }
  };

  const totalCost = (parseFloat(newTask.reward || 0) * parseInt(newTask.targetWorkers || 0)).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Client Dashboard</h1>
            <span className="bg-white/20 text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">Verified Client</span>
          </div>
          <p className="text-sm text-indigo-100">Welcome back, <span className="font-bold">{user?.user_metadata?.full_name || 'Client'}</span></p>
          
          <div className="mt-3 flex items-center gap-2 text-xs bg-black/20 text-indigo-200 px-3 py-1.5 rounded-lg w-fit">
            <span>Client ID:</span>
            <span className="font-mono text-white font-bold">{customClientId}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md text-center min-w-[110px] border border-white/20">
            <p className="text-xs text-indigo-200">Deposit Balance</p>
            <p className="text-2xl font-black text-emerald-300">${clientWallet.deposit_balance.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md text-center min-w-[100px] border border-white/20">
            <p className="text-xs text-indigo-200">Total Spent</p>
            <p className="text-xl font-extrabold text-white">${clientWallet.total_spent.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-indigo-700 font-bold px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg text-sm flex items-center gap-1.5"
          >
            <span>+</span> Post Task
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">My Posted Tasks</h2>
        <span className="text-xs text-slate-500">Showing {tasks.length} tasks</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-2 bg-white p-10 rounded-2xl text-center border border-slate-200 text-slate-500 shadow-sm">
            <p className="text-base font-semibold">এখনো কোনো টাস্ক পোস্ট করা হয়নি।</p>
          </div>
        ) : (
          tasks.map((task) => {
            const taskSubs = submissions.filter((s) => s.task_id === task.id);
            return (
              <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100">
                      {task.category}
                    </span>
                    <span className="text-xs text-slate-400">{task.target_country || 'Worldwide'}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{task.title}</h3>
                  <p className="text-xs font-mono text-indigo-600 font-bold mt-1">Task ID: {task.id}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500">Proofs Received: </span>
                    <span className="font-bold text-indigo-600">{taskSubs.length} Proofs</span>
                  </div>

                  <button
                    onClick={() => setSelectedTaskSubmissions({ task, subs: taskSubs })}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-200"
                  >
                    Review Proofs ({taskSubs.length})
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedTaskSubmissions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Review Submitted Proofs</h3>
                <p className="text-xs font-mono text-indigo-600 font-bold">Task ID: {selectedTaskSubmissions.task.id}</p>
              </div>
              <button onClick={() => setSelectedTaskSubmissions(null)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            {selectedTaskSubmissions.subs.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">কোনো ওয়ার্কার এখনো প্রুফ জমা দেয়নি।</p>
            ) : (
              <div className="space-y-4">
                {selectedTaskSubmissions.subs.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 border rounded-xl flex flex-col md:flex-row justify-between items-start text-xs gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">{sub.worker_custom_id}</span>
                        <span className="text-slate-500">User: <strong className="text-slate-800">{sub.worker_username}</strong></span>
                      </div>
                      <p><strong className="text-slate-700">Details:</strong> {sub.proof_details}</p>
                      
                      <div className="flex gap-3 pt-1">
                        {sub.screenshot_url_1 && (
                          <a href={sub.screenshot_url_1} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline bg-white px-2 py-1 rounded border">
                            Screenshot 1 🔗
                          </a>
                        )}
                        {sub.screenshot_url_2 && (
                          <a href={sub.screenshot_url_2} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline bg-white px-2 py-1 rounded border">
                            Screenshot 2 🔗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 min-w-[100px]">
                      {sub.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateSubmissionStatus(sub.id, 'approved')}
                            className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateSubmissionStatus(sub.id, 'rejected')}
                            className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-1 rounded font-bold uppercase text-center ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {sub.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Create New Micro Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Like Facebook Page and Share Recent Post"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Social Media Marketing">Social Media (FB, IG, TikTok)</option>
                    <option value="YouTube Promotion">YouTube (Sub, Watch, Comment)</option>
                    <option value="App Download & Review">App Download & Review</option>
                    <option value="Website Visit & Signup">Website Visit & Signup</option>
                    <option value="Data Entry & Form Fillup">Data Entry & Form Fillup</option>
                    <option value="Micro Writing & Review">Micro Writing & Review</option>
                    <option value="Other">Other (অন্যান্য)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Country</label>
                  <select
                    value={newTask.targetCountry}
                    onChange={(e) => setNewTask({ ...newTask, targetCountry: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Worldwide">Worldwide (সব দেশ)</option>
                    <option value="Bangladesh">Bangladesh Only</option>
                    <option value="Asia">Asia Region</option>
                    <option value="USA / International">USA & Europe</option>
                  </select>
                </div>
              </div>

              {newTask.category === 'Other' && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-800 mb-1">Specify Custom Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telegram Channel Join / Survey"
                    value={newTask.customCategory}
                    onChange={(e) => setNewTask({ ...newTask, customCategory: e.target.value })}
                    className="w-full px-3.5 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Worker Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="10"
                    value={newTask.targetWorkers}
                    onChange={(e) => setNewTask({ ...newTask, targetWorkers: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reward Per Worker ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newTask.reward}
                    onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Link / Target URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourpage or https://youtube.com/..."
                  value={newTask.taskUrl}
                  onChange={(e) => setNewTask({ ...newTask, taskUrl: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proof Instructions for Workers *</label>
                <textarea
                  required
                  placeholder="e.g. 1. Take a screenshot showing page liked. 2. Submit screenshot with your FB username."
                  value={newTask.requiredProof}
                  onChange={(e) => setNewTask({ ...newTask, requiredProof: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex justify-between items-center text-xs">
                <span className="text-indigo-800 font-semibold">Total Estimated Budget:</span>
                <span className="text-base font-black text-indigo-700">${totalCost}</span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md"
                >
                  {loading ? 'Posting...' : 'Post Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}