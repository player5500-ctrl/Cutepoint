"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminGate, { getAdminKey } from "@/components/AdminGate";
import CaseManager from "@/components/CaseManager";
import ProductManager from "@/components/ProductManager";

interface Inquiry {
  id: string;
  createdAt: string;
  clientName: string;
  lineId: string;
  phone: string;
  email: string;
  productType: string;
  size: string;
  quantity: string;
  needModeling: boolean;
  needRetouching: boolean;
  complexity: string;
  isUrgent: boolean;
  needPackaging: boolean;
  estLow: number;
  estHigh: number;
  purpose: string;
  expectedDelivery: string;
  fileNames: string[];
  status: string;
  assignee: string;
  officialQuote: number;
  internalNotes: string;
}

const statusOptions = [
  "待回覆",
  "確認需求中",
  "已報價",
  "已成交",
  "未成交",
  "已取消",
];

const statusStyles: { [key: string]: string } = {
  "待回覆": "bg-red-50 text-red-700 border-red-200",
  "確認需求中": "bg-blue-50 text-blue-700 border-blue-200",
  "已報價": "bg-amber-50 text-amber-700 border-amber-200",
  "已成交": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "未成交": "bg-gray-100 text-gray-700 border-gray-200",
  "已取消": "bg-gray-50 text-gray-400 border-gray-200",
};

