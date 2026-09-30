import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0.00, total_earned: 0.00 });
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Structured Proof States
  const [workerUsername, setWorkerUsername] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [screenshot1, setScreenshot1] = useState('');
  const [screenshot2, setScreenshot2] = useState('');

  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('');

  const customWorkerId = user?.user_metadata?.worker_custom_id || `TB-W-000001`;

  useEffect(() => {
    fetchAvailableTasks();
    fetchMySubmissions();
    fetchWalletBalance();
  }, [user]);

  const fetchAvailableTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  };

  const fetchMySubmissions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('worker_id', user.id);

    if (data) setMySubmissions(data);
  };

  const fetchWalletBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('balance, total_earned')
      .eq('id', user.id)
      .single();

    if (data) {
      setWallet({ balance: data.balance || 0.00, total_earned: data.total_earned || 0.00 });
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('submissions').insert([
      {
        task_id: selectedTask.id,
        worker_id: user.id,
        worker_custom_id: customWorkerId,
        worker_username: workerUsername,
        proof_details: proofDetails,
        screenshot_url_1: screenshot1,
        screenshot_url_2: screenshot2,
        status: 'pending'
      }
    ]);

    setLoading(false);

    if (error) {
      alert('Error submitting proof: ' + error.message);
    } else {
      alert('প্রুফ সফলভাবে জমা দেওয়া হয়েছে! ক্লায়েন্ট যাচাই করার পর রেওয়ার্ড যোগ হবে।');
      setSelectedTask(null);
      setWorkerUsername('');
      setProofDetails('');
      setScreenshot1('');
      setScreenshot2('');
      fetchMySubmissions();
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (amountNum < 1.00) {
      alert('সর্বনিম্ন উইথড্র অ্যামাউন্ট $১.০০ ডলার!');
      return;
    }

    if (amountNum > wallet.balance) {
      alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('withdrawals').insert([
      {
        worker_id: user.id,
        worker_custom_id: customWorkerId,
        amount: amountNum,
        payment_method: paymentMethod,
        account_number: accountNumber,
        status: 'pending'
      }
    ]);

    if (!error) {
      // Deduct worker profile balance
      const newBalance = wallet.balance - amountNum;
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      setWallet({ ...wallet, balance: newBalance });
      alert('টাকা তোলার অনুরোধ সফলভাবে জমা দেওয়া হয়েছে! এডমিন দ্রুত টাকা পাঠাবে।');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setAccountNumber('');
    } else {
      alert('Error requesting withdrawal: ' + error.message);
    }
    setLoading(false);
  };

  const getSubmissionStatus = (taskId) => {
    const sub = mySubmissions.find((s) => s.task_id === taskId);
    return sub ? sub.status : null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Worker Banner Header with Balance & Withdraw */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Worker Dashboard</h1>
            <span className="bg-white/20 text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">Verified Worker</span>
          </div>
          <p className="text-sm text-emerald-100">Welcome, <span className="font-bold">{user?.user_metadata?.full_name || 'Worker'}</span></p>
          
          <div className="mt-3 flex items-center gap-2 text-xs bg-black/20 text-emerald-100 px-3 py-1.5 rounded-lg w-fit">
            <span>Worker ID:</span>
            <span className="font-mono text-white font-bold">{customWorkerId}</span>
          </div>
        </div>

        {/* Wallet & Withdraw Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-md text-center min-w-[110px] border border-white/20">
            <p className="text-xs text-emerald-200">Current Balance</p>
            <p className="text-2xl font-black text-amber-300">${wallet.balance.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-md text-center min-w-[110px] border border-white/20">
            <p className="text-xs text-emerald-200">Total Earned</p>
            <p className="text-xl font-extrabold text-white">${wallet.total_earned.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-3 rounded-xl transition-all shadow-lg text-sm flex items-center gap-1.5"
          >
            💸 Withdraw Funds
          </button>
        </div>
      </div>

      {/* Available Tasks */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Available Micro Tasks</h2>
        <span className="text-xs text-slate-500">Showing {tasks.length} tasks</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-2 bg-white p-10 rounded-2xl text-center border border-slate-200 text-slate-500 shadow-sm">
            <p className="text-base font-semibold">বর্তমানে কোনো কাজ খালি নেই।</p>
          </div>
        ) : (
          tasks.map((task) => {
            const status = getSubmissionStatus(task.id);
            return (
              <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">
                      {task.category}
                    </span>
                    <span className="text-xs text-slate-400">{task.target_country || 'Worldwide'}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{task.title}</h3>
                  <p className="text-xs font-mono text-emerald-600 font-bold mt-1">Task ID: {task.id}</p>
                  
                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                    <p><strong className="text-slate-700">Instructions:</strong> {task.proof_requirement}</p>
                    {task.task_url && (
                      <p>
                        <strong className="text-slate-700">Link: </strong>
                        <a href={task.task_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                          Open Work Link 🔗
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500">Reward: </span>
                    <span className="text-base font-black text-emerald-600">${task.reward}</span>
                  </div>

                  {status === 'pending' && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                      ⏳ Pending Approval
                    </span>
                  )}

                  {status === 'approved' && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
                      ✓ Completed & Paid
                    </span>
                  )}

                  {status === 'rejected' && (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200">
                      ✕ Rejected
                    </span>
                  )}

                  {!status && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Start & Submit Proof
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border text-xs flex justify-between">
                <span>Available Balance:</span>
                <span className="font-bold text-emerald-600">${wallet.balance.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm bg-white outline-none"
                >
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="018XXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Withdraw Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  required
                  placeholder="Min $1.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-400 text-slate-900 font-bold rounded-xl text-sm hover:bg-amber-300 shadow-md"
                >
                  {loading ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Submit Work Proof</h3>
                <p className="text-xs font-mono text-emerald-600 font-bold">Task ID: {selectedTask.id}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <p className="font-bold text-slate-800">{selectedTask.title}</p>
                <p className="text-emerald-800"><strong>Required Proof:</strong> {selectedTask.proof_requirement}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Account Username / ID Used for Work *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FB Profile: Md Naim / Telegram @Naim_95"
                  value={workerUsername}
                  onChange={(e) => setWorkerUsername(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Work Explanation / Additional Details *</label>
                <textarea
                  required
                  placeholder="Explain how you completed the task..."
                  value={proofDetails}
                  onChange={(e) => setProofDetails(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm h-16 focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Primary Screenshot URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://imgur.com/screenshot1.png"
                  value={screenshot1}
                  onChange={(e) => setScreenshot1(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4. Secondary Screenshot URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://imgur.com/screenshot2.png"
                  value={screenshot2}
                  onChange={(e) => setScreenshot2(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md"
                >
                  {loading ? 'Submitting...' : 'Submit Verification Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}