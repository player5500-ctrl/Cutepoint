import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-border/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-white border border-brand-border/40 p-0.5 flex items-center justify-center shadow-sm">
                <Image
                  src="/assets/logo.png"
                  alt="萌點3D Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-brand-dark tracking-wider">
                萌點3D
              </span>
            </div>
            <p className="text-sm text-brand-muted max-w-sm leading-relaxed">
              把最珍貴的靈感實體化！不論是可愛的 Q 版人像、最愛的寵物，還是獨特的人設公仔，萌點3D 以專業的技術與暖心的熱忱，為您打造獨一無二、值得珍藏的 3D 成品。
            </p>
            <div className="flex items-center gap-2.5 text-xs text-brand-orange font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              Q醬與專業團隊，全心為您服務！
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-brand-dark tracking-wider uppercase mb-4">
              探索服務
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className="text-sm text-brand-muted hover:text-brand-orange transition-colors">
                  產品類別
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-sm text-brand-muted hover:text-brand-orange transition-colors">
                  成本試算器
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="text-sm text-brand-muted hover:text-brand-orange transition-colors">
                  作品案例
                </Link>
              </li>
              <li>
                <Link href="/process" className="text-sm text-brand-muted hover:text-brand-orange transition-colors">
                  製作流程
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-sm font-bold text-brand-dark tracking-wider uppercase mb-4">
              聯絡我們
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-muted">
              <li className="flex items-center gap-2">
                <span className="text-brand-orange">LINE ID:</span>
                <span className="hover:text-brand-orange cursor-pointer">@cutepoint3d</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-orange">電話:</span>
                <span>02-2345-6789</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-orange">Email:</span>
                <a href="mailto:service@cutepoint3d.com" className="hover:text-brand-orange transition-colors">
                  service@cutepoint3d.com
                </a>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-brand-orange flex-shrink-0">地址:</span>
                <span className="leading-snug">台北市信義區信義路五段 7 號 88 樓 (101大樓)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-brand-border/40 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} 萌點3D 創客工作室 Cutepoint 3D Studio. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-brand-muted">
            <Link href="/admin" className="hover:text-brand-orange transition-colors underline font-medium">
              管理後台
            </Link>
            <span className="text-brand-border">|</span>
            <span className="text-brand-muted">本網站初步估價僅供參考，實際價格以正式報價單為準。</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