function AdminPanel() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部狀態");
  const [typeFilter, setTypeFilter] = useState("全部類別");
  
  // Edit Form State
  const [editStatus, setEditStatus] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editOfficialQuote, setEditOfficialQuote] = useState(0);
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Webhook Configuration State
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  // Fetch inquiries from API
  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries", {
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (e) {
      console.error("Failed to load inquiries", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
    const storedWebhook = localStorage.getItem("google_sheets_webhook_url");
    if (storedWebhook) {
      setWebhookUrl(storedWebhook);
    }
  }, []);

  const handleOpenEdit = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setEditStatus(inq.status);
    setEditAssignee(inq.assignee || "");
    setEditOfficialQuote(inq.officialQuote || 0);
    setEditInternalNotes(inq.internalNotes || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({
          status: editStatus,
          assignee: editAssignee,
          officialQuote: editOfficialQuote,
          internalNotes: editInternalNotes,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        // Update local state
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === selectedInquiry.id ? result.data : inq))
        );
        setSelectedInquiry(null);
      } else {
        alert("儲存失敗，請重試");
      }
    } catch (err) {
      console.error(err);
      alert("伺服器連線失敗");
    } finally {
      setSaving(false);
    }
  };

  const saveWebhookConfig = () => {
    localStorage.setItem("google_sheets_webhook_url", webhookUrl);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (inquiries.length === 0) return;

    const headers = [
      "詢價ID", "建立時間", "客戶姓名", "LINE ID", "電話", "Email",
      "產品類型", "尺寸", "數量", "是否建模", "是否修圖", "複雜度",
      "急件", "包裝", "預估低價", "預估高價", "用途", "期望交期",
      "上傳檔案連結", "詢價狀態", "負責人", "正式報價", "內部備註"
    ];

    const rows = inquiries.map((inq) => [
      inq.id,
      new Date(inq.createdAt).toLocaleString("zh-TW", { hour12: false }),
      inq.clientName,
      inq.lineId,
      `'${inq.phone}`, // prevent Excel truncating leading zeros
      inq.email,
      inq.productType,
      inq.size,
      inq.quantity,
      inq.needModeling ? "是" : "否",
      inq.needRetouching ? "是" : "否",
      inq.complexity,
      inq.isUrgent ? "是" : "否",
      inq.needPackaging ? "是" : "否",
      inq.estLow,
      inq.estHigh,
      inq.purpose,
      inq.expectedDelivery,
      inq.fileNames.join("; "),
      inq.status,
      inq.assignee,
      inq.officialQuote,
      inq.internalNotes
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 BOM
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `萌點3D_詢價單匯出_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stats
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === "待回覆").length;
  const conversionCount = inquiries.filter((i) => i.status === "已成交").length;
  const totalRevenue = inquiries.reduce((sum, i) => sum + (i.status === "已成交" ? i.officialQuote : 0), 0);
  const conversionRate = totalCount > 0 ? Math.round((conversionCount / totalCount) * 100) : 0;

  // Filters logic
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "全部狀態" || inq.status === statusFilter;
    const matchesType = typeFilter === "全部類別" || inq.productType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const googleAppsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 如果首行不是欄位名稱，則建立欄位
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "詢價ID", "建立時間", "客戶姓名", "LINE ID", "電話", "Email",
        "產品類型", "尺寸", "數量", "是否建模", "是否修圖", "複雜度",
        "急件", "包裝", "預估低價", "預估高價", "用途", "期望交期",
        "上傳檔案", "詢價狀態", "負責人", "正式報價", "內部備註"
      ]);
    }
    
    sheet.appendRow([
      data.inquiryId,
      data.createdAt,
      data.clientName,
      data.lineId,
      data.phone,
      data.email,
      data.productType,
      data.size,
      data.quantity,
      data.needModeling,
      data.needRetouching,
      data.complexity,
      data.isUrgent,
      data.needPackaging,
      data.estLow,
      data.estHigh,
      data.purpose,
      data.expectedDelivery,
      data.fileNames,
      data.status,
      data.assignee,
      data.officialQuote,
      data.internalNotes
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="w-full py-12 bg-[#F3F4F6] min-h-screen flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white border border-brand-border p-1 flex items-center justify-center shadow-sm">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-dark">萌點3D 後台管理系統</h1>
              <p className="text-xs text-brand-muted font-medium">歡迎使用詢價管理控制台，在這裡核對訂購明細並更新訂單狀態。</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              href="/admin/analytics"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm transition-all text-center"
            >
              📊 GA 數據
            </Link>
            <button
              onClick={() => setShowWebhookGuide(!showWebhookGuide)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm transition-all"
            >
              🔗 Google Sheets 串接指南
            </button>
            <button
              onClick={exportToCSV}
              disabled={inquiries.length === 0}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              📥 匯出 CSV 檔
            </button>
          </div>
        </div>

        {/* Google Sheet Webhook Sync Guide Drawer/Collapse */}
        {showWebhookGuide && (
          <div className="bg-white border border-brand-border p-6 rounded-3xl shadow-sm space-y-4 animate-bubble">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5">
                <span>🟢</span> Google Sheets 同步串接步驟
              </h3>
              <button
                onClick={() => setShowWebhookGuide(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                隱藏指南 ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-muted leading-relaxed font-semibold">
              <div className="space-y-3">
                <p className="font-bold text-brand-dark">步驟 1：建立 Apps Script Webapp</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>在您的 Google Sheet 頂部選單選擇「擴充功能 &gt; Apps Script」。</li>
                  <li>清空原本的代碼，並貼上右側的 JavaScript 程式碼。</li>
                  <li>點擊右上角的「部署 &gt; 新增部署」。</li>
                  <li>部署類型選擇「網頁應用程式」。</li>
                  <li>將說明設為「萌點3D 詢價接收」，「誰有權限存取」設為「**任何人** (Anyone)」。</li>
                  <li>點擊「部署」，授權 Google 權限，複製產生的「網頁應用程式 URL」。</li>
                </ol>
                
                <div className="pt-2 space-y-2">
                  <label className="block font-bold text-brand-dark">步驟 2：貼上 Webhook URL 配置同步</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-grow px-3 py-2 rounded-lg border border-gray-300 outline-none text-xs font-mono"
                    />
                    <button
                      onClick={saveWebhookConfig}
                      className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 font-bold"
                    >
                      {webhookSaved ? "已儲存！" : "確認儲存"}
                    </button>
                  </div>
                  <p className="text-[10px] text-brand-orange">儲存後，本地送出的新詢價單將會自動轉發寫入您的 Google Sheets！</p>
                </div>
              </div>

              {/* Code display */}
              <div className="space-y-1">
                <p className="font-bold text-brand-dark flex justify-between">
                  <span>Google Apps Script 原始碼</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(googleAppsScriptCode);
                      alert("代碼已複製到剪貼簿！");
                    }}
                    className="text-brand-orange hover:underline"
                  >
                    複製程式碼
                  </button>
                </p>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto font-mono text-[10px] text-gray-600 leading-normal">
                  {googleAppsScriptCode}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
            <span className="text-[10px] font-bold text-brand-muted tracking-wider block">總詢價件數</span>
            <span className="text-2xl font-black text-brand-dark mt-1 block">{totalCount} 件</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
            <span className="text-[10px] font-bold text-red-500 tracking-wider block">待處理回覆</span>
            <span className="text-2xl font-black text-red-600 mt-1 block">{pendingCount} 件</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider block">已成交總額</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">${totalRevenue.toLocaleString()} TWD</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
            <span className="text-[10px] font-bold text-brand-orange tracking-wider block">轉換成交率</span>
            <span className="text-2xl font-black text-brand-orange mt-1 block">{conversionRate} %</span>
          </div>
        </div>

        {/* Filters Table Container */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋姓名、編號、電話、Email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 outline-none text-xs bg-white focus:border-brand-orange"
              />
              <span className="absolute left-3 top-3 text-gray-400 text-xs">🔍</span>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs outline-none"
              >
                <option value="全部狀態">全部狀態</option>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs outline-none"
              >
                <option value="全部類別">全部類別</option>
                <option value="Q版人像公仔">Q版人像公仔</option>
                <option value="寵物公仔">寵物公仔</option>
                <option value="角色/AI圖轉公仔">角色/AI圖轉公仔</option>
                <option value="企業展示樣品">企業展示樣品</option>
                <option value="大量列印服務">大量列印服務</option>
                <option value="文創模型">文創模型</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-20 text-center text-xs text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4" />
              正在載入詢價單資料...
            </div>
          ) : filteredInquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">收件時間 / 編號</th>
                    <th className="p-4">客戶名稱</th>
                    <th className="p-4">產品類別 / 尺寸</th>
                    <th className="p-4">建模 / 急件</th>
                    <th className="p-4">預估價位</th>
                    <th className="p-4">正式報價</th>
                    <th className="p-4 text-center">狀態</th>
                    <th className="p-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-brand-dark bg-white">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-brand-cream/20 transition-colors">
                      <td className="p-4">
                        <p className="text-[10px] text-brand-muted">
                          {new Date(inq.createdAt).toLocaleString("zh-TW", { hour12: false })}
                        </p>
                        <p className="font-extrabold text-brand-dark tracking-wide">{inq.id}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{inq.clientName}</p>
                        <p className="text-[10px] text-brand-muted">LINE: {inq.lineId || "無"}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{inq.productType}</p>
                        <p className="text-[10px] text-brand-muted">
                          {inq.size} | {inq.quantity}
                        </p>
                      </td>
                      <td className="p-4 space-y-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mr-1 ${
                          inq.needModeling ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"
                        }`}>
                          {inq.needModeling ? "需建模" : "已有模型"}
                        </span>
                        {inq.isUrgent && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 animate-pulse">
                            急件⚡
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-500">
                        ${inq.estLow.toLocaleString()} ~ ${inq.estHigh.toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-brand-dark">
                        {inq.officialQuote > 0 ? `$${inq.officialQuote.toLocaleString()}` : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black ${statusStyles[inq.status] || "bg-gray-50 text-gray-400"}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(inq)}
                          className="px-3 py-1.5 rounded-lg border border-brand-orange text-brand-orange hover:bg-brand-peach-light/45 transition-colors font-bold text-[11px]"
                        >
                          處理 ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center text-xs text-gray-400">
              🔍 找不到符合篩選條件的詢價單
            </div>
          )}
        </div>

        {/* 作品案例管理區塊 */}
        <CaseManager />

        {/* 產品服務管理區塊 */}
        <ProductManager />
      </div>

      {/* Edit Detail Modal Dialog */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-brand-border max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-bubble">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-brand-dark">處理詢價訂單 {selectedInquiry.id}</h3>
                <p className="text-[10px] text-brand-muted">
                  收件時間：{new Date(selectedInquiry.createdAt).toLocaleString("zh-TW", { hour12: false })}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold leading-relaxed">
              
              {/* Left Column: Client Submission Specs */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold text-brand-orange tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                    👤 1. 客戶聯絡資料
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-brand-muted">
                    <div>
                      <span className="block text-[10px] text-gray-400">姓名</span>
                      <span className="text-brand-dark font-bold text-sm">{selectedInquiry.clientName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">LINE ID</span>
                      <span className="text-brand-dark font-bold text-sm">{selectedInquiry.lineId || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">電話號碼</span>
                      <span className="text-brand-dark font-bold">{selectedInquiry.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">Email</span>
                      <span className="text-brand-dark font-bold">{selectedInquiry.email || "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-brand-orange tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                    🛍 2. 訂製產品規格
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-brand-muted">
                    <div>
                      <span className="block text-[10px] text-gray-400">產品類型</span>
                      <span className="text-brand-dark font-bold">{selectedInquiry.productType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">尺寸高長</span>
                      <span className="text-brand-dark font-bold">{selectedInquiry.size}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">委託數量</span>
                      <span className="text-brand-dark font-bold">{selectedInquiry.quantity}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">模型複雜度</span>
                      <span className="text-brand-dark font-bold">{selectedInquiry.complexity}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">建模 / 修圖需求</span>
                      <span className="text-brand-dark font-bold">
                        {selectedInquiry.needModeling ? "需要建模" : "不需建模"} | {selectedInquiry.needRetouching ? "需要修圖" : "不需修圖"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">急件 / 包裝加購</span>
                      <span className="text-brand-dark font-bold">
                        {selectedInquiry.isUrgent ? "是 (急件⚡)" : "否"} | {selectedInquiry.needPackaging ? "是 (包裝🎁)" : "否"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-gray-400">線上預估低價 ~ 高價</span>
                      <span className="text-brand-orange font-bold text-sm">
                        ${selectedInquiry.estLow.toLocaleString()} ~ ${selectedInquiry.estHigh.toLocaleString()} TWD
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-brand-orange tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                    📝 3. 用途與檔案說明
                  </h4>
                  <div className="space-y-3 text-brand-muted">
                    <div>
                      <span className="block text-[10px] text-gray-400">委託用途</span>
                      <p className="text-brand-dark font-bold">{selectedInquiry.purpose || "未填寫"}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">期望交期</span>
                      <p className="text-brand-dark font-bold">{selectedInquiry.expectedDelivery || "未填寫"}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">客戶上傳檔案 ({selectedInquiry.fileNames.length})</span>
                      {selectedInquiry.fileNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedInquiry.fileNames.map((fn, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-lg border border-gray-200 text-gray-700 text-[10px] font-mono">
                              📄 {fn}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 font-bold">無檔案上傳</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Admin Management Action Form */}
              <form onSubmit={handleSaveEdit} className="bg-brand-cream/35 border border-brand-border p-6 rounded-3xl space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-5">
                  <h4 className="text-xs font-extrabold text-brand-dark tracking-wider uppercase pb-1 border-b border-gray-200">
                    🛠 4. 內部管理表單
                  </h4>

                  {/* Inquiry Status */}
                  <div className="space-y-1">
                    <label htmlFor="editStatus" className="text-[10px] text-gray-400 block font-bold">詢價處理狀態</label>
                    <select
                      id="editStatus"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs outline-none focus:border-brand-orange"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1">
                    <label htmlFor="editAssignee" className="text-[10px] text-gray-400 block font-bold">指派負責人</label>
                    <input
                      id="editAssignee"
                      type="text"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      placeholder="例如：陳設計師、李彩繪師"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 outline-none text-xs bg-white focus:border-brand-orange"
                    />
                  </div>

                  {/* Official Quote */}
                  <div className="space-y-1">
                    <label htmlFor="editOfficialQuote" className="text-[10px] text-gray-400 block font-bold">正式合約報價 (TWD)</label>
                    <input
                      id="editOfficialQuote"
                      type="number"
                      value={editOfficialQuote}
                      onChange={(e) => setEditOfficialQuote(Number(e.target.value))}
                      placeholder="填入最終正式確認報價"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 outline-none text-xs bg-white font-bold focus:border-brand-orange"
                    />
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-1">
                    <label htmlFor="editInternalNotes" className="text-[10px] text-gray-400 block font-bold">內部備註 (僅管理端可見)</label>
                    <textarea
                      id="editInternalNotes"
                      rows={4}
                      value={editInternalNotes}
                      onChange={(e) => setEditInternalNotes(e.target.value)}
                      placeholder="例如：客戶已付款、確認細節修改、快遞包裝需特別加固..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none text-xs bg-white leading-relaxed focus:border-brand-orange"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="flex-1 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold"
                  >
                    取消關閉
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {saving ? "正在儲存..." : "儲存修改"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminPanel />
    </AdminGate>
  );
}
