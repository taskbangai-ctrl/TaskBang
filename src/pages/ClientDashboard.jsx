import { useState, useEffect } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  DollarSign,
  Globe2,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
  X,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ClientProfile from '../components/ClientProfile';

export default function ClientDashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [clientWallet, setClientWallet] = useState({
    deposit_balance: 50.0,
    total_spent: 0.0,
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTaskSubmissions, setSelectedTaskSubmissions] =
    useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [reviewModal, setReviewModal] = useState({
    open: false,
    submission: null,
    status: null,
  });

  const [reviewReason, setReviewReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const customClientId =
    user?.user_metadata?.client_custom_id || 'TB-C-000001';

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Social Media Marketing',
    customCategory: '',
    targetCountry: 'Worldwide',
    targetWorkers: 10,
    clientBudget: 5.0,
    workerPayout: 0.01,
    taskUrl: '',
    requiredProof: '',
  });

  useEffect(() => {
    if (user) {
      fetchClientTasks();
      fetchClientSubmissions();
      fetchClientWallet();
    }
  }, [user]);

  const fetchClientTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    } else if (error) {
      console.error('Client Tasks Error:', error);
    }
  };

  const fetchClientSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*');

    console.log('DEBUG Client Submissions:', data);

    if (!error && data) {
      setSubmissions(data);
    } else if (error) {
      console.error('Client Submissions Error:', error);
    }
  };

  const fetchClientWallet = async () => {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('deposit_balance, total_spent')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setClientWallet({
        deposit_balance: Number(data.deposit_balance ?? 50.0),
        total_spent: Number(data.total_spent ?? 0.0),
      });
    } else if (error) {
      console.error('Client Wallet Error:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    const taskCost = parseFloat(newTask.clientBudget);
    const workerPayout = parseFloat(newTask.workerPayout);
    const targetWorkers = parseInt(newTask.targetWorkers, 10);

    if (!Number.isFinite(taskCost) || taskCost <= 0) {
      alert('Please enter a valid task budget.');
      return;
    }

    if (!Number.isFinite(workerPayout) || workerPayout <= 0) {
      alert('Please enter a valid worker payout.');
      return;
    }

    if (!Number.isInteger(targetWorkers) || targetWorkers < 1) {
      alert('Please enter a valid worker count.');
      return;
    }

    if (clientWallet.deposit_balance < taskCost) {
      alert(
        `আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!\n\nপ্রয়োজন: $${taskCost.toFixed(
          2
        )}\nবর্তমান ব্যালেন্স: $${clientWallet.deposit_balance.toFixed(2)}`
      );
      return;
    }

    setLoading(true);

    const finalCategory =
      newTask.category === 'Other'
        ? newTask.customCategory.trim() || 'Other'
        : newTask.category;

    console.log(
      'DEBUG Worker Payout:',
      workerPayout,
      'Form Value:',
      newTask.workerPayout
    );

    const { error } = await supabase.from('tasks').insert([
      {
        client_id: user.id,
        client_custom_id: customClientId,
        title: newTask.title.trim(),
        category: finalCategory,
        target_country: newTask.targetCountry,
        target_workers: targetWorkers,
        worker_payout: workerPayout,
        task_url: newTask.taskUrl.trim(),
        proof_requirement: newTask.requiredProof.trim(),
        status: 'active',
      },
    ]);

    if (error) {
      alert('Error creating task: ' + error.message);
      setLoading(false);
      return;
    }

    const newBalance = clientWallet.deposit_balance - taskCost;
    const newSpent = clientWallet.total_spent + taskCost;

    console.log(
      'DEBUG Client Wallet:',
      clientWallet.deposit_balance,
      'Task Cost:',
      taskCost,
      'New Balance:',
      newBalance
    );

    const { error: walletError } = await supabase
      .from('client_profiles')
      .update({
        deposit_balance: newBalance,
        total_spent: newSpent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    console.log('DEBUG Wallet Update:', walletError);

    if (walletError) {
      alert(
        'Task was created, but the client wallet could not be updated: ' +
          walletError.message
      );
      setLoading(false);
      return;
    }

    setClientWallet({
      deposit_balance: newBalance,
      total_spent: newSpent,
    });

    alert(
      'Task successfully posted. The task budget has been reserved from your client wallet.'
    );

    setShowModal(false);

    setNewTask({
      title: '',
      category: 'Social Media Marketing',
      customCategory: '',
      targetCountry: 'Worldwide',
      targetWorkers: 10,
      clientBudget: 5.0,
      workerPayout: 0.01,
      taskUrl: '',
      requiredProof: '',
    });

    fetchClientTasks();

    setLoading(false);
  };

  const handleUpdateSubmissionStatus = (subId, status) => {
    const submission = submissions.find(
      (sub) => sub.id === subId
    );

    if (!submission) {
      alert('Submission not found.');
      return;
    }

    setReviewReason('');
    setReviewNote('');

    setReviewModal({
      open: true,
      submission,
      status,
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      open: false,
      submission: null,
      status: null,
    });

    setReviewReason('');
    setReviewNote('');
  };

  const handleConfirmReview = async () => {
    if (!reviewModal.submission || !reviewModal.status) {
      return;
    }

    if (!reviewReason.trim()) {
      alert('দয়া করে একটি review reason নির্বাচন করুন।');
      return;
    }

    const finalReviewReason = reviewNote.trim()
      ? `${reviewReason.trim()} — ${reviewNote.trim()}`
      : reviewReason.trim();

    setLoading(true);

    const { error } = await supabase
      .from('submissions')
      .update({
        status: reviewModal.status,
        review_reason: finalReviewReason,
      })
      .eq('id', reviewModal.submission.id);

    if (error) {
      alert('Unable to update submission: ' + error.message);
      setLoading(false);
      return;
    }

    const actionText =
      reviewModal.status === 'approved'
        ? 'অনুমোদন'
        : 'বাতিল';

    alert(`প্রুফটি ${actionText} করা হয়েছে!`);

    closeReviewModal();
    setSelectedTaskSubmissions(null);

    await fetchClientSubmissions();
    await fetchClientTasks();

    setLoading(false);
  };

  const filteredTasks = tasks.filter((task) =>
    `${task.title || ''} ${task.category || ''} ${
      task.target_country || ''
    }`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalBudget = Number(
    newTask.clientBudget || 0
  ).toFixed(2);

  const totalWorkerPayout = Number(
    newTask.workerPayout || 0
  ).toFixed(2);

  const activeTasks = tasks.filter(
    (task) => task.status === 'active'
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Top navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs text-violet-300 font-semibold mb-2">
              <Sparkles size={14} />
              TASKBANG CLIENT WORKSPACE
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Client Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage your tasks, budgets and submitted work.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfile(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                !showProfile
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                showProfile
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <UserRound size={15} />
              My Profile
            </button>
          </div>
        </div>

        {showProfile ? (
          <ClientProfile />
        ) : (
          <>
            {/* Hero / wallet section */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-[#111827] to-cyan-500/10 p-6 sm:p-8 mb-7">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-600/20">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Welcome back
                      </p>

                      <h2 className="text-xl font-black">
                        {user?.user_metadata?.full_name || 'Client'}
                      </h2>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-[11px] text-slate-500">
                      Client ID
                    </span>

                    <span className="font-mono text-xs font-bold text-violet-300">
                      {customClientId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-4 min-w-[135px]">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <WalletCards size={15} />
                      <span className="text-[11px]">Available</span>
                    </div>

                    <p className="text-2xl font-black text-emerald-300">
                      ${clientWallet.deposit_balance.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-4 min-w-[135px]">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <DollarSign size={15} />
                      <span className="text-[11px]">Total Spent</span>
                    </div>

                    <p className="text-2xl font-black">
                      ${clientWallet.total_spent.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="col-span-2 sm:col-span-1 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 px-5 py-4 font-black text-sm transition flex items-center justify-center gap-2 shadow-xl"
                  >
                    <Plus size={18} />
                    Post New Task
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500">
                    Total Tasks
                  </span>

                  <BriefcaseBusiness
                    size={17}
                    className="text-violet-300"
                  />
                </div>

                <p className="text-2xl font-black">
                  {tasks.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500">
                    Active Tasks
                  </span>

                  <Clock3
                    size={17}
                    className="text-cyan-300"
                  />
                </div>

                <p className="text-2xl font-black">
                  {activeTasks}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500">
                    Completed
                  </span>

                  <CheckCircle2
                    size={17}
                    className="text-emerald-300"
                  />
                </div>

                <p className="text-2xl font-black">
                  {completedTasks}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500">
                    Proof Reviews
                  </span>

                  <ClipboardCheck
                    size={17}
                    className="text-amber-300"
                  />
                </div>

                <p className="text-2xl font-black">
                  {submissions.length}
                </p>
              </div>
            </div>

            {/* Task section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black">
                  My Posted Tasks
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  View and review activity from your tasks.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-12 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <BriefcaseBusiness
                    size={24}
                    className="text-violet-300"
                  />
                </div>

                <h3 className="font-bold text-lg mb-2">
                  No tasks found
                </h3>

                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  You haven't posted a task matching your current search.
                </p>

                {tasks.length === 0 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold transition"
                  >
                    <Plus size={16} />
                    Create Your First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid xl:grid-cols-2 gap-4">
                {filteredTasks.map((task) => {
                  const taskSubs = submissions.filter(
                    (s) => s.task_id === task.id
                  );

                  const pendingSubs = taskSubs.filter(
                    (s) => s.status === 'pending'
                  ).length;

                  return (
                    <div
                      key={task.id}
                      className="group rounded-2xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.055] transition-all p-5"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-400/10 flex items-center justify-center shrink-0">
                            <BriefcaseBusiness
                              size={18}
                              className="text-violet-300"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-violet-500/10 text-violet-300 border border-violet-400/10">
                                {task.category}
                              </span>

                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                                  task.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-300'
                                    : 'bg-white/5 text-slate-400'
                                }`}
                              >
                                {task.status || 'pending'}
                              </span>
                            </div>

                            <h3 className="font-bold text-base leading-6 truncate">
                              {task.title}
                            </h3>

                            <p className="text-[11px] text-slate-600 font-mono mt-1">
                              Task ID: {task.id}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                          <Globe2 size={13} />
                          {task.target_country || 'Worldwide'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Users size={14} />

                            <span className="text-[10px]">
                              Target Workers
                            </span>
                          </div>

                          <p className="font-bold text-sm">
                            {task.target_workers || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <ClipboardCheck size={14} />

                            <span className="text-[10px]">
                              Submitted Proofs
                            </span>
                          </div>

                          <p className="font-bold text-sm">
                            {taskSubs.length}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                          <p className="text-[10px] text-slate-600 mb-1">
                            Worker Payout
                          </p>

                          <p className="text-sm font-black text-emerald-300">
                            $
                            {Number(
                              task.worker_payout || 0
                            ).toFixed(2)}
                          </p>

                          <p className="text-[10px] text-slate-600 mt-1">
                            Per approved worker
                          </p>
                        </div>

                        <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                          <p className="text-[10px] text-slate-600 mb-1">
                            Client Budget
                          </p>

                          <p className="text-sm font-black text-cyan-300">
                            Managed from wallet
                          </p>
                        </div>
                      </div>

                      {pendingSubs > 0 && (
                        <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-500/5 px-3 py-2">
                          <p className="text-xs text-amber-300">
                            {pendingSubs} proof
                            {pendingSubs > 1 ? 's' : ''} waiting
                            for review.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[10px] text-slate-600">
                            Payout policy
                          </p>

                          <p className="text-sm font-black text-violet-300">
                            Client set • Admin can modify
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedTaskSubmissions({
                              task,
                              subs: taskSubs,
                            })
                          }
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/10 text-violet-300 text-xs font-bold transition"
                        >
                          Review Proofs
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review submissions modal */}
      {selectedTaskSubmissions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1320] shadow-2xl">
            <div className="sticky top-0 z-10 bg-[#0d1320]/95 backdrop-blur-xl border-b border-white/10 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">
                  Review Submitted Proofs
                </h3>

                <p className="text-[11px] text-violet-300 font-mono mt-1">
                  Task ID: {selectedTaskSubmissions.task.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTaskSubmissions(null)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {selectedTaskSubmissions.subs.length === 0 ? (
                <div className="py-12 text-center">
                  <ClipboardCheck
                    size={28}
                    className="mx-auto text-slate-600 mb-3"
                  />

                  <p className="text-sm text-slate-500">
                    কোনো ওয়ার্কার এখনো প্রুফ জমা দেয়নি।
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTaskSubmissions.subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                    >
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-400/10 px-2.5 py-1 rounded-lg">
                              {sub.worker_custom_id}
                            </span>

                            <span className="text-xs text-slate-500">
                              Worker:
                              <strong className="text-slate-300 ml-1">
                                {sub.worker_username}
                              </strong>
                            </span>
                          </div>

                          <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-1">
                              Proof Details
                            </p>

                            <p className="text-xs text-slate-300 leading-5">
                              {sub.proof_details}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {sub.screenshot_url_1 && (
                              <a
                                href={sub.screenshot_url_1}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-violet-300 font-bold"
                              >
                                Screenshot 1
                                <ExternalLink size={13} />
                              </a>
                            )}

                            {sub.screenshot_url_2 && (
                              <a
                                href={sub.screenshot_url_2}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-violet-300 font-bold"
                              >
                                Screenshot 2
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2 lg:min-w-[110px]">
                          {sub.status === 'pending' ? (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateSubmissionStatus(
                                    sub.id,
                                    'approved'
                                  )
                                }
                                className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleUpdateSubmissionStatus(
                                    sub.id,
                                    'rejected'
                                  )
                                }
                                className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-red-300 text-xs font-bold transition"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase text-center ${
                                sub.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : 'bg-red-500/10 text-red-300'
                              }`}
                            >
                              {sub.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create task modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1320] shadow-2xl my-8">
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-violet-300 text-xs font-bold mb-1">
                  <Plus size={14} />
                  NEW TASK
                </div>

                <h3 className="text-xl font-black">
                  Create New Task
                </h3>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="p-5 sm:p-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Task Title *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Visit website and complete the required action"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      title: e.target.value,
                    })
                  }
                  className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Category *
                  </label>

                  <select
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        category: e.target.value,
                      })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    <option value="Social Media Marketing">
                      Social Media
                    </option>

                    <option value="YouTube Promotion">
                      YouTube
                    </option>

                    <option value="App Download & Review">
                      App / Product Testing
                    </option>

                    <option value="Website Visit & Signup">
                      Website / Signup
                    </option>

                    <option value="Data Entry & Form Fillup">
                      Data Entry
                    </option>

                    <option value="Micro Writing & Review">
                      Writing / Review
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Target Country
                  </label>

                  <select
                    value={newTask.targetCountry}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        targetCountry: e.target.value,
                      })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    <option value="Worldwide">
                      Worldwide
                    </option>

                    <option value="Bangladesh">
                      Bangladesh
                    </option>

                    <option value="Asia">
                      Asia Region
                    </option>

                    <option value="USA / International">
                      USA & Europe
                    </option>
                  </select>
                </div>
              </div>

              {newTask.category === 'Other' && (
                <div className="rounded-2xl border border-amber-400/10 bg-amber-500/5 p-4">
                  <label className="block text-xs font-bold text-amber-300 mb-2">
                    Custom Category Name *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Enter category name"
                    value={newTask.customCategory}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        customCategory: e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl border border-amber-400/10 bg-black/20 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Worker Count *
                  </label>

                  <div className="relative">
                    <Users
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={newTask.targetWorkers}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          targetWorkers: e.target.value,
                        })
                      }
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Client Task Budget ($) *
                  </label>

                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={newTask.clientBudget}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          clientBudget: e.target.value,
                        })
                      }
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Worker Payout ($) *
                  </label>

                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={newTask.workerPayout}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          workerPayout: e.target.value,
                        })
                      }
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none focus:border-violet-500/50"
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    Amount each approved worker will earn.
                  </p>
                </div>
              </div>

              {/* Business rule notice */}
              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-500/5 p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={19}
                    className="text-cyan-300 shrink-0 mt-0.5"
                  />

                  <div>
                    <p className="text-xs font-bold text-cyan-300 mb-1">
                      TaskBang payout policy
                    </p>

                    <p className="text-xs text-slate-400 leading-5">
                      You can set the worker payout when posting your
                      task. TaskBang/Admin can review or modify the
                      payout. Workers cannot change the payout amount.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Task Link / Target URL
                </label>

                <input
                  type="url"
                  placeholder="https://example.com/..."
                  value={newTask.taskUrl}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      taskUrl: e.target.value,
                    })
                  }
                  className="w-full h-12 px-4 rounded-xl border border-white/10 bg-black/20 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Proof Instructions for Workers *
                </label>

                <textarea
                  required
                  placeholder="Explain exactly what proof workers must submit..."
                  value={newTask.requiredProof}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      requiredProof: e.target.value,
                    })
                  }
                  className="w-full min-h-28 px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-sm text-white placeholder:text-slate-600 outline-none resize-none focus:border-violet-500/50"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-violet-400/10 bg-violet-500/5 p-4">
                  <p className="text-xs font-bold text-violet-300">
                    Client Budget
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Amount reserved from your client wallet
                  </p>

                  <p className="text-2xl font-black text-white mt-2">
                    ${totalBudget}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-4">
                  <p className="text-xs font-bold text-emerald-300">
                    Worker Payout
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Amount per approved worker
                  </p>

                  <p className="text-2xl font-black text-white mt-2">
                    ${totalWorkerPayout}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-sm font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-bold transition shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting Task...' : 'Post Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Review Modal */}
      {reviewModal.open && reviewModal.submission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1320] shadow-2xl overflow-hidden">

            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      reviewModal.status === 'approved'
                        ? 'text-emerald-300'
                        : 'text-red-300'
                    }`}
                  >
                    {reviewModal.status === 'approved'
                      ? 'Approve Submission'
                      : 'Reject Submission'}
                  </p>

                  <h2 className="text-xl font-black text-white mt-1">
                    Review Worker Submission
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Give the worker a clear reason for your decision.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={loading}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                      Worker
                    </p>

                    <p className="text-sm font-bold text-violet-300 mt-1">
                      {reviewModal.submission.worker_custom_id ||
                        'Worker'}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${
                      reviewModal.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    {reviewModal.status}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Review Reason *
                </label>

                <select
                  value={reviewReason}
                  onChange={(e) =>
                    setReviewReason(e.target.value)
                  }
                  disabled={loading}
                  className="w-full h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
                >
                  <option value="">Select a reason</option>

                  {reviewModal.status === 'approved' ? (
                    <>
                      <option value="Task requirements fully followed">
                        Task requirements fully followed
                      </option>

                      <option value="Valid proof submitted">
                        Valid proof submitted
                      </option>

                      <option value="Task completed correctly">
                        Task completed correctly
                      </option>

                      <option value="Quality meets task requirements">
                        Quality meets task requirements
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="Task not completed">
                        Task not completed
                      </option>

                      <option value="Requirements not followed">
                        Requirements not followed
                      </option>

                      <option value="Invalid proof">
                        Invalid proof
                      </option>

                      <option value="Missing required screenshot">
                        Missing required screenshot
                      </option>

                      <option value="Submitted proof is unclear">
                        Submitted proof is unclear
                      </option>

                      <option value="Work does not match the task">
                        Work does not match the task
                      </option>
                    </>
                  )}

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Additional Note
                  <span className="text-slate-500 font-normal">
                    {' '}
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={reviewNote}
                  onChange={(e) =>
                    setReviewNote(e.target.value)
                  }
                  disabled={loading}
                  rows={4}
                  placeholder="Write a short message for the worker..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50 resize-none disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-sm font-bold text-slate-300 transition disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReview}
                  disabled={!reviewReason || loading}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    reviewModal.status === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {loading
                    ? 'Processing...'
                    : reviewModal.status === 'approved'
                    ? 'Approve & Reward'
                    : 'Reject Submission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}