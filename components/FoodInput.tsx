import React, { useState, useRef, useEffect } from 'react';
import { InputMethod } from '../types';
import { Camera, Mic, Type, Upload, X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface FoodInputProps {
  onAnalyze: (method: InputMethod, data: string) => void;
  isAnalyzing: boolean;
}

const FoodInput: React.FC<FoodInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [activeTab, setActiveTab] = useState<InputMethod>(InputMethod.Text);
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Voice Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    let data = '';
    if (activeTab === InputMethod.Image) {
      if (!imagePreview) return;
      data = imagePreview;
    } else {
      if (!inputText.trim()) return;
      data = inputText;
    }
    onAnalyze(activeTab, data);
  };

  const hasData = (activeTab === InputMethod.Image && imagePreview) || (activeTab !== InputMethod.Image && inputText.length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">What's on your plate?</h2>
        <p className="text-slate-500 mt-2">Choose how you want to log your meal.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Modern Segmented Control */}
        <div className="p-2 bg-slate-50 m-2 rounded-xl flex">
          {[
            { id: InputMethod.Text, icon: Type, label: 'Type' },
            { id: InputMethod.Voice, icon: Mic, label: 'Speak' },
            { id: InputMethod.Image, icon: Camera, label: 'Scan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 min-h-[320px] flex flex-col items-center justify-center">
          
          {/* Text Input */}
          {activeTab === InputMethod.Text && (
            <div className="w-full h-full flex flex-col">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., A medium bowl of Chicken Biryani with raita..."
                className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-lg text-slate-800 placeholder:text-slate-400 resize-none min-h-[200px]"
              />
            </div>
          )}

          {/* Voice Input */}
          {activeTab === InputMethod.Voice && (
            <div className="w-full flex flex-col items-center justify-center space-y-8 py-8">
              <button
                onClick={toggleListening}
                className={`relative group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></span>
                )}
                <Mic className={`w-12 h-12 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
              
              <div className="text-center space-y-2 max-w-md">
                <p className="font-medium text-slate-900 text-lg">
                  {isListening ? 'Listening...' : 'Tap microphone to start'}
                </p>
                {inputText && (
                  <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 text-slate-700 italic">
                    "{inputText}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Input */}
          {activeTab === InputMethod.Image && (
            <div className="w-full h-full">
              {!isCameraActive && !imagePreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[250px]">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-sky-500 hover:bg-sky-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="font-semibold text-slate-700">Open Camera</span>
                    <span className="text-xs text-slate-400 mt-1">Take a photo of your meal</span>
                  </button>
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-sky-500 hover:bg-sky-50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-sky-600" />
                    </div>
                    <span className="font-semibold text-slate-700">Upload Image</span>
                    <span className="text-xs text-slate-400 mt-1">Select from gallery</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}

              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-[400px] object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center">
                    <button
                      onClick={stopCamera}
                      className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <button
                      onClick={captureImage}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition border-4 border-slate-200/50"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-slate-900" />
                    </button>
                  </div>
                </div>
              )}

              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden shadow-md group">
                  <img src={imagePreview} alt="Preview" className="w-full h-[400px] object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setImagePreview(null)}
                      className="bg-white px-4 py-2 rounded-lg font-medium text-slate-900 shadow-lg hover:bg-slate-50"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || !hasData}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg ${
            isAnalyzing || !hasData
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300 hover:shadow-xl active:scale-[0.99]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-sky-300" />
              <span>Analyze Nutrition</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodInput;
