const statusRows = [
  { section: 'システム' },
  { label: '稼働時間', value: '3日 08時間 21分 44秒' },
  { label: 'ファームウェアバージョン', value: '1.08' },
  { section: '無線設定 (2.4GHz)' },
  { label: '動作モード', value: 'AP' },
  { label: '無線', value: '2.4 GHz (b/g/n)' },
  { label: 'SSID', value: 'router-demo-2G' },
  { label: 'チャンネル', value: '11' },
  { label: '暗号化', value: 'WPA2-PSK (AES)' },
  { label: 'MACアドレス', value: '00:0d:4a:51:96:10' },
  { label: '接続台数', value: '4' },
  { section: 'LAN設定' },
  { label: 'IPアドレス', value: '192.168.2.1' },
  { label: 'サブネットマスク', value: '255.255.255.0' },
  { label: 'デフォルトゲートウェイ', value: '192.168.2.1' },
  { label: 'DHCPサーバ', value: '有効' },
  { label: 'MACアドレス', value: '00:0d:4a:51:96:11' },
  { section: 'WAN設定' },
  { label: 'IPアドレス', value: '0.0.0.0' },
  { label: 'サブネットマスク', value: '0.0.0.0' },
  { label: 'デフォルトゲートウェイ', value: '0.0.0.0' },
  { label: 'DNSサーバ', value: '0.0.0.0' },
  { label: 'MACアドレス', value: '00:0d:4a:51:96:01' },
];

const menuItems = [
  '基本設定',
  '無線詳細設定',
  'ファームウェア更新',
  'ステータス',
  'パスワード設定',
];

export default function RouterDemoPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#e7e7e7] px-3 py-5 text-[12px] text-[#222] sm:px-5">
      <div className="mx-auto max-w-[980px] border border-[#95aa58] bg-white shadow-[0_3px_10px_rgba(0,0,0,0.25)]">
        <div className="flex h-9 items-center border-b border-[#86a43f] bg-[#9cc25d] px-2">
          <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#1a73ad] bg-[#2f9ed9] text-[20px] font-bold leading-none text-white">
            ‹
          </div>
          <div className="mr-1 h-5 w-5 rounded-full border border-[#8bae45] bg-[#bad875]" />
          <div className="flex h-6 min-w-0 flex-1 items-center border border-[#a6a6a6] bg-white px-2 text-[11px] text-[#4774a4]">
            http://setup.local/home.htm
          </div>
          <div className="ml-2 hidden h-6 w-44 items-center border border-[#a6a6a6] bg-[#efefef] px-2 text-[11px] sm:flex">
            WRH-5838 x
          </div>
          <div className="ml-auto hidden gap-2 px-2 text-[15px] text-white sm:flex">
            <span>⌂</span>
            <span>★</span>
            <span>⚙</span>
          </div>
        </div>

        <div className="min-h-[610px] bg-white px-4 pb-8 pt-7 sm:px-6">
          <header className="mb-5 border-b-[5px] border-[#23618c] pb-3">
            <div className="grid grid-cols-[150px_1fr] items-end gap-3 sm:grid-cols-[220px_1fr]">
              <div className="font-sans text-[19px] font-black tracking-[-0.03em] text-[#1c6ca8]">
                ROUTER
              </div>
              <div className="pb-1 text-[14px] font-bold text-[#333]">
                アクセスポイントモードで動作中
              </div>
            </div>
          </header>

          <div className="grid gap-7 sm:grid-cols-[190px_1fr]">
            <aside className="pl-1 pt-4">
              <div className="mb-3 text-[12px] text-[#555]">WRH-5838シリーズ</div>
              <nav className="space-y-1 font-bold leading-[1.35] text-[#222]">
                {menuItems.map((item) => (
                  <div key={item} className="flex items-center">
                    <span className="mr-1 inline-block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-black" />
                    <span>{item}</span>
                  </div>
                ))}
              </nav>

              <div className="mt-8 space-y-2 font-bold text-[#555]">
                <div>言語設定</div>
                <label className="block">
                  <span className="sr-only">言語</span>
                  <select className="h-6 w-24 border border-[#9a9a9a] bg-white px-1 text-[12px]">
                    <option>日本語</option>
                    <option>English</option>
                  </select>
                </label>
              </div>
            </aside>

            <section className="max-w-[540px] pt-2">
              <h1 className="mb-4 bg-[#1f5d90] px-2 py-1 text-[20px] font-bold leading-none text-white">
                ステータス
              </h1>
              <p className="mb-2 text-[12px]">本製品のシステム情報を表示します。</p>

              <table className="w-full border-collapse border border-[#8b8b8b] text-[12px] leading-[1.15]">
                <tbody>
                  {statusRows.map((row, index) =>
                    'section' in row ? (
                      <tr key={`${row.section}-${index}`}>
                        <th
                          colSpan={2}
                          className="border border-[#8b8b8b] bg-[#202020] px-2 py-[3px] text-left font-bold text-white"
                        >
                          {row.section}
                        </th>
                      </tr>
                    ) : (
                      <tr key={`${row.label}-${index}`}>
                        <th className="w-1/2 border border-[#8b8b8b] bg-[#f4f4f4] px-2 py-[3px] text-left font-bold">
                          {row.label}
                        </th>
                        <td className="border border-[#8b8b8b] bg-white px-2 py-[3px]">
                          {row.value}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
