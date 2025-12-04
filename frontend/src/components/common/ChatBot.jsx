import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Minimize2, Sparkles, CalendarCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "¡Hola! Soy ChrisBot 🤖. ¿Buscas una sala para tu reunión? Dime cuántas personas son y te ayudaré a reservarla.", 
            sender: 'bot',
            action: null 
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate(); 

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userText = inputText; // Guardamos el texto antes de borrarlo
        const userMsg = { id: Date.now(), text: userText, sender: 'user' };
        
        // Actualizamos UI inmediatamente
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsLoading(true);

        try {
            // --- PREPARAR HISTORIAL PARA LA IA ---
            // Convertimos los mensajes de React al formato que espera Gemini (role: user/model)
            // Excluimos el mensaje de bienvenida y el actual que vamos a enviar aparte
            const historyPayload = messages.slice(1).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [msg.text] // Gemini espera una lista de partes o un string simple en versiones nuevas, usaremos lista por seguridad
            }));

            const response = await fetch('http://127.0.0.1:8000/api/chatbot/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userText,      // El mensaje nuevo
                    history: historyPayload // La memoria de la conversación
                })
            });

            if (!response.ok) throw new Error("Error en la red");

            const data = await response.json(); 

            const botMsg = { 
                id: Date.now() + 1, 
                text: data.respuesta, 
                sender: 'bot',
                action: data.intencion === 'RESERVAR' ? data.id_sala : null
            };
            
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Error chatbot:", error);
            setMessages(prev => [...prev, { id: Date.now(), text: "Me desconecté un momento. ¿Podrías repetirlo?", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionClick = (salaId) => {
        setIsOpen(false);
        navigate(`/salas/${salaId}`);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            
            {isOpen && (
                <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full relative">
                                <Bot className="w-6 h-6" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-1">ChrisBot AI <Sparkles className="w-3 h-3 text-yellow-300"/></h3>
                                <span className="text-xs text-indigo-200">Agente de Reservas</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition"><Minimize2 className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 scroll-smooth custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                    msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                                {msg.action && (
                                    <button onClick={() => handleActionClick(msg.action)} className="mt-2 ml-1 bg-green-100 text-green-800 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center hover:bg-green-200 transition transform hover:scale-105 border border-green-200 shadow-sm cursor-pointer group">
                                        <CalendarCheck className="w-4 h-4 mr-2 group-hover:text-green-900"/> Ir a Reservar <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform"/>
                                    </button>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-2 text-gray-400 text-sm shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> <span className="text-xs font-medium">Pensando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Escribe tu consulta..." className="flex-1 bg-gray-100 text-gray-700 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder-gray-400"/>
                        <button type="submit" disabled={isLoading || !inputText.trim()} className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex-shrink-0"><Send className="w-5 h-5" /></button>
                    </form>
                </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className={`p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white ${isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
            </button>
        </div>
    );
};

export default ChatBot;