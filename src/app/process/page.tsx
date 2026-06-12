import Link from "next/link";
import Image from "next/image";
import QChan from "@/components/QChan";

const steps = [
  {
    step: "01",
    title: "需求評估與估價",
    desc: "使用我們的線上成本試算工具初步了解預算，填寫詢價表單上傳平面照片或 3D 檔案。專業團隊將在 24 小時內與您聯繫，詳細溝通尺寸、細節與正式報價。",
    icon: "/assets/qchan/q_fill.gif",
  },
  {
    step: "02",
    title: "簽訂合約與付定",
    desc: "確認需求無誤後，雙方簽署客製化委託合約，確保工期與雙方權益。支付 50% 定金後，我們便會安排建模與機器排程，正式啟動專案！",
    icon: "/assets/qchan/q_ok.gif",
  },
  {
    step: "03",
    title: "3D 建模與核對",
    desc: "我們會進行建模或修模。完成後提供三維渲染圖（正面、側面、背面及局部細節）給您核對。我們提供數次免費微調，確保神韻符合期望！",
    icon: "/assets/qchan/q_upload.gif",
  },
  {
    step: "04",
    title: "工業級全彩石膏3D列印",
    desc: "模型確認後進行切片，使用工業級全彩石膏粉末設備進行印製。印製完成後進行後處理。",
    icon: "/assets/qchan/q_making.gif",
  },
  {
    step: "05",
    title: "安全包裝與送達",
    desc: "成品通過出廠品管後，以高強度防震氣泡防護材料妥善包裹，放入 Q醬 客製紙盒與精美禮品袋中。寄出後提供追蹤單號，或提供工作室面交自取。開箱即見您心愛的公仔！",
    icon: "/assets/qchan/q_ship.gif",
  },
];

export default function ProcessPage() {
  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            WORKFLOW
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            3D 公仔製作流程
          </h1>
          <p className="text-sm text-brand-muted font-medium">
            從平面到立體，我們有一套嚴謹且注重溝通的製作工藝流程，確保您的公仔以最高規格呈現。
          </p>
        </div>

        {/* Q-chan guidance bubble */}
        <div className="max-w-3xl mx-auto mb-16">
          <QChan
            image="/assets/qchan/q_upload.gif"
            text={`很多第一次訂製公仔的客人，會擔心不知道做出來會長怎樣。放心！在步驟 03【3D建模與核對】時，師傅會提供正反左右的 3D 模擬圖給你看，你要看過滿意了，我們才會真的按下列印鈕喔🐾！\n交給 萌點3D，就是這麼安心可靠！`}
            position="left"
          />
        </div>

        {/* Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical central line (Desktop) */}
          <div className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-1 bg-brand-peach/30 transform md:-translate-x-1/2 rounded-full" />

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={step.step}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Step badge overlaying the line */}
                  <div className="absolute left-0 md:left-1/2 top-0 transform md:-translate-x-1/2 flex items-center justify-center z-10">
                    <div className="w-[64px] h-[64px] rounded-full bg-white border-4 border-brand-orange flex items-center justify-center text-lg font-black text-brand-orange shadow-md">
                      {step.step}
                    </div>
                  </div>

                  {/* Left / Right content placeholder spacing */}
                  <div className="hidden md:block w-1/2" />

                  {/* Actual Step Card */}
                  <div className="w-full md:w-[45%] pl-20 md:pl-0 space-y-3">
                    <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <Image src={step.icon} alt={step.title} width={48} height={48} className="rounded-full border border-brand-orange/40 bg-white" />
                        <h3 className="text-lg font-black text-brand-dark">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center max-w-md mx-auto p-6 bg-white rounded-3xl border border-brand-border/60 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-brand-dark">準備好邁出第一步了嗎？</h3>
          <p className="text-xs text-brand-muted font-medium">使用估價器快速試算，或直接填單，Q醬 將為您排定諮詢時程。</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/calculator"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-sm transition-all"
            >
              去成本試算
            </Link>
            <Link
              href="/inquiry"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-brand-orange bg-brand-peach-light hover:bg-brand-peach/30 transition-all"
            >
              直接填詢價單
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
