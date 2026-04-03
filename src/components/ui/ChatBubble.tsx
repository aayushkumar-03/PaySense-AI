import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'typing';
  content?: string;
  timestamp?: string;
  metadata?: any;
}

export const ChatBubble = ({ role, content, timestamp, metadata }: ChatBubbleProps) => {
  const isUser = role === 'user';
  const isTyping = role === 'typing';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 group relative`}
    >
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse max-w-[75%]' : 'flex-row'} items-end gap-3`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-xs font-bold">P</span>
          </div>
        )}
        
        <div className="flex flex-col">
          <div 
            className={`
              px-4 py-2.5 rounded-2xl
              ${isUser 
                ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white rounded-br-sm' 
                : 'bg-[#1F2937] border border-white/8 text-white rounded-bl-sm'}
            `}
          >
            {isTyping ? (
              <div className="flex space-x-1 items-center h-5 px-1 py-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{content || ''}</ReactMarkdown>
              </div>
            )}
          </div>
          
          {timestamp && !isTyping && (
            <span className={`text-[11px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-right pr-1' : 'text-left pl-1'}`}>
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
