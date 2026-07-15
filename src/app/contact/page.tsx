"use client";

import { safeTrackEvent } from "@/lib/analytics";

import { useState } from "react";
import QChan from "@/components/QChan";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            CONTACT US
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            聯絡 萌點3D
          </h1>
          <p className="text-sm text-brand-muted font-medium">
            如果有任何製作想法、合作機會或特殊批量代印需求，歡迎隨時聯絡我們。
          </p>
        </div>

        {/* Q-chan guidance */}
        <div className="max-w-3xl mx-auto">
          <QChan
            image="/assets/qchan/q_wave.gif"
            text={`有任何製作疑問，都可以在右側留言，或直接加入官方 LINE 諮詢喔🐾！我們的 3D處理人員會協助確認照片、檔案與製作細節，讓溝通更清楚也更安心。`}
            position="left"
          />
        </div>

        {/* Info & Form grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact Info (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-brand-dark pb-2 border-b border-brand-border/40 flex items-center gap-2">
                <span className="text-brand-orange">📞</span> 聯絡資訊
              </h2>
              
              <ul className="space-y-4 text-sm text-brand-muted font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange text-lg">💬</span>
                  <div className="space-y-0.5">
                    <p className="text-brand-dark font-bold">官方 LINE</p>
                    <a
                      href="https://line.me/ti/p/_GL-WZNcN_" onClick={() => safeTrackEvent("click_line", { source: "contact", page_path: "/contact" })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-orange transition-colors break-all"
                    >
                      https://line.me/ti/p/_GL-WZNcN_
                    </a>
                    <p className="text-[11px] text-brand-orange">（加入後傳送貼圖即可啟動一對一客服諮詢）</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange text-lg">📞</span>
                  <div className="space-y-0.5">
                    <p className="text-brand-dark font-bold">客服電話</p>
                    <a href="tel:0938017081" className="hover:text-brand-orange transition-colors">
                      0938017081
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange text-lg">✉</span>
                  <div className="space-y-0.5">
                    <p className="text-brand-dark font-bold">聯絡信箱</p>
                    <a href="mailto:yumancheng123@gmail.com" className="hover:text-brand-orange transition-colors">
                      yumancheng123@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange text-lg">📍</span>
                  <div className="space-y-0.5">
                    <p className="text-brand-dark font-bold">工作室地址</p>
                    <p>新北市土城區中央路四段51號</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-orange text-lg">🕒</span>
                  <div className="space-y-0.5">
                    <p className="text-brand-dark font-bold">營業時間</p>
                    <p>週一至週五 09:30 - 18:30</p>
                    <p>週六、週日及國定假日公休</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Note badge */}
            <div className="bg-brand-yellow-light/50 border border-brand-yellow/60 rounded-2xl p-4 text-xs font-semibold text-brand-dark leading-relaxed">
              🐾 Q醬貼心提醒：工作室因常有溶劑打磨粉塵，為維護安全「不開放無預約參觀」喔。若需前來討論檔案，請務必先在 LINE 上與我們預約時間，謝謝配合！
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-brand-dark pb-2 border-b border-brand-border/40 flex items-center gap-2">
                <span className="text-brand-orange">✉</span> 快速線上留言
              </h2>
              
              {submitted ? (
                <div className="p-8 text-center bg-brand-peach-light/40 border border-brand-peach rounded-2xl space-y-3">
                  <span className="text-4xl block">🎉</span>
                  <h3 className="text-base font-bold text-brand-dark">留言送出成功！</h3>
                  <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                    感謝您的來信。我們的小編與 Q醬 會在收到後的第一個工作日內回信給您！
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 px-5 py-2 text-xs font-bold text-white bg-brand-orange rounded-full hover:bg-brand-orange-hover"
                  >
                    再次留言
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="c-name" className="text-xs font-bold text-brand-dark">您的姓名 *</label>
                      <input
                        id="c-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="請填寫稱呼"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="c-email" className="text-xs font-bold text-brand-dark">電子信箱 *</label>
                      <input
                        id="c-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="請填寫收件信箱"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="c-msg" className="text-xs font-bold text-brand-dark">留言內容 *</label>
                    <textarea
                      id="c-msg"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="請填寫留言詳情，我們會盡快評估回覆您。"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm leading-relaxed"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-brand-orange text-white text-sm font-bold rounded-full hover:bg-brand-orange-hover shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      送出留言
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map Mock Section */}
        <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <span>📍</span> 工作室位置圖
          </h2>
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-brand-cream border border-brand-border/40 flex items-center justify-center">
            {/* SVG Interactive Map illustration */}
            <div className="absolute inset-0 bg-[#E5E3DF] p-4 flex flex-col justify-between">
              {/* Roads grid and markers */}
              <div className="w-full h-full relative opacity-85 select-none">
                <div className="absolute top-1/2 left-0 right-0 h-8 bg-white/95 border-y border-gray-300 transform -translate-y-1/2 flex items-center justify-center font-bold text-gray-500 text-xs tracking-widest">
                  中央路四段 (Zhongyang Road Sec. 4)
                </div>
                <div className="absolute left-1/3 top-0 bottom-0 w-8 bg-white/95 border-x border-gray-300 flex items-center justify-center font-bold text-gray-500 text-xs tracking-widest [writing-mode:vertical-lr]">
                  交通幹道
                </div>
                
                {/* Studio location marker */}
                <div className="absolute top-[10%] left-[45%] bg-amber-50 border-2 border-brand-orange/60 rounded-2xl p-4 shadow-lg text-center z-10 animate-float flex flex-col items-center">
                  <span className="text-2xl">🏢</span>
                  <p className="text-xs font-black text-brand-dark mt-1">萌點3D 工作室</p>
                  <p className="text-[10px] text-brand-orange font-bold">新北市土城區中央路四段51號</p>
                </div>
                
                <div className="absolute bottom-[10%] left-[10%] bg-white border border-gray-300 rounded-xl p-2.5 text-center text-xs">
                  <span className="text-base block">🚇</span>
                  <p className="font-extrabold text-gray-600">新北土城服務據點</p>
                  <p className="text-[10px] text-gray-400">請先透過 LINE 預約到訪時間</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
