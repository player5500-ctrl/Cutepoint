import Link from "next/link";
import Image from "next/image";
import QChan from "@/components/QChan";

const products = [
  {
    id: "chibi",
    name: "Q版人像公仔",
    desc: "把您或親友的照片，轉化為風格活潑、五官討喜的 Q 版立體公仔。最適合婚禮小物、生日賀禮、畢業紀念或個人收藏。",
    specs: [
      { label: "建議尺寸", value: "8cm / 10cm / 12cm" },
      { label: "建模需求", value: "通常需要 (由提供之 2D 照片進行 3D 建模)" },
      { label: "製作天數", value: "約 10 - 15 個工作天" },
      { label: "注意事項", value: "照片請儘量提供正側面、清晰且五官輪廓無遮擋之影像。" },
    ],
    bg: "bg-brand-peach-light",
    tagColor: "text-brand-orange bg-brand-peach-light",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "pet",
    name: "寵物公仔",
    desc: "為您心愛的貓咪、狗狗或各類毛孩製作專屬的仿真或萌化公仔。精細雕琢毛流細節與神情，讓可愛的身影永遠陪伴身旁。",
    specs: [
      { label: "建議尺寸", value: "6cm / 8cm / 10cm" },
      { label: "建模需求", value: "通常需要 (需手工雕琢寵物獨特神韻)" },
      { label: "製作天數", value: "約 12 - 18 個工作天" },
      { label: "注意事項", value: "歡迎提供多角度的毛色細節照，有助於手繪上色時更精準還原。" },
    ],
    bg: "bg-brand-yellow-light",
    tagColor: "text-amber-600 bg-brand-yellow-light",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "ai-character",
    name: "角色/AI圖轉公仔",
    desc: "無論是自創的插畫人設、二次元角色，還是近期透過 Midjourney / Stable Diffusion 等 AI 生成的精美圖像，我們都能將 2D 平面視覺轉化為高品質的 3D 立體模型！",
    specs: [
      { label: "建議尺寸", value: "10cm / 12cm / 15cm / 18cm" },
      { label: "建模需求", value: "需要 (從平面圖像建立完整三維骨架與面網)" },
      { label: "製作天數", value: "約 14 - 20 個工作天" },
      { label: "注意事項", value: "若有細部設定(如背面、配件)請一併附上，或由我們的雕塑師為您做延伸設計。" },
    ],
    bg: "bg-orange-50",
    tagColor: "text-brand-orange bg-orange-100",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "corporate",
    name: "企業展示樣品",
    desc: "專為企業品牌設計！包含品牌吉祥物實體化、產品結構原型、展覽大型公仔樣品等。提供高精度、高強度的展示級模型製作服務。",
    specs: [
      { label: "建議尺寸", value: "15cm / 18cm 或更大客製規格" },
      { label: "建模需求", value: "視情況 (若有原廠 3D CAD 檔則不需重新建模)" },
      { label: "製作天數", value: "約 7 - 14 個工作天" },
      { label: "注意事項", value: "可提供 STEP、IGS、STL 等工業格式檔案進行直接處理與列印。" },
    ],
    bg: "bg-brand-peach-light/40",
    tagColor: "text-pink-600 bg-pink-50",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "bulk",
    name: "大量列印服務",
    desc: "針對文創商品、工作室配件、學生畢業製作或桌遊棋子等，提供小批量或大批量的快速代印服務。多台設備同時運作，確保產能與速度。",
    specs: [
      { label: "適用尺寸", value: "6cm ~ 18cm 皆可" },
      { label: "建模需求", value: "不需要 (客戶需自行提供 STL/OBJ 格式之 3D 檔案)" },
      { label: "製作天數", value: "視數量而定 (3 - 10 工作天起)" },
      { label: "注意事項", value: "請確保提供的檔案已完成閉合(Manifold)，且無破面結構。" },
    ],
    bg: "bg-brand-yellow-light/40",
    tagColor: "text-yellow-700 bg-yellow-100",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "modeling-retouch",
    name: "3D 建模與修圖服務",
    desc: "若您已有 3D 檔案，但有破面、厚度不足、無法列印等問題；或是您僅有手稿，需要尋求專業建模，我們的 3D 雕塑師皆能為您進行調整、減面、拆件或全新建模。",
    specs: [
      { label: "服務內容", value: "STL修復、照片建 3D 檔、工業圖轉雕塑檔、拆件與掏空" },
      { label: "建模需求", value: "為此項服務之核心" },
      { label: "製作天數", value: "約 3 - 7 個工作天" },
      { label: "注意事項", value: "此服務僅包含數位 3D 檔案之交付，若需實體列印請於估價時加選列印。" },
    ],
    bg: "bg-emerald-50",
    tagColor: "text-emerald-600 bg-emerald-100",
    image: "/assets/q_jiang.jpg",
  },
];

export default function ProductsPage() {
  return (
    <div className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            CATEGORIES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark">
            產品與服務類別
          </h1>
          <p className="text-sm sm:text-base text-brand-muted font-medium">
            點擊各類別下方的試算按鈕，可以將該類別預設帶入成本估價器中，快速得出價格範圍唷！
          </p>
        </div>

        {/* Q-chan Mascot guide */}
        <div className="max-w-3xl mx-auto mb-16">
          <QChan
            image="/assets/qchan/q_board.gif"
            text="主打的產品都在這裡囉！我們提供 6 大服務項目，每一件作品都是職人一筆一筆細心刻劃的心意。現在我們全力聚焦在人偶與寵物的製作，想把你最珍惜的模樣好好留下來！快來看看哪一個項目符合你的需要吧 ✨"
            position="left"
          />
        </div>

        {/* Product Cards Layout */}
        <div className="space-y-12">
          {products.map((product, idx) => (
            <div
              key={product.id}
              id={`service-${idx}`}
              className="bg-white rounded-3xl border border-brand-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Product Visual */}
              <div className="lg:col-span-4 relative bg-brand-cream/40 min-h-[260px] flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-brand-border/40">
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-inner border border-brand-border">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black ${product.tagColor}`}>
                  NO.0{idx + 1}
                </div>
              </div>

              {/* Product Info */}
              <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-dark flex items-center gap-3">
                    {product.name}
                  </h2>
                  <p className="text-sm sm:text-base text-brand-muted leading-relaxed font-medium">
                    {product.desc}
                  </p>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-border/40">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col space-y-1">
                        <span className="text-xs font-extrabold text-brand-orange tracking-wider">{spec.label}</span>
                        <span className="text-sm text-brand-dark font-medium leading-relaxed">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculator link */}
                <div className="pt-4 flex justify-end">
                  <Link
                    href={`/calculator?type=${encodeURIComponent(product.name)}`}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-extrabold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    試算此項目費用 ➔
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
