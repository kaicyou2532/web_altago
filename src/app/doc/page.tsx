export default function DocPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Document</p>
          <h1 className="text-2xl font-black text-gray-950">altago 企画ドキュメント</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <iframe
            src="https://docs.google.com/document/d/1vc8dVX4NnMhrBUBq1udKzgpGkyWtbGgFTS2Irqx6oPM/preview"
            className="w-full"
            style={{ height: 'calc(100vh - 180px)', minHeight: '600px', border: 'none' }}
            title="altago 企画ドキュメント"
          />
        </div>
        <div className="mt-4 text-right">
          <a
            href="https://docs.google.com/document/d/1vc8dVX4NnMhrBUBq1udKzgpGkyWtbGgFTS2Irqx6oPM/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Google Docs で開く →
          </a>
        </div>
      </div>
    </div>
  );
}
