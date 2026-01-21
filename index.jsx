import React, { useState } from 'react';
import { Brain, User, Phone, Building2, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const AkinatorGame = () => {
  const [stage, setStage] = useState('info');
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', institution: '' });
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState({
    question: '',
    step: 0,
    progression: 0,
    finished: false,
    win: false,
    guess: null,
    finalMessage: null,
    photo: null,
    akinatorName: null,
    description: null,
    akitudeUrl: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startGame = async () => {
    if (!userInfo.name || !userInfo.phone || !userInfo.institution) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userInfo,
          language: 'en',
          theme: 'c'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.session_id);
        setGameState({
          question: data.question,
          step: data.step,
          progression: data.progression,
          finished: false,
          win: false,
          guess: null,
          akitudeUrl: data.akitude_url
        });
        setStage('game');
      } else {
        setError(data.error || 'Failed to start game');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async (answer) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answer })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGameState({
          question: data.question,
          step: data.step,
          progression: data.progression,
          finished: data.finished,
          win: data.win,
          guess: data.guess || null,
          finalMessage: data.final_message || null,
          photo: data.photo || null,
          akinatorName: data.name || null,
          description: data.description || null,
          akitudeUrl: data.akitude_url
        });
      } else {
        setError(data.error || 'Failed to submit answer');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const goBack = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/back`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          question: data.question,
          step: data.step,
          progression: data.progression,
          win: false,
          guess: null,
          akitudeUrl: data.akitude_url
        }));
      } else {
        setError(data.error || "Can't go back any further!");
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const restartGame = async () => {
    if (sessionId) {
      await fetch(`${API_BASE}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
    }
    setStage('info');
    setSessionId(null);
    setUserInfo({ name: '', phone: '', institution: '' });
    setGameState({
      question: '',
      step: 0,
      progression: 0,
      finished: false,
      win: false,
      guess: null
    });
    setError(null);
  };

  if (stage === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
              <Brain className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Akinator</h1>
            <p className="text-gray-500">Think of a character, I'll guess it!</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Name
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                Institution
              </label>
              <input
                type="text"
                value={userInfo.institution}
                onChange={(e) => setUserInfo({ ...userInfo, institution: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="School/College name"
              />
            </div>

            <button
              onClick={startGame}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {gameState.win ? "I Found It!" : "You Won!"}
            </h2>
          </div>

          {gameState.photo && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
              <img
                src={gameState.photo}
                alt={gameState.akinatorName}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {gameState.akinatorName && (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{gameState.akinatorName}</h3>
                  <p className="text-gray-600 mb-3">{gameState.description}</p>
                </>
              )}
            </div>
          )}

          <p className="text-gray-600 mb-6 whitespace-pre-line">{gameState.finalMessage}</p>

          <button
            onClick={restartGame}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState.guess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full">
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">I think I found it!</h2>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 text-center">
            {gameState.guess.photo && (
              <img
                src={gameState.guess.photo}
                alt={gameState.guess.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{gameState.guess.name}</h3>
            <p className="text-gray-600">{gameState.guess.description}</p>
          </div>

          <p className="text-center text-gray-700 mb-6 text-lg">Is this your character?</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => sendAnswer('y')}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50"
            >
              ✓ Yes
            </button>
            <button
              onClick={() => sendAnswer('n')}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50"
            >
              ✗ No
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Hey {userInfo.name}!</h2>
              <p className="text-sm text-gray-500">Question {gameState.step + 1}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{userInfo.institution}</div>
            <div className="text-lg font-bold text-indigo-600">{Math.round(gameState.progression)}%</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
              style={{ width: `${gameState.progression}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-6">
            <p className="text-2xl font-semibold text-gray-800 text-center">
              {gameState.question}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => sendAnswer('y')}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
            >
              ✓ Yes
            </button>
            <button
              onClick={() => sendAnswer('n')}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
            >
              ✗ No
            </button>
            <button
              onClick={() => sendAnswer('i')}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
            >
              ? Don't Know
            </button>
            <button
              onClick={() => sendAnswer('p')}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
            >
              Probably
            </button>
            <button
              onClick={() => sendAnswer('pn')}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
            >
              Probably Not
            </button>
            <button
              onClick={goBack}
              disabled={loading || gameState.step === 0}
              className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AkinatorGame;