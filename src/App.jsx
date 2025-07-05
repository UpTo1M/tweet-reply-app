import { useState, useEffect } from 'react';

function App() {
  const [tweet, setTweet] = useState('');
  const [tone, setTone] = useState('');
  const [language, setLanguage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedReply = localStorage.getItem('latestReply');
    if (savedReply) {
      setReply(savedReply);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReply('');

    const prompt = `Buatkan balasan untuk tweet berikut dengan gaya ${tone} dalam bahasa ${language === 'id' ? 'Indonesia' : 'Inggris'}:\n\n"${tweet}"`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const aiReply = data.choices?.[0]?.message?.content;
      const finalReply = aiReply || 'Gagal mendapatkan balasan.';

      setReply(finalReply);
      localStorage.setItem('latestReply', finalReply);
    } catch (err) {
      console.error(err);
      setReply('Terjadi kesalahan saat menghubungi AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded"
          >
            Toggle Dark Mode
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">Tweet Reply Generator</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            placeholder="Paste tweet di sini..."
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            className="w-full p-3 border rounded-md resize-none h-32 text-black"
          />

          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <select
              className="flex-1 p-2 border rounded-md text-black"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="">Pilih gaya balasan</option>
              <option value="sopan">Sopan</option>
              <option value="lucu">Lucu</option>
              <option value="profesional">Profesional</option>
            </select>

            <select
              className="flex-1 p-2 border rounded-md text-black"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">Pilih bahasa</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">Bahasa Inggris</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Menghasilkan...' : 'Generate Reply'}
          </button>
        </form>

        <div className="mt-6">
          <p className="font-medium">Hasil Reply:</p>
          <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-700 min-h-[80px] whitespace-pre-line">
            {reply || 'Belum ada hasil.'}
          </div>

          {reply && (
            <button
              onClick={handleCopy}
              className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              {copied ? 'Disalin!' : 'Copy Reply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;