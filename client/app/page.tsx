'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [view, setView] = useState<'login' | 'register' | 'notes' | 'admin' | 'aggregations'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [interestsInput, setInterestsInput] = useState('chess, reading');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Notes states
  const [notes, setNotes] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [notePage, setNotePage] = useState(1);
  const [noteTotalPages, setNoteTotalPages] = useState(1);

  // Admin states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminNotes, setAdminNotes] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'users' | 'notes'>('users');

  // Aggregation states
  const [groupedInterests, setGroupedInterests] = useState<any[]>([]);
  const [testUsers, setTestUsers] = useState<any[]>([]);
  const [selectedUserIdForLookup, setSelectedUserIdForLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('notes');
    }
  }, []);

  useEffect(() => {
    if (token && view === 'notes') {
      fetchNotes();
    } else if (token && view === 'admin') {
      if (adminTab === 'users') fetchAdminUsers();
      else fetchAdminNotes();
    } else if (view === 'aggregations') {
      fetchInterestsAggregation();
      fetchTestUsers();
    }
  }, [token, view, notePage, adminTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setView('notes');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const interests = interestsInput.split(',').map((s) => s.trim()).filter(Boolean);
      await api.post('/auth/register', { username, email, password, role, interests });
      setSuccess('Registration successful! Please login.');
      setView('login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('login');
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes?page=${notePage}&limit=5`);
      setNotes(res.data.notes);
      setNoteTotalPages(res.data.totalPages);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNoteId) {
        await api.put(`/notes/${editingNoteId}`, { title: noteTitle, content: noteContent });
        setEditingNoteId(null);
      } else {
        await api.post('/notes', { title: noteTitle, content: noteContent });
      }
      setNoteTitle('');
      setNoteContent('');
      fetchNotes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save note');
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note._id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete note');
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setAdminUsers(res.data.users);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchAdminNotes = async () => {
    try {
      const res = await api.get('/admin/notes');
      setAdminNotes(res.data.notes);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete user and their notes?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAdminUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const fetchInterestsAggregation = async () => {
    try {
      const res = await api.get('/aggregations/interests');
      setGroupedInterests(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTestUsers = async () => {
    try {
      const res = await api.get('/aggregations/users-list');
      setTestUsers(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLookupPosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdForLookup) return;
    try {
      const res = await api.get(`/aggregations/user-posts/${selectedUserIdForLookup}`);
      setLookupResult(res.data);
    } catch (err: any) {
      setLookupResult(null);
      alert(err.response?.data?.error || 'User not found');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/aggregations/posts', { title: postTitle, content: postContent });
      setPostTitle('');
      setPostContent('');
      alert('Post created successfully!');
      fetchTestUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">Secure Note-Taking & RBAC Platform</h1>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                {user?.username} ({user?.role})
              </span>
              <button
                onClick={() => setView('notes')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'notes' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                My Notes
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setView('admin')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => setView('aggregations')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'aggregations' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Aggregations
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView('login')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Login
              </button>
              <button
                onClick={() => setView('register')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Register
              </button>
              <button
                onClick={() => setView('aggregations')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'aggregations' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Aggregations
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}

        {/* LOGIN VIEW */}
        {!token && view === 'login' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow border border-gray-200 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700">
                Login
              </button>
            </form>
          </div>
        )}

        {/* REGISTER VIEW */}
        {!token && view === 'register' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow border border-gray-200 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Interests (comma separated)</label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700">
                Register
              </button>
            </form>
          </div>
        )}

        {/* NOTES VIEW */}
        {token && view === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 md:col-span-1 h-fit">
              <h3 className="text-lg font-bold mb-4 text-gray-900">{editingNoteId ? 'Edit Note' : 'Create Note'}</h3>
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    required
                    className="mt-1 w-full p-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    required
                    rows={4}
                    className="mt-1 w-full p-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700">
                    {editingNoteId ? 'Update Note' : 'Add Note'}
                  </button>
                  {editingNoteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteTitle('');
                        setNoteContent('');
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 md:col-span-2">
              <h3 className="text-lg font-bold mb-4 text-gray-900">My Notes</h3>
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm">No notes found.</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{note.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{note.content}</p>
                        <span className="text-xs text-gray-400 mt-2 block">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded hover:bg-yellow-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Pagination */}
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={notePage <= 1}
                      onClick={() => setNotePage(notePage - 1)}
                      className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {notePage} of {noteTotalPages || 1}
                    </span>
                    <button
                      disabled={notePage >= noteTotalPages}
                      onClick={() => setNotePage(notePage + 1)}
                      className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {token && view === 'admin' && user?.role === 'admin' && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              <button
                onClick={() => setAdminTab('users')}
                className={`font-medium pb-2 ${adminTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              >
                User Management
              </button>
              <button
                onClick={() => setAdminTab('notes')}
                className={`font-medium pb-2 ${adminTab === 'notes' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              >
                All System Notes
              </button>
            </div>

            {adminTab === 'users' ? (
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">All Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="p-3 text-sm font-semibold text-gray-700">Username</th>
                        <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
                        <th className="p-3 text-sm font-semibold text-gray-700">Role</th>
                        <th className="p-3 text-sm font-semibold text-gray-700">Interests</th>
                        <th className="p-3 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100">
                          <td className="p-3 text-sm text-gray-800">{u.username}</td>
                          <td className="p-3 text-sm text-gray-600">{u.email}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{u.interests?.join(', ')}</td>
                          <td className="p-3 text-sm">
                            {u._id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">All System Notes</h3>
                <div className="space-y-4">
                  {adminNotes.map((note) => (
                    <div key={note._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between">
                        <h4 className="font-semibold text-gray-900">{note.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          Author: {note.userId?.username} ({note.userId?.email})
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AGGREGATIONS VIEW */}
        {view === 'aggregations' && (
          <div className="space-y-8">
            {/* Scenario 1: Group by Interests */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Aggregation Scenario 1: Group Users by Interests</h3>
              <p className="text-sm text-gray-600 mb-4">Uses exactly one `collection.aggregate()` pipeline call on User collection.</p>
              <button
                onClick={fetchInterestsAggregation}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 mb-4"
              >
                Load Grouped Interests
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedInterests.map((item: any) => (
                  <div key={item._id} className="p-4 border border-gray-200 rounded bg-gray-50">
                    <h4 className="font-bold text-indigo-600 capitalize text-lg mb-2">Interest: {item._id} ({item.count} users)</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {item.users.map((u: any, idx: number) => (
                        <li key={idx}>
                          {u.username} ({u.email}) - ID: {u.id}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario 2: User Posts ($lookup) */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Aggregation Scenario 2: User Posts ($lookup)</h3>
              <p className="text-sm text-gray-600 mb-4">Retrieve posts belonging to a particular user using a single aggregation pipeline with a `$lookup` stage.</p>

              {token && (
                <div className="mb-6 p-4 border border-indigo-100 rounded bg-indigo-50">
                  <h4 className="font-semibold text-indigo-900 mb-2">Create a Test Post</h4>
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Post Title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                    />
                    <textarea
                      placeholder="Post Content"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      required
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Submit Post
                    </button>
                  </form>
                </div>
              )}

              {/* Quick reference list of test users */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick User Reference (Click any user to test lookup):
                </label>
                <div className="flex flex-wrap gap-2">
                  {testUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => {
                        setSelectedUserIdForLookup(u._id);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-xs rounded border border-gray-200 text-gray-700 transition-colors"
                    >
                      {u.username} ({u.email})
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLookupPosts} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter User ID (ObjectId) OR Username OR Email"
                  value={selectedUserIdForLookup}
                  onChange={(e) => setSelectedUserIdForLookup(e.target.value)}
                  required
                  className="flex-1 p-2 border border-gray-300 rounded text-sm text-black"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700">
                  Lookup Posts ($lookup)
                </button>
              </form>

              {lookupResult && (
                <div className="p-4 border border-gray-200 rounded bg-gray-50">
                  <h4 className="font-bold text-gray-900">User: {lookupResult.username} ({lookupResult.email})</h4>
                  <p className="text-xs text-gray-500 mb-3">Role: {lookupResult.role} | ID: {lookupResult._id}</p>
                  <h5 className="font-semibold text-gray-800 mb-2">Posts via $lookup:</h5>
                  {lookupResult.posts?.length === 0 ? (
                    <p className="text-sm text-gray-500">No posts found for this user.</p>
                  ) : (
                    <div className="space-y-2">
                      {lookupResult.posts?.map((p: any) => (
                        <div key={p._id} className="p-3 bg-white border border-gray-200 rounded">
                          <h6 className="font-semibold text-gray-800">{p.title}</h6>
                          <p className="text-sm text-gray-600">{p.content}</p>
                          <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
