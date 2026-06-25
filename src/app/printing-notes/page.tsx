import Link from "next/link";
import QChan from "@/components/QChan";

const noteSections = [
  {
    title: "照片準備建議",
    items: [
      "建議提供 1~3 人的照片，寵物亦可製作，但請避免主體過多影響辨識。",
      "1 張正面照即可製作；若能提供正面、45度、側面及喜愛的生活照（3+1張），效果最佳。",
      "請選擇光線均勻、畫質清晰、無濾鏡的照片。",
      "人物五官及特色請完整呈現，避免遮擋或僅有側臉照片。",
    ],
  },
  {
    title: "Q版公仔製作規範",
    items: [
      "建議以全身入鏡照片製作，站姿效果最佳。",
      "避免過細、懸空或複雜配件（如長笛、花束等），以提升耐用度。",
      "若有眼鏡、配件或特殊道具，將依結構安全性進行加粗或調整。",
      "欲製作持道具或戴眼鏡公仔，建議尺寸至少 8cm 以上。",
    ],
  },
  {
    title: "建模與結構調整說明",
    items: [
      "AI圖或照片皆須具備足夠視角資訊，缺少角度可能無法建模。",
      "細部結構將依3D列印需求優化，例如頭髮改浮雕、手指簡化、配件加粗等。",
      "為提高穩定度，底座、重心與支撐結構將依實際情況調整。",
      "建模完成後會提供模型圖確認。",
    ],
  },
  {
    title: "顏色與成品差異",
    items: [
      "受3D列印技術與材質限制，成品與照片或效果圖可能存在色差。",
      "特殊色、深色、淺褐色、白色等顏色表現皆可能與原圖不同。",
      "不同批次製作之公仔亦可能產生些微色彩差異。",
      "螢幕RGB與實體印刷CMYK色域不同，色差屬正常現象。",
      "因原料為複合基石材粉末材質，特性與樹脂材質具有差異性，成品會有柔焦的效果。",
    ],
  },
  {
    title: "AI效果圖說明",
    items: [
      "AI效果圖僅供示意參考，實際公仔將依3D列印工藝呈現。",
      "圖片中過細或懸空部件可能因生產需求進行調整。",
      "Q版公仔以可愛比例、頭大身小為主，不等同真人寫實雕像。",
      "效果圖越偏寫實，與成品的視覺落差可能越明顯。",
    ],
  },
];

const orderNotes = [
  "客戶需自行確認提供圖片之著作權與使用權。",
  "製作時將優先保留最具代表性的3~5項特色。",
  "大幅修改風格、比例或新增文字內容，可能需另行報價。",
  "成品相似度約可達原照片8~9成，將依照片品質而有所差異。",
  "完成付款後始安排製作。",
  "建模完成後可免費修改1次，再次修改將酌收費用。",
  "模型確認後，不得因主觀喜好因素取消訂單。",
  "若發生出貨前損壞、重大色差或與確認模型明顯不符，將協助重製。",
  "建議搭配玻璃罩收藏，可提升保護性與展示效果。",
];

export default function PrintingNotesPage() {
  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            PRINTING NOTES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            印製須知
          </h1>
          <p className="text-sm text-brand-muted font-medium leading-relaxed">
            Q版公仔與3D列印委託前，請先確認照片準備、建模結構、顏色差異與訂單規範，讓製作溝通更清楚。
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_ok.gif"
            text="送出委託前，可以先看過這份須知。照片越清楚、角度越完整，3D處理人員越能掌握人物或寵物的特色；正式製作前，我們也會依結構安全與列印條件進行必要調整。"
            position="left"
          />
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
          {noteSections.map((section, index) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-brand-border/60 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-brand-peach-light text-brand-orange font-black flex items-center justify-center text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-base font-black text-brand-dark">{section.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-xs sm:text-sm text-brand-muted leading-relaxed font-medium"
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-orange flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl border border-brand-border/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 rounded-full bg-brand-orange text-white font-black flex items-center justify-center text-sm">
              06
            </span>
            <h2 className="text-base font-black text-brand-dark">委託與訂單須知</h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orderNotes.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 text-xs sm:text-sm text-brand-muted leading-relaxed font-medium"
              >
                <span className="w-6 h-6 rounded-full bg-brand-cream text-brand-orange font-black flex items-center justify-center text-[11px] flex-shrink-0">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/showcase"
            className="px-6 py-3 rounded-full text-sm font-bold text-brand-orange bg-white border border-brand-orange/40 hover:bg-brand-peach-light transition-colors text-center"
          >
            返回作品案例
          </Link>
          <Link
            href="/process"
            className="px-6 py-3 rounded-full text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-sm transition-colors text-center"
          >
            查看製作流程
          </Link>
        </div>
      </div>
    </div>
  );
}
