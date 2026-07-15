"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QChan from "@/components/QChan";

const quickSteps = [
  {
    id: "01",
    title: "提供照片 / 想法",
    desc: "客戶提供照片、角色圖、寵物照、3D 檔案，或只有初步想法也可以。",
    gif: "/assets/qchan/q_upload.gif",
  },
  {
    id: "02",
    title: "需求評估與報價",
    desc: "我們會確認風格、尺寸、數量、製作難度與預估完成時間，並提供初步報價。",
    gif: "/assets/qchan/q_quote.gif",
  },
  {
    id: "03",
    title: "3D 建模與確認",
    desc: "進行 3D 建模後，提供正面、側面、背面與局部角度給客戶確認。",
    gif: "/assets/qchan/q_ok.gif",
  },
  {
    id: "04",
    title: "全彩石膏 3D 列印與後處理",
    desc: "確認後進入列印排程，使用全彩石膏粉末 3D 列印，並進行清粉、固化、乾燥與品檢。",
    gif: "/assets/qchan/q_making.gif",
  },
  {
    id: "05",
    title: "驗收、包裝與交付",
    desc: "出貨前提供成品照片給你驗收，確認後再安排包裝、寄送或自取。",
    gif: "/assets/qchan/q_ship.gif",
  },
];

const detailedSteps = [
  {
    id: "01",
    title: "提供照片或想法",
    gif: "/assets/qchan/q_upload.gif",
    clientTodo: "提供人物/寵物照片、角色設定圖、插畫、草圖、3D 檔，或只有想法、想做的感覺，先跟我們說都可以。",
    studioTodo: "收到後幫你看資料夠不夠、適不適合做成立體；缺角度會提醒你補拍。",
    note: "一開始不用準備得很完美，有照片或想法就能先聊，Q醬會陪你慢慢整理。",
  },
  {
    id: "02",
    title: "風格與尺寸確認",
    gif: "/assets/qchan/q_measure.gif",
    clientTodo: "選製作類型（Q版人物、寵物公仔、角色等）、想要的尺寸（6/8/10cm…）、可愛程度與大致風格。",
    studioTodo: "依照片與需求建議合適比例與呈現方式，告訴你哪種尺寸最適合這個造型。",
    note: "尺寸會影響細節與價格，這一步先把方向抓對，後面就順了。",
  },
  {
    id: "03",
    title: "初步估價與製作建議",
    gif: "/assets/qchan/q_calc.gif",
    clientTodo: "告訴我們預算、數量、交期，以及有沒有特別指定。",
    studioTodo: "提供初步報價，並說明哪些地方建議簡化或加厚，做成更耐放的造型。",
    note: "我們不只把圖變立體，而是會先判斷它能不能穩穩做出來，再給你實在的建議。",
  },
  {
    id: "04",
    title: "確認委託與付款",
    gif: "/assets/qchan/q_ok.gif",
    clientTodo: "確認報價、製作內容、修改規則、交期與付款方式。",
    studioTodo: "建立你的專屬小工單，安排建模與後續排程。",
    note: "確認後就正式進入萌點3D 的製作流程，Q醬要開始忙起來囉！",
  },
  {
    id: "05",
    title: "概念圖或風格圖確認",
    gif: "/assets/qchan/q_board.gif",
    clientTodo: "確認整體風格方向：髮型、表情、服裝、姿勢、色系、可愛程度。",
    studioTodo: "整理概念方向，必要時提供風格參考圖，先把「感覺」對齊。",
    note: "如果你只有想法、沒有完整圖片，這一步特別重要，能避免後面走歪路。",
  },
  {
    id: "06",
    title: "3D 建模與安全列印調整",
    gif: "/assets/qchan/q_complexity.gif",
    clientTodo: "等待建模，並補充必要的細節資料。",
    studioTodo: "把平面資料轉成 3D 模型，並針對頭髮、手指、眼鏡、耳環、衣服邊角、鞋子等容易斷裂的位置做安全加厚與列印優化。",
    note: "我們會盡量保留角色的可愛與辨識度，同時讓它「印得出來、收得住」——能穩穩做出來的，才是真正適合收藏的模型。",
  },
  {
    id: "07",
    title: "提供三視圖與局部角度核對",
    gif: "/assets/qchan/q_notice.gif",
    clientTodo: "查看正面、側面、背面與局部角度，確認整體比例與造型是否符合期待。",
    studioTodo: "提供模型預覽圖，讓你在列印前看清楚外觀。",
    note: "沒有確認，不會直接送印。這步請放心慢慢看，有任何疑慮都可以提出來。",
    highlightNote: true,
  },
  {
    id: "08",
    title: "客戶修改與最終確認",
    gif: "/assets/qchan/q_go.gif",
    clientTodo: "提出需要調整的地方，例如表情、髮型、服裝、姿勢、比例、顏色或細節。",
    studioTodo: "依可修改範圍協助調整，並在最終確認後鎖定版本。",
    note: "列印前是最適合調整的時機，確認後就會進入正式製作流程。",
  },
  {
    id: "09",
    title: "列印排程",
    gif: "/assets/qchan/q_days.gif",
    clientTodo: "確認交期與取件方式，耐心等我們安排。",
    studioTodo: "依尺寸、數量與工藝排進列印排程，並預估完成時間。",
    note: "排程會盡量配合你的交期；若有急件，也可以先問問能不能協助插單。",
  },
  {
    id: "10",
    title: "全彩石膏 3D 列印",
    gif: "/assets/qchan/q_making.gif",
    clientTodo: "這階段交給我們，安心等待就好。",
    studioTodo: "使用全彩石膏粉末 3D 列印設備製作，讓顏色與模型一起成形。",
    note: "不是先印白模再手工上色，而是色彩直接長在模型上，呈現柔和、溫暖、有紀念感的全彩效果。",
  },
  {
    id: "11",
    title: "後處理與品檢",
    gif: "/assets/qchan/q_qa.gif",
    clientTodo: "不用做什麼，這關我們幫你把關。",
    studioTodo: "進行清粉、固化、表面保護、乾燥，並做外觀、顏色與結構的嚴格品檢。",
    note: "這一關是讓作品能安心交到你手上的關鍵；有瑕疵我們會先擋下來，不會直接出貨。",
  },
  {
    id: "12",
    title: "拍照驗收、包裝與交付",
    gif: "/assets/qchan/q_ship.gif",
    clientTodo: "查看成品照片驗收，確認後選擇寄送或自取。",
    studioTodo: "提供成品照片、妥善包裝，並安排寄送。",
    note: "確認沒問題後，我們會把作品包好寄出，讓它安全抵達你的小角落！",
  },
];

