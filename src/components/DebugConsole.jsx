import React, { useState, useEffect, useRef } from 'react';
import { BugIcon } from './icons';

// Komponen ini akan menjadi konsol debug kita yang lebih canggih
export const DebugConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(true); // Biarkan terbuka secara default untuk debugging
  const consoleEndRef = useRef(null);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const newLog = {
        type,
        // Ubah semua argumen menjadi string yang bisa dibaca
        message: args.map(arg => {
          try {
            if (arg instanceof Error) {
              return `Error: ${arg.message}\n${arg.stack}`;
            }
            if (typeof arg === 'object' && arg !== null) {
              // Format objek JSON dengan indentasi agar mudah dibaca
              return JSON.stringify(arg, null, 2);
            }
            return String(arg);
          } catch (e) {
            return "[[Circular Reference atau Objek Tidak Valid]]";
          }
        }).join(' '),
        time: new Date().toLocaleTimeString('en-GB'), // Format 24 jam
      };
      setLogs(prevLogs => [...prevLogs, newLog]);
    };

    console.log = (...args) => { originalLog.apply(console, args); addLog('log', args); };
    console.error = (...args) => { originalError.apply(console, args); addLog('error', args); };
    console.warn = (...args) => { originalWarn.apply(console, args); addLog('warn', args); };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const getLogStyle = (type) => {
    switch (type) {
      case 'error': return { bg: 'bg-red-900 bg-opacity-30', text: 'text-red-400', border: 'border-red-500' };
      case 'warn': return { bg: 'bg-yellow-900 bg-opacity-30', text: 'text-yellow-400', border: 'border-yellow-500' };
      default: return { bg: 'bg-gray-800', text: 'text-gray-200', border: 'border-gray-700' };
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-600" aria-label="Toggle Debug Console">
        <BugIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-20 md:left-4 z-40 w-full h-full md:w-[450px] md:h-2/3 bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-lg flex flex-col font-mono text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
            <h3 className="font-bold text-white">Debug Console</h3>
            <div>
              <button onClick={() => setLogs([])} className="text-gray-400 hover:text-white mr-4 text-xs">Clear</button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
            </div>
          </div>
          <div className="flex-grow p-2 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Menunggu log...</p>
            ) : (
              logs.map((log, index) => {
                const style = getLogStyle(log.type);
                return (
                  <div key={index} className={`p-2 rounded-md mb-2 border ${style.bg} ${style.border}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold uppercase ${style.text}`}>{log.type}</span>
                      <span className="text-gray-500 text-xs">{log.time}</span>
                    </div>
                    <pre className={`whitespace-pre-wrap w-full text-left ${style.text}`}>{log.message}</pre>
                  </div>
                );
              })
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}
    </>
  );
};
