import Image from "next/image";
import Link from "next/link";
import QChan from "@/components/QChan";

export default function AboutPage() {
  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            ABOUT US
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            關於 萌點3D
          </h1>
          <p className="text-sm text-brand-muted font-medium">
            我們用 3D 科技，為您留下指尖最溫柔的立體記憶。
          </p>
        </div>

        {/* Mascot Origin Grid */}
        <div className="bg-white rounded-3xl border border-brand-border/60 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Visual of Q-chan */}
          <div className="lg:col-span-5 relative bg-brand-cream/40 h-[300px] lg:h-full flex items-center justify-center p-8">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-brand-border shadow-md bg-white">
              <Image
                src="/assets/q_jiang.jpg"
                alt="Q醬 在萌點3D 工作室"
                fill
                className="object-cover"
              />
            </div>
            {/* Mascot label */}
            <div className="absolute bottom-6 bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
              Chief Mascot Officer 🐾
            </div>
          </div>

          {/* Story Content */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 space-y-6">
            <h2 className="text-2xl font-black text-brand-dark flex items-center gap-2">
              <span className="text-brand-orange">🐱</span> 吉祥物「Q醬」的故事
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-brand-muted leading-relaxed font-medium">
              <p>
                「Q醬」是一隻住在我們 3D 創客工作室的灰白短毛貓，頭上戴著一個白色的「Q」字髮夾，脖子上繫著一條俏皮的橘色點點領巾，平時最喜歡咬著鯛魚燒在 3D 列印機前巡邏。
              </p>
              <p>
                在工作室裡，Q醬 除了是大家的開心果，也擔任「首要品管導覽員」。她常常在設計師建模時，趴在手繪板旁監督；當列印機嘎嘎運作時，她則會好奇地盯著平台看。
              </p>
              <p>
                「每個公仔都有靈魂，就像每隻貓咪都有自己的個性一樣！」這就是 Q醬 帶領我們團隊以專業技術修模的初衷。我們相信，透過 Q醬 活潑溫馨的引導，客製公仔將不再是遙遠冰冷的科技，而是暖心、充滿歡樂的體驗。
              </p>
            </div>
            
            {/* Voice bubble by Q-chan */}
            <div className="pt-2">
              <QChan
                image="/assets/qchan/q_qa.gif"
                text="嘻嘻，沒錯！Q醬 每天都有在認真上班督促設計師哥哥姐姐唷🐾！如果做出來的公仔不夠可愛，Q醬 是不會放行的！我的鯛魚燒就是我的品管印章喔！"
                position="right"
              />
            </div>
          </div>
        </div>

        {/* Team Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm text-center space-y-3">
            <span className="text-3xl block">🎨</span>
            <h3 className="text-lg font-bold text-brand-dark">專業修模</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold">
              每個公仔從臉部神韻到姿態重心，皆運用專業修模技術調整，讓作品不只是像，更帶著本人的神采與溫度。
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm text-center space-y-3">
            <span className="text-3xl block">🔬</span>
            <h3 className="text-lg font-bold text-brand-dark">科技支持</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold">
              採用工業級全彩石膏粉末列印，色彩直接成型免上色。配合嚴謹的後處理與出貨品管檢查，給您最安全、色彩飽和的成品。
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm text-center space-y-3">
            <span className="text-3xl block">💬</span>
            <h3 className="text-lg font-bold text-brand-dark">透明貼心的溝通</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold">
              客製化最怕做出來與期望不符。因此在「3D建模與核對」階段，我們會提供多角度模擬圖讓您確認，百分之百滿意後才正式印製。
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center pt-8">
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md transition-all hover:scale-105 active:scale-95"
          >
            去試算，跟 Q醬 一起作公仔！
          </Link>
        </div>
      </div>
    </div>
  );
}