const faqs = [
  {
    q: "我只有一張照片可以做嗎？",
    a: "可以先評估。正面照最基本，如果有側面、背面或服裝細節，成品會更接近期待。",
  },
  {
    q: "可以修改嗎？",
    a: "建模確認階段可以提出調整，像是表情、髮型、服裝、姿勢與比例。最終確認後就會進入列印排程，後續修改會比較困難。",
  },
  {
    q: "修改會另外收費嗎？",
    a: "建模確認階段會提供基本微調，例如表情、比例、髮型、服裝細節等。若屬於大幅變更，例如重新換姿勢、換整套服裝、重新設計角色，會再另外評估修改費用。",
  },
  {
    q: "為什麼有些地方要加厚？",
    a: "因為實體模型需要考慮強度。像手指、髮絲、眼鏡、耳環、衣服邊緣這些細節，如果太細，列印或運送時比較容易斷裂，所以會做安全列印調整。",
  },
  {
    q: "會先看到模型再列印嗎？",
    a: "會。建模後會提供正面、側面、背面與局部角度確認，沒有確認，不會直接送印。",
  },
  {
    q: "製作時間大約多久？",
    a: "一般會依建模難度、確認速度、尺寸、數量與排程安排。確認需求後，客服會提供預估完成時間。若有急件需求，也可以先詢問是否能協助安排。",
  },
];

export default function ProcessPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full py-12 md:py-20 bg-brand-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-24">
        
        {/* ================= 一、Hero 區 ================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <span className="text-xs sm:text-sm font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-4 py-1.5 rounded-full">
            WORKFLOW & PROCESS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-dark leading-tight max-w-3xl mx-auto">
            從一張照片，到可以放在手心裡的<br className="md:hidden" />
            <span className="text-brand-orange inline-block whitespace-nowrap">Q 版公仔</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-muted font-semibold leading-relaxed max-w-2xl mx-auto">
            萌點3D會陪你一步一步完成，從照片、想法、建模、確認，到全彩石膏 3D 列印與包裝交付，每個階段都會讓你清楚知道作品正在發生什麼事。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/calculator"
              className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md hover:scale-105 transition-all duration-300"
            >
              先試算價格
            </Link>
            <Link
              href="/inquiry"
              className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold text-brand-orange bg-brand-peach-light hover:bg-brand-peach/30 transition-all duration-300"
            >
              開始詢價
            </Link>
          </div>

          {/* Q醬提醒卡 */}
          <div className="pt-6 max-w-3xl mx-auto text-left">
            <QChan
              image="/assets/qchan/q_notice.gif"
              text="Q醬提醒：不用一開始就準備得很完美，只要有照片、想法或參考圖，我們就可以先協助你評估適合的製作方式。"
            />
          </div>
        </section>

        {/* ================= 二、上方快速版 5 步流程 ================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark">
              快速了解：製作 5 步驟
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium">
              簡單五個階段，把立體化公仔變簡單
            </p>
          </div>

          {/* 5步卡片流 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {quickSteps.map((step, idx) => {
              return (
                <div
                  key={step.id}
                  className="bg-white rounded-3xl border border-brand-border/60 p-6 flex flex-col items-center text-center relative shadow-sm hover:shadow-md transition-all duration-300 glass-hover"
                >
                  {/* 桌機版箭頭 */}
                  {idx < quickSteps.length - 1 && (
                    <div className="hidden md:block absolute top-[52px] -right-4 translate-x-1/2 z-10">
                      <svg
                        className="w-6 h-6 text-brand-peach"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}

                  {/* 數字與圓圈 */}
                  <span className="absolute top-4 left-4 text-xs font-black text-brand-peach-light bg-brand-peach px-2 py-0.5 rounded-full">
                    {step.id}
                  </span>

                  {/* GIF 圖貼 */}
                  <div className="w-16 h-16 relative bg-brand-peach-light/20 rounded-full overflow-hidden mb-4 border border-brand-peach/20 flex items-center justify-center p-1.5">
                    <Image
                      src={step.gif}
                      alt={step.title}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>

                  {/* 標題與說明 */}
                  <h3 className="text-sm sm:text-base font-extrabold text-brand-dark mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= 三、詳細版完整製作流程 9 步 ================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark">
              完整製作流程｜從照片確認到出貨交付
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium">
              每一步驟都帶你看得清清楚楚，是我們對品質的堅持
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {detailedSteps.map((step) => {
              return (
                <div
                  key={step.id}
                  className="bg-white rounded-3xl border border-brand-border/60 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6"
                >
                  {/* 步驟頭部 */}
                  <div className="flex flex-col md:flex-row items-center gap-6 pb-4 border-b border-brand-border/40">
                    {/* GIF */}
                    <div className="flex-shrink-0 w-20 h-20 relative bg-brand-peach-light/30 rounded-full overflow-hidden border border-brand-peach/30 flex items-center justify-center p-2">
                      <Image
                        src={step.gif}
                        alt={step.title}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>

                    {/* 標題與步驟編號 */}
                    <div className="text-center md:text-left flex-grow">
                      <span className="text-xs sm:text-sm font-black text-brand-orange tracking-widest uppercase">
                        STEP {step.id}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-brand-dark mt-1">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* 雙欄：客戶 vs 萌點3D */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 客戶要做什麼 */}
                    <div className="bg-brand-peach-light/40 border border-brand-peach/20 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2 text-brand-orange font-extrabold text-xs sm:text-sm">
                        <span>👤</span> 客戶需要做什麼
                      </div>
                      <p className="text-xs sm:text-sm text-brand-dark leading-relaxed font-semibold">
                        {step.clientTodo}
                      </p>
                    </div>

                    {/* 萌點3D會做什麼 */}
                    <div className="bg-brand-yellow-light border border-brand-yellow/30 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs sm:text-sm">
                        <span>🐾</span> 萌點3D會做什麼
                      </div>
                      <p className="text-xs sm:text-sm text-brand-dark leading-relaxed font-semibold">
                        {step.studioTodo}
                      </p>
                    </div>
                  </div>

                  {/* 說明文字（帶 Q醬 口吻的對話條） */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      step.highlightNote
                        ? "bg-rose-50 border-2 border-rose-200 text-rose-700 font-black flex items-center gap-2 animate-bubble"
                        : "bg-brand-cream border border-brand-border/60 text-brand-muted font-semibold"
                    }`}
                  >
                    {step.highlightNote && (
                      <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                    )}
                    <div>
                      {step.highlightNote ? (
                        <span>
                          <strong>沒有確認，不會直接送印。</strong>
                          {step.note.replace("沒有確認，不會直接送印。", "")}
                        </span>
                      ) : (
                        step.note
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= 四、常見安心問題 FAQ 區 ================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark">
              常見安心問題 FAQ
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium">
              解決你的小疑惑，讓我們更安心地踏出第一步🐾
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
            {/* 左側 FAQ 可愛引導卡 */}
            <div className="lg:col-span-1 flex flex-col items-center text-center bg-white rounded-3xl border border-brand-border/60 p-8 shadow-sm">
              <div className="w-28 h-28 relative mb-4">
                <Image
                  src="/assets/qchan/q_qa.gif"
                  alt="Q醬安心問答"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-black text-brand-dark">常見安心問題</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed font-semibold">
                Q醬幫你整理了大家最常問的問題，隨時點開解答，讓我們一起安心製作吧！🐾
              </p>
            </div>

            {/* 右側 FAQ 摺疊列表 */}
            <div className="lg:col-span-2 space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-brand-border/60 overflow-hidden shadow-sm transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-extrabold text-brand-dark hover:bg-brand-peach-light/20 transition-colors duration-300"
                    >
                      <span className="text-xs sm:text-sm flex items-center gap-2">
                        <span className="text-brand-orange font-black">Q{idx + 1}.</span>
                        {faq.q}
                      </span>
                      <span
                        className={`text-brand-orange text-xs transform transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? "max-h-[300px] border-t border-brand-border/40" : "max-h-0"
                      }`}
                    >
                      <p className="p-6 text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold bg-brand-yellow-light/20">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 五、頁面底部 CTA 區 ================= */}
        <section className="pb-8">
          <div className="bg-brand-peach-light/40 rounded-3xl border border-brand-peach/30 p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
            {/* Q醬揮手/謝謝插圖 */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 relative animate-float">
                <Image
                  src="/assets/qchan/q_wave.gif"
                  alt="Q醬歡迎你"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-brand-dark mb-4 leading-snug">
              每一件公仔，都是從一個想法開始。
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed max-w-2xl mx-auto mb-8 font-semibold">
              可能是一個人、一隻寵物、一段回憶，也可能是一個想被好好留下來的角色。
              <br />
              萌點3D會陪你把它從照片裡，慢慢變成可以放在手心裡的小小存在。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xs sm:max-w-none mx-auto">
              <Link
                href="/calculator"
                className="w-full sm:w-auto px-8 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md hover:scale-105 transition-all duration-300"
              >
                先試算價格
              </Link>
              <Link
                href="/inquiry"
                className="w-full sm:w-auto px-8 py-3 rounded-full text-xs sm:text-sm font-bold text-brand-orange bg-white border-2 border-brand-orange hover:bg-brand-peach-light/30 transition-all duration-300"
              >
                開始詢價
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
