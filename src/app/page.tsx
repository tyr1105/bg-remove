"use client";

import { useState, useCallback, useRef } from "react";
import {
  removeBackground,
  removeForeground,
  type Config,
} from "@imgly/background-removal";

type ProcessingMode = "background" | "foreground";

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: "",
  });
  const [mode, setMode] = useState<ProcessingMode>("background");
  const [dragOver, setDragOver] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("请上传图片文件 / Please upload an image file");
        return;
      }

      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setProcessedImage(null);
      setProcessing({ isProcessing: true, progress: 0, stage: "加载AI模型..." });

      try {
        const config: Config = {
          progress: (key: string, current: number, total: number) => {
            const pct = Math.round((current / total) * 100);
            const stages: Record<string, string> = {
              "compute:inference": "AI推理中...",
              "fetch:model": "下载AI模型...",
            };
            setProcessing({
              isProcessing: true,
              progress: pct,
              stage: stages[key] || key,
            });
          },
          output: {
            format: "image/png",
            quality: 0.9,
          },
        };

        let result: Blob;
        if (mode === "foreground") {
          result = await removeForeground(url, config);
        } else {
          result = await removeBackground(url, config);
        }

        const processedUrl = URL.createObjectURL(result);
        setProcessedImage(processedUrl);
      } catch (error) {
        console.error("处理失败:", error);
        alert("处理失败，请重试 / Processing failed, please try again");
      } finally {
        setProcessing({ isProcessing: false, progress: 0, stage: "" });
      }
    },
    [mode]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDownload = useCallback(() => {
    if (!processedImage) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bg-removed-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = processedImage;
  }, [processedImage, bgColor]);

  const handleReset = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (processedImage) URL.revokeObjectURL(processedImage);
    setOriginalImage(null);
    setProcessedImage(null);
    setProcessing({ isProcessing: false, progress: 0, stage: "" });
  }, [originalImage, processedImage]);

  const bgColors = [
    { label: "透明", value: "transparent", preview: "checkerboard" },
    { label: "白色", value: "#ffffff", preview: "#ffffff" },
    { label: "黑色", value: "#000000", preview: "#000000" },
    { label: "红色", value: "#ff4444", preview: "#ff4444" },
    { label: "蓝色", value: "#4488ff", preview: "#4488ff" },
    { label: "绿色", value: "#44cc88", preview: "#44cc88" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              ✂️
            </div>
            <div>
              <h1 className="text-xl font-bold">RemoveBG</h1>
              <p className="text-xs text-white/50">AI智能抠图 · 100%隐私保护</p>
            </div>
          </div>
          <a
            href="https://github.com/tyr1105/bg-remove"
            target="_blank"
            className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!originalImage && (
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Background Remover
            </h2>
            <p className="text-xl text-white/70 mb-2">
              免费在线AI智能抠图 · 秒级处理 · 无需注册
            </p>
            <p className="text-sm text-white/40">
              100% 浏览器本地处理 · 您的照片不会上传到任何服务器
            </p>
          </div>
        )}

        {/* Upload Area */}
        {!originalImage ? (
          <div
            className={`max-w-2xl mx-auto border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
              dragOver
                ? "border-purple-400 bg-purple-500/20 scale-105"
                : "border-white/20 hover:border-purple-400/50 hover:bg-white/5"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-xl mb-2">拖拽图片到这里，或点击上传</p>
            <p className="text-white/40 text-sm">
              Drop image here, or click to upload
            </p>
            <p className="text-white/30 text-xs mt-2">
              支持 PNG, JPG, WEBP · 最大 20MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        ) : (
          /* Processing / Result Area */
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Mode Toggle */}
                <div className="flex bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setMode("background")}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      mode === "background"
                        ? "bg-purple-500 text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    去除背景
                  </button>
                  <button
                    onClick={() => setMode("foreground")}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      mode === "foreground"
                        ? "bg-purple-500 text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    去除前景
                  </button>
                </div>

                {/* Background Color Selector */}
                {processedImage && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">背景色:</span>
                    <div className="flex gap-1">
                      {bgColors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setBgColor(c.value)}
                          className={`w-7 h-7 rounded-lg border-2 transition-all ${
                            bgColor === c.value
                              ? "border-purple-400 scale-110"
                              : "border-white/20"
                          }`}
                          style={{
                            background:
                              c.preview === "checkerboard"
                                ? "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                                : c.preview,
                          }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {processedImage && (
                  <>
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition-all"
                    >
                      {showComparison ? "隐藏对比" : "对比原图"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm font-medium transition-all shadow-lg shadow-purple-500/25"
                    >
                      ⬇️ 下载 PNG
                    </button>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-sm transition-all"
                >
                  ✕ 重新上传
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {processing.isProcessing && (
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/70">
                    {processing.stage}
                  </span>
                  <span className="text-sm text-purple-400">
                    {processing.progress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${processing.progress}%` }}
                  />
                </div>
                <p className="text-xs text-white/30 mt-2">
                  首次使用需要下载AI模型（约30MB），之后会自动缓存
                </p>
              </div>
            )}

            {/* Image Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              {(showComparison || !processedImage) && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">
                    原图 Original
                  </p>
                  <div className="relative rounded-xl overflow-hidden bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Processed */}
              {processedImage && (
                <div
                  className={`bg-white/5 rounded-2xl p-4 ${
                    !showComparison ? "md:col-span-2" : ""
                  }`}
                >
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">
                    处理结果 Result
                  </p>
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      background:
                        bgColor === "transparent"
                          ? "repeating-conic-gradient(#404040 0% 25%, #606060 0% 50%) 50% / 20px 20px"
                          : bgColor,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Section (only show when no image) */}
        {!originalImage && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-10">
              为什么选择 RemoveBG？
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🔒",
                  title: "100% 隐私保护",
                  desc: "所有处理在您的浏览器本地完成，图片不会上传到任何服务器",
                },
                {
                  icon: "⚡",
                  title: "秒级处理速度",
                  desc: "AI模型直接在浏览器中运行，处理速度取决于您的设备性能",
                },
                {
                  icon: "💰",
                  title: "完全免费使用",
                  desc: "无需注册，无需付费，不限次数，永久免费",
                },
                {
                  icon: "🎯",
                  title: "AI智能识别",
                  desc: "先进的AI模型精确识别人物、物体边缘，完美抠图",
                },
                {
                  icon: "🎨",
                  title: "自定义背景",
                  desc: "透明、纯色背景随意切换，满足各种使用场景",
                },
                {
                  icon: "📱",
                  title: "全平台支持",
                  desc: "电脑、手机、平板都能用，随时随地抠图",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h4 className="font-bold mb-2">{f.title}</h4>
                  <p className="text-white/50 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use Cases */}
        {!originalImage && (
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">适用场景</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "证件照制作",
                "电商商品图",
                "社交媒体头像",
                "PPT素材",
                "设计项目",
                "名片制作",
                "简历照片",
                "表情包制作",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white/5 rounded-full text-sm text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-white/30">
          <p>© 2024 RemoveBG · Made with ❤️</p>
          <div className="flex gap-4">
            <a href="https://tyr1105.github.io/" className="hover:text-white/60">
              🧰 万能工具箱
            </a>
            <a
              href="https://github.com/tyr1105/bg-remove"
              className="hover:text-white/60"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
