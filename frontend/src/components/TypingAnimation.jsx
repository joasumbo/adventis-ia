function TypingAnimation() {
  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="max-w-[75%]">
        <div className="flex items-center space-x-2 mb-1">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Igreja_Adventista_Dia.svg/500px-Igreja_Adventista_Dia.svg.png"
            alt="AI"
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs font-medium text-gray-600">Adventis IA</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingAnimation;