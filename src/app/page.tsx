import Link from "next/link";
import Image from "next/image";
import QChan from "@/components/QChan";

const servicesList = [
  {
    title: "Q版人像公仔",
    desc: "為自己、家人或朋友製作獨一無二的 Q 版實體公仔，送禮或紀念的最佳選擇！",
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    bg: "bg-brand-peach-light",
  },
  {
    title: "寵物公仔",
    desc: "將心愛的毛孩實體化！捕捉寵物的神態與毛流，留下永久保存的珍貴紀念。",
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    bg: "bg-brand-yellow-light",
  },
  {
    title: "角色/AI圖轉公仔",
    desc: "原創人設、插畫或 AI 生成的 2D 圖片，我們都能以專業建模技術，將其轉化為栩栩如生的 3D 實體模型！",
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    bg: "bg-orange-50",
  },
  {
    title: "企業展示樣品",
    desc: "客製化吉祥物、產品原型或展覽模型，呈現品牌特色，助力商務展示。",
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    bg: "bg-brand-peach-light/40",
  },
  {
    title: "大量列印服務",
    desc: "工廠級 3D 列印機隊，支援小規模或大批量快速生產，交期準時。",
    icon: (
        <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 14v6m-3-3h6M6 10h2m-2 4h2m-2 4h2m10-14L5 21" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
    bg: "bg-brand-yellow-light/40",
  },
  {
    title: "文創模型",
    desc: "地方文創、桌遊配件、IP 商品化與活動紀念品，從設計圖到實體模型，小量到批量皆可承接。",
    icon: (
      <svg className="w-8 h-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    bg: "bg-emerald-50",
  },
];

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-brand-yellow-light via-brand-cream to-white">
        {/* Background blobs */}
        <div className="absolute top-20 right-[-10%] w-96 h-96 rounded-full bg-brand-peach/20 filter blur-3xl" />
        <div className="absolute bottom-10 left-[-10%] w-96 h-96 rounded-full bg-brand-yellow/30 filter blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-orange bg-brand-peach-light">
                ✨ 萌點3D | 客製化與大量列印首選
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-dark leading-tight tracking-tight">
                把平面靈感 <br />
                變成觸手可及的 <span className="text-brand-orange bg-gradient-to-r from-brand-orange to-red-400 bg-clip-text text-transparent">3D 公仔</span>！
              </h1>
              <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                不論是您珍愛的寵物、自創的角色設計、AI生成的圖片，還是商務展示樣品，萌點3D 都能為您將想像還原，打造充滿溫度的專屬成品。
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/calculator"
                  className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-center"
                >
                  開始成本試算
                </Link>
                <Link
                  href="/showcase"
                  className="px-8 py-3.5 rounded-full text-base font-bold text-brand-orange bg-brand-peach-light hover:bg-brand-peach/30 transition-all duration-300 hover:scale-105 active:scale-95 text-center"
                >
                  觀看作品案例
                </Link>
              </div>

              {/* Q-chan Welcoming Bubble */}
              <div className="max-w-xl mx-auto lg:mx-0 pt-4">
                <QChan
                  image="/assets/qchan/q_wave.gif"
                  text="哈囉！我是萌點3D的看板娘 Q醬 🐾！不論是人像、貓貓狗狗還是你畫的角色，Q醬都可以用神奇的 3D 列印幫你變出來喔！想要知道大概要花多少錢嗎？點擊上面的「成本試算」跟 Q醬一起玩吧！"
                  position="left"
                  pulse={true}
                />
              </div>
            </div>

            {/* Mascot Visual Display */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px]">
                {/* Decorative frames */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-peach to-brand-yellow rounded-full filter blur-xl opacity-60 animate-pulse" />
                <div className="absolute inset-4 bg-white rounded-3xl shadow-xl overflow-hidden border border-brand-border flex items-center justify-center p-3 animate-float">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white">
                    <Image
                      src="/assets/qchan/q_wave.gif"
                      alt="萌點3D 吉祥物 Q醬 揮手問候"
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-2 -left-2 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-brand-border/60 flex items-center gap-2 animate-bounce">
                  <span className="text-xl">🐟</span>
                  <div className="text-left">
                    <p className="text-[10px] text-brand-muted font-bold">Q醬的最愛</p>
                    <p className="text-xs font-extrabold text-brand-dark">招牌鯛魚燒</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
              PRODUCT SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              我們為您提供的 3D 製作服務
            </h2>
            <p className="text-sm sm:text-base text-brand-muted font-medium">
              萌點3D 專注於公仔定製與列印，我們提供多元的服務項目，滿足您從個人收藏到企業量產的各式需求。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-brand-cream/35 border border-brand-border/40 hover:border-brand-orange/30 shadow-sm glass-hover flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${service.bg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-orange transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed font-medium">
                    {service.desc}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={`/products#service-${index}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-orange hover:text-brand-orange-hover"
                  >
                    暸解更多
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-brand-cream/30 border-y border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image banner */}
            <div className="relative w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-xl border border-brand-border">
              <Image
                src="/assets/q_jiang.jpg"
                alt="3D 列印公仔製造過程"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-1">
                  <span className="text-xs text-brand-yellow font-extrabold tracking-wider">安全材質 × 職人手工 × 價格透明</span>
                  <h3 className="text-xl font-bold">逐件細心修整，每一份紀念都安心交付</h3>
                </div>
              </div>
            </div>

            {/* Strengths text */}
            <div className="space-y-6">
              <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
                OUR ADVANTAGES
              </span>
              <h2 className="text-3xl font-extrabold text-brand-dark">
                為什麼選擇 萌點3D？
              </h2>
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed font-medium">
                我們深知每一個公仔對您而言都代表著一份回憶或心血。因此，我們堅守職人精神，讓每個成品都擁有各自特色！
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-brand-dark">複合基石材</h4>
                    <p className="text-sm text-brand-muted leading-relaxed font-medium">採用全彩石膏粉末列印，色彩直出飽和，適合展示與收藏。</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-brand-dark">可加購紀念禮品套組</h4>
                    <p className="text-sm text-brand-muted leading-relaxed font-medium">可加購玻璃罩與禮盒包裝，送出的不只是公仔，而是一份完整的紀念禮。</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-brand-dark">價格透明與彈性天數</h4>
                    <p className="text-sm text-brand-muted leading-relaxed font-medium">提供線上即時成本試算，無任何隱藏費用，急件可加價優先排程、縮短工期。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-gradient-to-tr from-brand-orange to-brand-peach text-white relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/10 filter blur-3xl" />
        <div className="absolute bottom-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-white/10 filter blur-3xl" />

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            準備好將您的想像化為實體了嗎？
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
            點擊下方按鈕，使用我們的線上成本試算工具。只需 30 秒，即可獲得預估的製作價格與工作天數！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/calculator"
              className="px-8 py-4 rounded-full text-base font-extrabold text-brand-orange bg-white hover:bg-brand-cream shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              免費估價試算 ➔
            </Link>
            <Link
              href="/inquiry"
              className="px-8 py-4 rounded-full text-base font-extrabold text-white border-2 border-white/80 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              直接填寫詢價單
            </Link>
          </div>
          <div className="pt-2 text-xs text-white/75 flex items-center justify-center gap-1.5 font-medium">
            <span>🐾</span> Q醬說：估價完成後可直接將資料帶入詢價單，非常方便唷！
          </div>
        </div>
      </section>
    </div>
  );
}
