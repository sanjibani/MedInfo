import React, { useState, useRef, useEffect } from 'react';

function ChatInterface({ medicineData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMessage = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat-medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    medicineContext: medicineData
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            setMessages(prev => [...prev, data]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full mt-4 py-3 px-4 glass rounded-xl flex items-center justify-center gap-2 text-white/90 font-medium hover:bg-white/10 transition-colors"
                aria-label="Ask AI about this medicine"
            >
                <span className="text-xl">💬</span>
                Ask AI about this medicine
            </button>
        );
    }

    return (
        <div className="w-full mt-4 glass rounded-xl overflow-hidden flex flex-col animate-fade-in border border-white/20">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <span className="font-medium text-sm text-white/90">Medical Assistant</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close chat"
                >
                    <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="h-64 overflow-y-auto p-4 space-y-4 bg-black/20">
                {messages.length === 0 && (
                    <div className="text-center text-white/50 text-xs mt-4">
                        <p>Ask about dosage, side effects, or interactions.</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {['Is it safe for kids?', 'Side effects?', 'When to take?'].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setInputText(q)}
                                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-sm'
                                    : 'bg-white/10 text-white/90 rounded-bl-sm backdrop-blur-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-2 bg-white/5 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a question..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary-500/50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2 bg-primary-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                    aria-label="Send message"
                >
                    <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default ChatInterface;
